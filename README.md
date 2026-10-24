# 🦷 Dental Clinic Management System (DCMS)

A modern dental clinic management application designed to simplify daily clinic operations, including patient records, appointment scheduling, staff management, and SQL-based data storage.

## ✨ Overview

The **Dental Clinic Management System (DCMS)** provides a centralized interface for managing essential clinic workflows. It helps dental clinics organize patient information, coordinate appointments, and maintain staff records efficiently.

Built with [Lovable](https://lovable.dev), the project supports local development and configurable database options for local or cloud environments.

## 🚀 Features

- **Patient Management** — Organize and maintain patient records.
- **Appointment Management** — Manage clinic appointments and scheduling.
- **Staff Management** — Maintain staff information and records.
- **SQL Database Integration** — Store clinic records in a database instead of browser storage.
- **Flexible Database Configuration** — Use SQLite locally or connect to supported cloud databases.
- **Local Development Support** — Run the application locally using Node.js and npm.

## 🛠️ Technology & Database

The application uses a web frontend with SQL-backed data storage.

| Database | Usage |
|---|---|
| SQLite | Default local database at `data/clinic.db` |
| PostgreSQL | Cloud or hosted database configured through `DATABASE_URL` |
| Turso / libSQL | Cloud database using `DATABASE_URL` and `DATABASE_AUTH_TOKEN` |

PostgreSQL can be hosted through providers such as Neon, Supabase, Railway, Azure, or another compatible provider.

## 📋 Prerequisites

Before running the project locally, install:

- [Node.js](https://nodejs.org/)
- npm (included with Node.js)
- [Git](https://git-scm.com/)

## ⚙️ Installation & Setup

### 1. Clone the repository

Replace the placeholders with your actual repository URL and directory name.

```bash
git clone <repository-url>
cd <repository-name>
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

For the default local SQLite configuration, no additional database configuration is required.

For a cloud database, create a `.env` file from the example.

**Windows PowerShell:**

```powershell
Copy-Item .env.example .env
```

**macOS / Linux:**

```bash
cp .env.example .env
```

Configure the appropriate variables in `.env`.

**PostgreSQL example:**

```env
DATABASE_URL=your_postgresql_connection_string
```

**Turso / libSQL example:**

```env
DATABASE_URL=libsql://your-database-url
DATABASE_AUTH_TOKEN=your_database_auth_token
```

Replace the example values with your actual credentials. Never commit `.env` files containing secrets.

### 4. Start the development server

```bash
npm run dev
```

Open the local URL displayed in your terminal to access the application.

## 🗄️ Database Information

Clinic records, including staff, patients, and appointments, are intended to be stored in SQL.

- **Local development:** SQLite database at `data/clinic.db`.
- **Cloud deployment:** Configure a supported PostgreSQL or Turso/libSQL database.
- **Environment configuration:** Use `.env.example` as the template for database settings.

Ensure the database is accessible and properly initialized before using database-dependent features.

## 🔐 Demo Login

The demo sign-in flow uses the following password:

| Credential | Value |
|---|---|
| Password | `demo123` |

> **Security note:** This is a demo credential for development or demonstration. Replace demo authentication with appropriate production authentication and change default credentials before deploying the application for real clinic use.

## 🎨 Built with Lovable

This project was built with [Lovable](https://lovable.dev), an AI-powered platform for building web applications.

**Continue development:** [Open the DCMS project in Lovable](https://lovable.dev/projects/02e0e0de-e8e5-4d71-b8e1-a746b4ff4206)

Lovable and GitHub integration supports a synchronized development workflow:

- **Build faster:** Describe changes and features through the Lovable editor.
- **Stay in sync:** Changes made through Lovable can be committed to the connected repository.
- **Full code ownership:** Maintain the code in your GitHub repository and push changes to the `main` branch to synchronize with Lovable.

## 👨‍💻 Development Workflow

To continue development locally:

1. Clone the repository.
2. Install dependencies with `npm install`.
3. Configure `.env` if using a cloud database.
4. Start the application with `npm run dev`.
5. Make changes and test them locally.
6. Commit your changes and push them to GitHub when ready.

## 🔒 Security & Data Protection

Because this application is designed to manage clinic-related records:

- Keep database credentials and authentication tokens private.
- Never commit `.env` files containing secrets.
- Use secure authentication and appropriate access controls in production.
- Configure database backups and access permissions.
- Protect patient information and follow applicable data protection requirements.

The demo login should not be used as the sole authentication mechanism for a production clinic.

## 🗺️ Future Enhancements

Potential future improvements include:

- Patient medical and dental history
- Treatment plans and clinical notes
- Billing and payment management
- Prescription management
- Appointment reminders
- Reports and analytics
- Role-based access control
- Automated database backups

These are proposed enhancements and are not necessarily implemented in the current version.

## 📄 License

No license has been specified yet. Add a `LICENSE` file if you intend to distribute this project under a particular open-source license.

---

**Dental Clinic Management System (DCMS)**

*Organizing clinic workflows through a centralized, database-backed application.*

Built with [Lovable](https://lovable.dev) · Maintained on GitHub
