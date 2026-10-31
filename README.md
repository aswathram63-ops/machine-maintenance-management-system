# MMBMS – Machine Maintenance and Management System

A Full-Stack Web Application for Industrial Machine Maintenance, Breakdown Management, and Repair Tracking.

![Project](https://img.shields.io/badge/Project-MMBMS-blue)
![Frontend](https://img.shields.io/badge/Frontend-React.js-61DAFB)
![Backend](https://img.shields.io/badge/Backend-Node.js-green)
![Database](https://img.shields.io/badge/Database-MySQL-orange)
![Status](https://img.shields.io/badge/Status-Development%20Completed-success)

## 📌 Project Overview

The **Machine Maintenance and Management System (MMBMS)** is a centralized, web-based application designed to streamline industrial machine maintenance operations.

The system provides an integrated platform for managing machines, scheduling preventive maintenance, reporting breakdowns, assigning maintenance staff, tracking repair activities, and maintaining work history.

It implements role-based access control to provide different functionalities to Administrators, Maintenance Staff, and Operators, ensuring structured coordination and efficient maintenance management.

## 💡 Problem Statement

Traditional industrial machine maintenance processes often depend on manual records and disconnected communication between operators, administrators, and maintenance personnel.

These practices can lead to:

- Inefficient machine maintenance tracking.
- Delays in breakdown reporting and resolution.
- Difficulty assigning maintenance responsibilities.
- Lack of centralized repair and work history.
- Limited visibility into machine conditions.
- Challenges in monitoring maintenance activities and performance.

These issues can increase machine downtime and affect overall operational efficiency.

## 💻 Proposed Solution

MMBMS addresses these challenges through a centralized digital maintenance management platform.

The application enables administrators to manage machines and maintenance schedules, operators to report and track breakdowns, and maintenance staff to handle assigned tasks and record repair completion details.

The system also generates work logs automatically when assigned maintenance or breakdown tasks are completed, ensuring that maintenance activities are properly documented.

## ✨ Key Features

### 1. Authentication and Role-Based Access Control
- Secure user login and authentication.
- JWT-based authentication.
- Role-based authorization.
- Separate dashboards and access permissions for each user role.

### 2. Machine Management
- Add, view, update, and delete machine records.
- Maintain machine codes, names, types, and locations.
- Monitor machine operational status.
- Automatically create related maintenance or breakdown records when applicable machine status changes are made.

### 3. Preventive Maintenance Management
- Schedule maintenance activities for machines.
- Assign maintenance tasks to available maintenance staff.
- Track maintenance status.
- Monitor scheduled, in-progress, and completed activities.

### 4. Breakdown Management
- Report machine breakdowns.
- Record breakdown descriptions and priority levels.
- Assign breakdown tasks to maintenance staff.
- Track breakdown resolution status.
- Maintain breakdown records.

### 5. Repair Tracking and Work Logs
- Record repair and maintenance activities.
- Track work performed by maintenance staff.
- Automatically generate work logs when assigned maintenance or breakdown tasks are completed.
- Maintain task completion details for future reference.

### 6. Role-Based Dashboards

The application provides dedicated dashboards for different users.

| Role | Responsibilities |
|---|---|
| Admin | Complete system management, machine management, maintenance scheduling, staff assignment, breakdown monitoring, user management, and reports. |
| Maintenance Staff | View assigned maintenance and breakdown tasks, update task statuses, and record repair completion details. |
| Operator | View machine information and maintenance status, report breakdowns, and track reported issues. |

### 7. Machine History
- Maintain machine-related maintenance and breakdown records.
- View historical maintenance activities.
- Track machine service and repair information.

### 8. Reports and Analytics
- View maintenance and breakdown information.
- Monitor machine-related operational records.
- Analyze maintenance activities through reports and visualizations.

### 9. User Management
- Manage system users.
- Maintain user roles and account status.
- Control user access based on assigned roles.

### 10. Settings and Profile Management
- View and update profile information.
- Manage account settings.
- Change account password.

## 🛠️ Technology Stack

### Frontend
- React.js
- JavaScript
- HTML5
- CSS3
- React Router
- Axios
- Recharts
- Lucide React

### Backend
- Node.js
- Express.js
- RESTful APIs
- JWT Authentication

### Database
- MySQL

### Development Tools
- Visual Studio Code
- Git
- GitHub
- Postman

## 🏗️ System Architecture

MMBMS follows a client-server architecture.

```text
                 MMBMS APPLICATION
                        |
          +-------------+-------------+
          |                           |
      FRONTEND                    BACKEND
       React.js                  Node.js
          |                      Express.js
          |                           |
          +-------- REST APIs --------+
                      |
                 MySQL Database
```

### Application Workflow

1. Users log in through the authentication interface.
2. The backend verifies credentials and generates a JWT token.
3. Users are redirected to dashboards according to their roles.
4. Frontend components communicate with backend REST APIs.
5. The backend processes requests and interacts with the MySQL database.
6. Updated information is displayed through the frontend interface.

## 🗄️ Database Design

The application uses MySQL as its relational database.

The primary database tables include:

| Table | Description |
|---|---|
| `users` | Stores user information, roles, and account status. |
| `machines` | Stores machine details and operational status. |
| `maintenances` | Stores scheduled maintenance activities and assignments. |
| `breakdowns` | Stores reported machine breakdowns and resolution details. |
| `work_logs` | Stores repair and maintenance work completion records. |

Foreign key relationships maintain consistency between users, machines, maintenance activities, breakdowns, and work logs.

## 🔐 Security and Access Control

- JWT-based user authentication.
- Role-based API authorization.
- Protected frontend routes.
- Backend validation of user permissions.
- Staff assignment restricted to authorized administrators.
- Task ownership verification for maintenance staff.
- Passwords should be stored securely using appropriate hashing.
- Environment variables should be used for sensitive configuration.

## 🚀 Installation and Setup

Follow these steps to run the project locally.

### Prerequisites

Install the following:

- Node.js
- npm
- MySQL Server
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/aswathram63-ops/machine-maintenance-management-system.git
```

### 2. Navigate to the Project

```bash
cd machine-maintenance-management-system
```

### 3. Set Up the Database

1. Open MySQL Workbench or your preferred MySQL client.
2. Execute the SQL script available in the `database/schema.sql` file.
3. Verify that the `mmbms_db` database and required tables have been created.

### 4. Configure the Backend

Navigate to the backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Configure the database connection in `backend/config/db.js` using your local MySQL credentials.

Keep sensitive credentials outside the public repository.

### 5. Start the Backend Server

```bash
node server.js
```

The backend is configured to run on:

```text
http://localhost:5000
```

### 6. Set Up the Frontend

Open another terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

### 7. Start the Frontend Application

```bash
npm run dev
```

The frontend development server runs at:

```text
http://localhost:5173
```

Open the displayed local URL in your browser.

## 📂 Project Structure

```text
MMBMS/
│
├── backend/
│   ├── config/
│   │   └── db.js
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── breakdownController.js
│   │   ├── dashboardController.js
│   │   ├── machineController.js
│   │   ├── machineHistoryController.js
│   │   ├── maintenanceController.js
│   │   ├── reportController.js
│   │   ├── settingsController.js
│   │   ├── userController.js
│   │   └── workLogController.js
│   │
│   ├── middleware/
│   │   └── authMiddleware.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── breakdownRoutes.js
│   │   ├── dashboardRoutes.js
│   │   ├── machineHistoryRoutes.js
│   │   ├── machineRoutes.js
│   │   ├── maintenanceRoutes.js
│   │   ├── reportRoutes.js
│   │   ├── settingsRoutes.js
│   │   ├── userRoutes.js
│   │   └── workLogRoutes.js
│   │
│   ├── server.js
│   └── package.json
│
├── database/
│   └── schema.sql
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   └── package.json
│
├── .gitignore
└── README.md
```

## 🎯 Project Objectives

- Digitize industrial machine maintenance operations.
- Improve breakdown reporting and tracking.
- Simplify preventive maintenance scheduling.
- Improve coordination between administrators, operators, and maintenance staff.
- Maintain centralized repair and maintenance records.
- Improve visibility into machine conditions and maintenance activities.

## 🔮 Future Enhancements

- Predictive maintenance using machine learning.
- IoT-based real-time machine monitoring.
- Automated email and SMS notifications.
- Advanced maintenance analytics and performance dashboards.
- Maintenance cost analysis and optimization.
- Cloud deployment and scalable infrastructure.

## 📌 Project Information

| Category | Details |
|---|---|
| Project Name | Machine Maintenance and Management System (MMBMS) |
| Project Type | Full-Stack Web Application |
| Domain | Industrial Maintenance Management |
| Frontend | React.js |
| Backend | Node.js and Express.js |
| Database | MySQL |
| Development Approach | Client-Server Architecture |
| Repository | [GitHub – MMBMS](https://github.com/aswathram63-ops/machine-maintenance-management-system) |

## 👨‍💻 Author

**Aswathram V.**

GitHub: [@aswathram63-ops](https://github.com/aswathram63-ops)

---

⭐ If you find this project interesting, consider giving the repository a star!

**MMBMS – Making Industrial Machine Maintenance More Organized, Efficient, and Reliable.**
