# UNIFY App — Setup & User Guide

---

## Getting Started

### Prerequisites

Download the project via the GitHub link or the zip file from the D2L dropbox. Before running, confirm the following files are present:

```
path/to/UNIFY-app/
├── backend/
├── frontend/
├── README.md
└── unify_table_dec.sql
```

---

## Setup

### 1. Database

1. Open MySQL Workbench
2. Go to **File → Open SQL Script** and select `unify_table_dec.sql`
3. Run the script — this will create the database

### 2. Backend Configuration

>  **Important:** Open `path/to/UNIFY-app/backend/index.js` and update the password field to your own MySQL password before running. The following code block is lines 11-17.
```
    // change to your password and db name
    const db = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "unify"
    })
```

### 3. Running the Backend

```bash
cd path/to/UNIFY-app/backend
node index.js
# Backend server is running!
```

### 4. Running the Frontend

```bash
cd path/to/UNIFY-app/frontend
npm start
# A localhost link will appear once the app is running
```

---

## Functionalities

### Authentication

| Action | Steps |
|---|---|
| **Register** | Click **Register** → select user type → enter info → create account |
| **Login** | Click **Login** → select user type → enter credentials |
| **Admin Login** | Click **Admin** on login screen → enter admin credentials (see below) |

> **Note:** Admins cannot self-register from the login screen. New admin creation (outside of direct database insertion) was not implemented. A pre-made admin account is available for testing:
> - **Email:** `admin@admin.com`
> - **Password:** `admin`

---

### User Features

#### Homepage
View a summary of your activity:
- **My Posts** — all posts you've created
- **My Boards** — all boards you've created
- **My Groups** — all groups you've created
- **My Friends** — your full friends list

#### Create
- **Post** — write a post and set visibility
- **Board** — select board type (Question, Event, Job Board), write a message, set visibility
- **Group** — select group type (Course, Major, Club), name the group, write a message, set visibility

#### Friend Activity
- **Their Posts** — posts from all your friends
- **Their Boards** — boards from all your friends
- **Their Groups** — groups from all your friends

#### Browse (Public Content)
- **Posts** — view all public posts
- **Boards** — view all public boards
- **Groups** — view all public groups
- **University Pages** — view all approved university pages
- **Company Pages** — view all approved business pages

---

### Admin Features

> Access requires the admin account credentials above.

| Feature | Description |
|---|---|
| **Page Approvals** | Review pending university/company pages and approve or remove them |
| **Manage Users** | View all registered users and remove accounts if needed |
