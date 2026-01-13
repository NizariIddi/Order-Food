# 🍔 Order‑Food — Full‑Stack Food Ordering Application

A production‑ready **food ordering web application** built with **Node.js**, **Express.js**, and **MySQL**. The system allows users to browse food menus, place orders, and store order data securely in a relational database. This project is designed with scalability, clean structure, and learning best practices in mind.

---

## 📌 Table of Contents

* [Overview](#-overview)
* [Features](#-features)
* [System Architecture](#-system-architecture)
* [Technology Stack](#-technology-stack)
* [Project Structure](#-project-structure)
* [Installation](#-installation)
* [Database Setup](#-database-setup)
* [Environment Variables](#-environment-variables)
* [Running the Application](#-running-the-application)
* [Usage](#-usage)
* [Security Notes](#-security-notes)
* [Future Improvements](#-future-improvements)
* [Contributing](#-contributing)
* [License](#-license)

---

## 🔍 Overview

**Order‑Food** is a full‑stack web application that simulates an online food ordering system. It demonstrates:

* Backend routing with Express
* SQL database integration
* MVC‑like project structure
* Middleware usage
* Static asset handling

This project is suitable for **learning**, **academic projects**, and **portfolio demonstration**.

---

## 🚀 Features

### User Features

* Browse food items
* View food images
* Place food orders
* View order summary

### Developer Features

* Modular routing system
* SQL schema included
* Clean separation of concerns
* Easy extension for authentication and admin panel

---

## 🧱 System Architecture

```
Client (Browser)
   ↓
Express Routes
   ↓
Controllers / Middleware
   ↓
MySQL Database
```

---

## 🛠 Technology Stack

| Layer           | Technology                       |
| --------------- | -------------------------------- |
| Runtime         | Node.js                          |
| Framework       | Express.js                       |
| Database        | MySQL                            |
| Templating      | Express Views (HTML) |
| Styling         | TailwindCSS                             |
| Version Control | Git & GitHub                     |

---

## 📁 Project Structure

```
Order‑Food/
├── .vscode/              # Editor configuration
├── config/               # App & database configuration
├── favicon_io/           # Application icons
├── images/               # Raw image assets
├── middleware/           # Custom middleware
├── public/               # Static files
│   ├── css/
│   └── images/
├── routes/               # Express routes
│   └── index.js
├── views/                # UI templates
├── app.js                # Main application entry
├── package.json          # Dependencies & scripts
├── tables.sql            # Database schema
└── .gitignore            # Ignored files
```

---

## 🧩 Installation

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/NizariIddi/Order-Food.git
```

### 2️⃣ Navigate into Project Directory

```bash
cd Order-Food
```

### 3️⃣ Install Dependencies

```bash
npm install
```

---

## 🗄 Database Setup

1. Create a MySQL database
2. Import the schema provided in `tables.sql`

```sql
SOURCE tables.sql;
```

3. Confirm tables are created successfully

---

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=food_ordering
```

⚠️ **Never commit your `.env` file to GitHub**

---

## ▶ Running the Application

### Start the Server

```bash
npm start
```

Or with nodemon (if installed):

```bash
npm run dev
```

### Access in Browser

```
http://localhost:4000
```

---

## 👨‍💻 Usage

* Open the app in your browser
* Browse available food items
* Place an order
* Data is saved in the MySQL database

---

## 🔒 Security Notes

* Use **Prepared Statements** for SQL queries
* Store secrets in `.env`
* Validate user input
* Add authentication before production use

---

## 🚧 Future Improvements

* User authentication & authorization
* Admin dashboard
* Order tracking system
* Payment gateway integration
* REST API version
* Mobile frontend

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a new branch
3. Commit your changes
4. Push to your fork
5. Open a Pull Request

---

## 📄 License

This project is open‑source and available for learning and development purposes.

---

### 👤 Authors

**Nizari Iddi** && **David Maleek**
GitHub: [https://github.com/NizariIddi](https://github.com/NizariIddi) && [https://github.com/DnMaleek(https://github.com/DnMaleek)]
