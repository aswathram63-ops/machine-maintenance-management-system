import pypandoc

readme = """# MMBMS – Machine Maintenance and Management System

## Project Overview

MMBMS is a web-based system for managing machines, maintenance schedules, breakdown reports, repair work logs, machine history, users, and operational reports.

## Technology Stack

- **Frontend:** React (Vite), CSS, Axios, Recharts
- **Backend:** Node.js, Express.js
- **Database:** MySQL
- **Authentication:** JWT and bcrypt

## Main Features

1. Dashboard
2. Machine Management
3. Maintenance Management
4. Breakdown Management
5. Work Logs / Repair Tracking
6. User Management
7. Machine History
8. Reports & Analytics
9. Settings

## Demo Login Credentials

Use these accounts to access the application:

| Role | Username (Email) | Password |
|---|---|---|
| Admin | ` ` | `Admin@123` |
| Maintenance Staff | `@mmbms.com` | `Staff@123` |
| Operator | `operator@mmbms.com` | `Operator@123` |

**Note:** These are the demo credentials recorded during development. They will work only if the corresponding accounts still exist in your database and their passwords have not been changed.

## Running the Project Locally

### 1. Start the Backend

Open a terminal in the backend folder:
staff
```bash
npm install
node server.js
```

The backend runs at:

`http://localhost:5000`

### 2. Start the Frontend

Open another terminal in the frontend folder:

```bash
npm install
npm run dev
```

Open the local URL printed by Vite, normally:

`http://localhost:5173`

## Important Notes

- Make sure the MySQL server is running.
- Configure the database connection and `JWT_SECRET` in the backend environment file.
- Ensure the `mmbms_db` database and required tables have been created.
- Do not use these demo credentials in a production deployment. Change the passwords before deploying the application.
"""
output_path = "/mnt/data/MMBMS_README.md"
pypandoc.convert_text(readme, "md", format="md", outputfile=output_path, extra_args=["--standalone"])
print(output_path)
