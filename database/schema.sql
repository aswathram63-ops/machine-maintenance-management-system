CREATE DATABASE IF NOT EXISTS mmbms_db;
USE mmbms_db;

CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('Admin', 'Maintenance Staff', 'Operator') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS machines (
    machine_id INT AUTO_INCREMENT PRIMARY KEY,
    machine_code VARCHAR(50) UNIQUE NOT NULL,
    machine_name VARCHAR(100) NOT NULL,
    machine_type VARCHAR(100),
    location VARCHAR(150),
    status ENUM('Operational', 'Maintenance', 'Breakdown') DEFAULT 'Operational',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS maintenances (
    maintenance_id INT AUTO_INCREMENT PRIMARY KEY,
    machine_id INT NOT NULL,
    assigned_to INT,
    maintenance_date DATE NOT NULL,
    description TEXT,
    status ENUM('Scheduled', 'In Progress', 'Completed') DEFAULT 'Scheduled',
    completed_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (machine_id) REFERENCES machines(machine_id),
    FOREIGN KEY (assigned_to) REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS breakdowns (
    breakdown_id INT AUTO_INCREMENT PRIMARY KEY,
    machine_id INT NOT NULL,
    reported_by INT NOT NULL,
    assigned_to INT,
    description TEXT NOT NULL,
    priority ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
    status ENUM('Open', 'In Progress', 'Closed') DEFAULT 'Open',
    reported_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    resolved_at DATETIME,
    FOREIGN KEY (machine_id) REFERENCES machines(machine_id),
    FOREIGN KEY (reported_by) REFERENCES users(user_id),
    FOREIGN KEY (assigned_to) REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS work_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    breakdown_id INT NULL,
    maintenance_id INT NULL,
    staff_id INT NOT NULL,
    work_description TEXT NOT NULL,
    log_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (breakdown_id) REFERENCES breakdowns(breakdown_id),
    FOREIGN KEY (maintenance_id) REFERENCES maintenances(maintenance_id),
    FOREIGN KEY (staff_id) REFERENCES users(user_id)
);
