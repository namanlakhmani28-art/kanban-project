# 📋 Full-Stack Agile Kanban Board

A lightweight, responsive Kanban board application designed for task management and Agile workflow tracking. Built with a Python Flask backend, RESTful API architecture, Vanilla JavaScript frontend, and a remote MySQL database hosted on Aiven.

🌐 **Live Demo:** [https://your-kanban-app.onrender.com](https://your-kanban-app.onrender.com)

---

## 🛠 Tech Stack

* **Backend:** Python 3, Flask, Gunicorn
* **Database:** MySQL (Aiven Cloud Managed Service)
* **Frontend:** HTML5, CSS3, Vanilla JavaScript (Fetch API)
* **Deployment:** Render (Web Service), GitHub Actions / Workflows

---

## ✨ Features

* **Dynamic Columns:** Drag-and-drop or status-based task movement across columns (`To Do`, `In Progress`, `Done`).
* **REST API:** Modular routes for task CRUD operations (Create, Read, Update, Delete).
* **Cloud Database:** Remote connection pooling with Aiven-hosted MySQL instance.
* **Environment Configuration:** Secure credential management using `python-dotenv` and system environment variables.

---

## 📐 Database Schema

```sql
CREATE TABLE columns (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    position INT NOT NULL
);

CREATE TABLE tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    column_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    position INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (column_id) REFERENCES columns(id) ON DELETE CASCADE
);
