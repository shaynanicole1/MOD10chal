const inquirer = require('inquirer');
const db = require('./db/connection');

async function mainMenu() {
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        'View all departments',
        'View all roles',
        'View all employees',
        'Add a department',
        'Add a role',
        'Add an employee',
        'Update an employee role',
        'Exit'
      ]
    }
  ]);

  switch (action) {
    case 'View all departments': return viewDepartments();
    case 'View all roles': return viewRoles();
    case 'View all employees': return viewEmployees();
    case 'Add a department': return addDepartment();
    case 'Add a role': return addRole();
    case 'Add an employee': return addEmployee();
    case 'Update an employee role': return updateEmployeeRole();
    case 'Exit':
      await db.end();
      console.log('Goodbye!');
      process.exit();
  }
}

async function viewDepartments() {
  try {
    const result = await db.query('SELECT * FROM department');
    console.table(result.rows);
  } catch (err) {
    console.error('Error viewing departments:', err);
  }
  mainMenu();
}

async function viewRoles() {
  try {
    const result = await db.query(`
      SELECT role.id, role.title, department.name AS department, role.salary
      FROM role
      JOIN department ON role.department_id = department.id
    `);
    console.table(result.rows);
  } catch (err) {
    console.error('Error viewing roles:', err);
  }
  mainMenu();
}

async function viewEmployees() {
  try {
    const result = await db.query(`
      SELECT e.id, e.first_name, e.last_name, role.title AS job_title, department.name AS department, role.salary,
        CONCAT(m.first_name, ' ', m.last_name) AS manager
      FROM employee e
      JOIN role ON e.role_id = role.id
      JOIN department ON role.department_id = department.id
      LEFT JOIN employee m ON e.manager_id = m.id
    `);
    console.table(result.rows);
  } catch (err) {
    console.error('Error viewing employees:', err);
  }
  mainMenu();
}

async function addDepartment() {
  const { name } = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Enter department name:'
    }
  ]);

  try {
    await db.query('INSERT INTO department (name) VALUES ($1)', [name]);
    console.log('Department added!');
  } catch (err) {
    console.error('Error adding department:', err);
  }
  mainMenu();
}

async function addRole() {
  try {
    const departments = await db.query('SELECT * FROM department');
    if (departments.rows.length === 0) {
      console.log('No departments found. Add a department first.');
      return mainMenu();
    }

    const answers = await inquirer.prompt([
      { type: 'input', name: 'title', message: 'Enter role title:' },
      {
        type: 'input',
        name: 'salary',
        message: 'Enter role salary:',
        validate: input => !isNaN(input) || 'Please enter a number'
      },
      {
        type: 'list',
        name: 'department_id',
        message: 'Choose department:',
        choices: departments.rows.map(dep => ({
          name: dep.name,
          value: dep.id
        }))
      }
    ]);

    await db.query(
      'INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)',
      [answers.title, answers.salary, answers.department_id]
    );

    console.log('Role added!');
  } catch (err) {
    console.error('Error adding role:', err);
  }
  mainMenu();
}

async function addEmployee() {
  try {
    const roles = await db.query('SELECT * FROM role');
    const employees = await db.query('SELECT * FROM employee');

    const answers = await inquirer.prompt([
      { type: 'input', name: 'first_name', message: 'Enter first name:' },
      { type: 'input', name: 'last_name', message: 'Enter last name:' },
      {
        type: 'list',
        name: 'role_id',
        message: 'Select role:',
        choices: roles.rows.map(role => ({
          name: role.title,
          value: role.id
        }))
      },
      {
        type: 'list',
        name: 'manager_id',
        message: 'Select manager:',
        choices: [{ name: 'None', value: null }].concat(
          employees.rows.map(emp => ({
            name: `${emp.first_name} ${emp.last_name}`,
            value: emp.id
          }))
        )
      }
    ]);

    await db.query(
      'INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)',
      [answers.first_name, answers.last_name, answers.role_id, answers.manager_id]
    );

    console.log('Employee added!');
  } catch (err) {
    console.error('Error adding employee:', err);
  }
  mainMenu();
}

async function updateEmployeeRole() {
  try {
    const employees = await db.query('SELECT * FROM employee');
    const roles = await db.query('SELECT * FROM role');

    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'employee_id',
        message: 'Select employee to update:',
        choices: employees.rows.map(emp => ({
          name: `${emp.first_name} ${emp.last_name}`,
          value: emp.id
        }))
      },
      {
        type: 'list',
        name: 'role_id',
        message: 'Select new role:',
        choices: roles.rows.map(role => ({
          name: role.title,
          value: role.id
        }))
      }
    ]);

    await db.query(
      'UPDATE employee SET role_id = $1 WHERE id = $2',
      [answers.role_id, answers.employee_id]
    );

    console.log('Employee role updated!');
  } catch (err) {
    console.error('Error updating employee role:', err);
  }
  mainMenu();
}

mainMenu();
