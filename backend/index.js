import express from "express"
import mysql from "mysql2"
import cors from "cors"


const app = express()

app.listen(9999, () => {
    console.log("Backend server is running!")


    // change to your password and db name
    const db = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "unify"
    })

    app.use(express.json())
    app.use(cors())

    app.get("/users", (req, res) => {
        const q = "SELECT * FROM users"
        db.query(q, (err, data) => {
            if (err) {
                console.error(err)
                res.status(500).json({ error: "Failed to fetch users" })
            } else {
                res.json(data)
            }
        })
    })

    app.get("/", (req, res) => {
        res.json("Hello, this is the backend!")
    })

    app.post("/users", (req, res) => {
        const q = "INSERT INTO users (`userID`, `fname`, `lname`, `username`) VALUES (?)"
        const values = [
            req.body.userID,
            req.body.fname,
            req.body.lname,
            req.body.username
        ]
        db.query(q,[values], (err, data)=>{
            if(err) return res.json(err)
            return res.json("user has been created successfully")
        })
    })

    app.post("/posts", (req, res) => {
        console.log("Posts hit:", req.body)
        const { postContent, privStatus, userID, boardID } = req.body

        db.query("SELECT COALESCE(MAX(postID), 0) + 1 AS nextID FROM POSTS", (err, rows) => {
            if (err) return res.status(500).json(err)
            const postID = rows[0].nextID

            const postQuery = "INSERT INTO POSTS (postID, postContent, privStatus, userID) VALUES (?, ?, ?, ?)"
            db.query(postQuery, [postID, postContent, privStatus, userID], (err, result) => {
            if (err) {
                console.error("Post insert failed:", err.message)
                return res.status(500).json(err)
            }

            if (boardID && boardID !== "") {
                const uploadQuery = "INSERT INTO UPLOADED (userID, postID, boardID) VALUES (?, ?, ?)"
                db.query(uploadQuery, [userID, postID, boardID], (err2) => {
                if (err2) return res.status(500).json(err2)
                return res.json("Post created and uploaded to board")
                })
            } else {
                return res.json("Post created successfully")
            }
            })
        })
    })

    // checking db for registering new users
    app.post("/register", (req, res) => {
        const { fname, lname, username, email, password, accountType } = req.body

        // Check for duplicate email across all subtype tables
        const dupQ = `
            SELECT personalEmail AS email FROM STUDENT WHERE personalEmail = ?
            UNION
            SELECT universityEmail FROM FACULTY WHERE universityEmail = ?
            UNION
            SELECT businessEmail FROM COMPANY_REP WHERE businessEmail = ?
        `
        db.query(dupQ, [email, email, email], (err, existing) => {
            if (err) return res.status(500).json(err)
            if (existing.length > 0) return res.status(409).json("Email is already registered")

        // Get next available ID
        db.query("SELECT COALESCE(MAX(userID), 0) + 1 AS nextID FROM USERS", (err, rows) => {
            if (err) return res.status(500).json(err)
            const newUserID = rows[0].nextID

        // Insert into USERS first
        const userQ = "INSERT INTO USERS (userID, fname, lname, username, password) VALUES (?, ?, ?, ?, ?)"
        db.query(userQ, [newUserID, fname, lname, username, password], (err, result) => {
            if (err) return res.status(500).json(err)

            // Insert into the right subtype table
            const subtypeMap = {
                student: "INSERT INTO STUDENT (userID, personalEmail) VALUES (?, ?)",
                faculty: "INSERT INTO FACULTY (userID, universityEmail) VALUES (?, ?)",
                company: "INSERT INTO COMPANY_REP (userID, businessEmail) VALUES (?, ?)",
            }
            db.query(subtypeMap[accountType], [newUserID, email], (err2) => {
                if (err2) return res.status(500).json(err2)
                return res.json("User registered successfully")
            })
        })
        })
        })
    })

    app.post("/login", (req, res) => {
    const { email, password } = req.body

    // Check across all three subtype tables
    const q = `
        SELECT u.userID, u.fname, u.lname, u.username, u.password, s.personalEmail, f.universityEmail, c.businessEmail
        FROM USERS u
        LEFT JOIN STUDENT s ON u.userID = s.userID
        LEFT JOIN FACULTY f ON u.userID = f.userID
        LEFT JOIN COMPANY_REP c ON u.userID = c.userID
        WHERE s.personalEmail = ? OR f.universityEmail = ? OR c.businessEmail = ?
    `
    db.query(q, [email, email, email], (err, data) => {
        if (err) return res.status(500).json(err)
        if (data.length === 0) return res.status(401).json("Invalid credentials")
        if (data[0].password !== password) return res.status(401).json("Invalid credentials")

        const user = data[0]
        let accountType = null
        if (user.personalEmail) accountType = "student"
        else if (user.universityEmail) accountType = "faculty"
        else if (user.businessEmail) accountType = "company"

        return res.json({ ...user, accountType })
    })
})
})