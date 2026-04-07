import express from "express"
import mysql from "mysql2"
import cors from "cors"


const app = express()

app.listen(8800, () => {
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
        const { postContent, privStatus, userID, boardID } = req.body

        const postQuery = "INSERT INTO POSTS (postContent, privStatus, userID) VALUES (?, ?, ?)"
        db.query(postQuery, [postContent, privStatus, userID], (err, result) => {
            if (err) return res.status(500).json(err)

            const newPostID = result.insertId

            if (boardID) {
            const uploadQuery = "INSERT INTO UPLOADED (userID, postID, boardID) VALUES (?, ?, ?)"
            db.query(uploadQuery, [userID, newPostID, boardID], (err2) => {
                if (err2) return res.status(500).json(err2)
                return res.json("Post created and uploaded to board")
            })
            } else {
            return res.json("Post created successfully")
            }
        })
    })
})