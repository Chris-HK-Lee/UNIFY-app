import express from "express"
import mysql from "mysql2"

const app = express()

app.listen(8800, () => {
    console.log("Backend server is running!")

    const db = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "Asiancanadian1!",
        database: "unify"
    })

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
    

})