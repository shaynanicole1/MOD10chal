-- Create database
CREATE DATABASE employee_tracker;
\c employee_tracker


-- Create departments table
CREATE TABLE department (
    id serial PRIMARY KEY,
    name: VARCHAR(30) UNIQUE NOT NULL
);

-- Create roles table
CREATE TABLE role (
    id SERIAL PRIMARY KEY,
    title VARCHAR(30) UNIQUE NOT NULL,
    salary DECIMAL NOT NULL,
    department_id INTEGER NOT NULL
);

-- Create employees table
CREATE TABLE employee (
    id SERIAL PRIMARY KEY, 
    first_name VARCHAR(30) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    role_id INTEGER NOT NULL,
    manager_id INTEGER,
);
-- View all departments
SELECT id, name FROM department;

-- View all roles
SELECT 
    role.id, 
    role.title, 
    department.name AS department, 
    role.salary
FROM role
JOIN department ON role.department_id = department.id;

-- View all employees
SELECT 
    e.id,
    e.first_name,
    e.last_name,
    role.title AS job_title,
    department.name AS department,
    role.salary,
    CONCAT(m.first_name, ' ', m.last_name) AS manager
FROM employee e
JOIN role ON e.role_id = role.id
JOIN department ON role.department_id = department.id
LEFT JOIN employee m ON e.manager_id = m.id;
-- Add a department
INSERT INTO department (name) VALUES ('Engineering');

-- Add a role
INSERT INTO role (title, salary, department_id) 
VALUES ('Software Engineer', 80000, 1);  -- Assuming department_id = 1

-- Add an employee
INSERT INTO employee (first_name, last_name, role_id, manager_id) 
VALUES ('John', 'Doe', 1, NULL);  -- No manager
-- Update an employee's role
UPDATE employee
SET role_id = 2  -- new role id
WHERE id = 1;    -- employee id

