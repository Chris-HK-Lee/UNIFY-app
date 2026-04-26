### Download The Project
We have download available via our github link or the zip file submitted in the D2L dropbox. Ensure that the project files for UNIFY-app contain the following prior to running:
```
path/to/UNIFY-app % ls 
backend			README.md
frontend		unify_table_dec.sql

### Running the project

open MySQL
    - file -> open SQL script -> select unify_table_dec.sql
    - this will create the database

****IMPORTANT***** path/to/UNIFY-app/backend/index.js change the password to your own MySQL password


The following is for running the project's **backend**:
    - path/to/UNIFY-app/backend % node index.js
    - Backend server is running!


The following is for running the project's **frontend**:
    - path/to/UNIFY-app/frontend % npm start
    - you will get the local host link after running the application

Functionalities

Log in:
    - Click on the register button and select user type
    - Enter user information and create account
    - Click on the login button select user type and enter credentials and login

admin login:
    - for security reasons admin cannot register on the login screen
    - We did not implement how we are going to handle new admin creation (other than inserting directly into database)
    - We created a admin account 
        - Admin account:
            - email: admin@admin.com
            - password: admin

Homepage
    - user can view all their activities and friends on the homepage
    - My posts: view all of user's post
    - My Boards: view all of user's boards
    - My Groups: view all of user's groups
    - My friends: View all of user's friends

Create
    - Create Post: Write a new post and select visibility then post
    - Create Board: Select Board type (question, event, job board), write message, set visibility then make board
    - Create Group: select group type (course, major, club), name group, write message, set visibility then make     group

Friend Activity
    - Their posts: view posts of all friends
    - Their boards: view boards of all friends
    - Their groups: view groups of all friends

Posts
    - User can view all of the public posts 

Boards
    - User can view all of the public boards

Groups
    - User can view all of the public groups

University Pages
    - User can view all of the approved university pages

Company Page
    - User can view all of the approved business pages 


**ADMIN ONLY** 
Page Approvals
    - Admin can view all of the pending pages for review and can approve or remove them

Manage Users
    - Admin can view all users and remove them