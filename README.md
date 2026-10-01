# 💰 Expense Tracker

A full-stack Expense Tracker web application built using **Node.js, Express.js, MongoDB, Mongoose, and EJS**.

The application allows users to manage their expenses and budgets through a simple web interface.

## 🚀 Features

- Add expenses
- View expenses
- Manage budgets
- Calculate total expenses
- Calculate remaining budget
- MongoDB database integration
- Server-side rendering with EJS
- Session-based application support
- Responsive UI

## 🛠️ Tech Stack

**Frontend**
- HTML
- CSS
- EJS

**Backend**
- Node.js
- Express.js

**Database**
- MongoDB
- Mongoose

**Tools**
- Git
- GitHub
- dotenv
- express-session

## 📁 Project Structure

```text
expense-tracker/
│
├── config/
│   └── db.js
│
├── controllers/
│   ├── budgetController.js
│   └── expenseController.js
│
├── models/
│   ├── budget.js
│   └── expense.js
│
├── routes/
│   ├── budgetRoutes.js
│   └── expenseRoutes.js
│
├── public/
│   └── css/
│
├── views/
│   ├── budget/
│   ├── dashboard/
│   ├── expenses/
│   ├── layouts/
│   └── partials/
│
├── app.js
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
