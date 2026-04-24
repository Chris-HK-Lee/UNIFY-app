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
        password: "Asiancanadian1!",
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

    app.post("/social_group", (req, res) => {
        console.log("Groups hit:", req.body)
        const { choice, groupName, groupDesc, courseCode, department, clubRepID, userID } = req.body

        db.query("SELECT COALESCE(MAX(groupID), 0) + 1 AS nextID FROM SOCIAL_GROUP", (err, rows) => {
            if (err) return res.status(500).json(err)
            const groupID = rows[0].nextID

            const postQuery = "INSERT INTO SOCIAL_GROUP (groupID, groupName, groupDesc, userID) VALUES (?, ?, ?, ?)"
            db.query(postQuery, [groupID, groupName, groupDesc, userID], (err, result) => {
                if (err) {
                    console.error("Group insert failed:", err.message)
                    return res.status(500).json(err)
                }
                if (choice == 'course'){
                    const postQuery = "INSERT INTO COURSE (groupID, courseCode, userID) VALUES (?, ?, ?)"
                    db.query(postQuery, [groupID, courseCode, userID], (err, result) => {
                        if (err) {
                            console.error("Course insert failed:", err.message)
                            return res.status(500).json(err)
                        }
                    })
                }
                if (choice == 'major'){
                    const postQuery = "INSERT INTO MAJOR (groupID, department, userID) VALUES (?, ?, ?)"
                    db.query(postQuery, [groupID, department, userID], (err, result) => {
                        if (err) {
                            console.error("Major insert failed:", err.message)
                            return res.status(500).json(err)
                        }
                    })
                }
                if (choice == 'club'){
                    const postQuery = "INSERT INTO CLUB (groupID, clubRepID, userID) VALUES (?, ?, ?)"
                    db.query(postQuery, [groupID, clubRepID, userID], (err, result) => {
                        if (err) {
                            console.error("Club insert failed:", err.message)
                            return res.status(500).json(err)
                        }
                    })
                }
                return res.json("Group created successfully")
            })
        })
    })

    app.post("/boards", (req, res) => {
        console.log("Boards hit:", req.body)
        const { choice, category, boardDesc, privStatus, eventTime, eventLoc, jobfield, employerName, appDeadline, userID } = req.body

        db.query("SELECT COALESCE(MAX(boardID), 0) + 1 AS nextID FROM BOARDS", (err, rows) => {
            if (err) return res.status(500).json(err)
            const boardID = rows[0].nextID

            const postQuery = "INSERT INTO BOARDS (boardID, userID, boardDesc, privStatus) VALUES (?, ?, ?, ?)"
            db.query(postQuery, [boardID, userID, boardDesc, privStatus], (err, result) => {
                if (err) {
                    console.error("Board insert failed:", err.message)
                    return res.status(500).json(err)
                }
                
                if (choice == 'question'){
                    const postQuery = "INSERT INTO QUESTIONBOARD (userID, boardID, category) VALUES (?, ?, ?)"
                    db.query(postQuery, [userID, boardID, category], (err, result) => {
                        if (err) {
                                console.error("Question insert failed:", err.message)
                                return res.status(500).json(err)
                        }
                    })
                }
                if (choice == 'event'){
                    const postQuery = "INSERT INTO EVENTBOARD (userID, boardID, eventTime, eventLoc) VALUES (?, ?, ?, ?)"
                    db.query(postQuery, [userID, boardID, eventTime, eventLoc], (err, result) => {
                        if (err) {
                                console.error("Event insert failed:", err.message)
                                return res.status(500).json(err)
                        }
                    })
                }
                if (choice == 'job'){
                    const postQuery = "INSERT INTO JOBBOARD (userID, boardID, jobfield, employerName, appDeadline) VALUES (?, ?, ?, ?, ?)"
                    db.query(postQuery, [userID, boardID, jobfield, employerName, appDeadline], (err, result) => {
                        if (err) {
                                console.error("Job insert failed:", err.message)
                                return res.status(500).json(err)
                        }
                    })
                }
                return res.json("Board created successfully")
            })
        })
    })

    app.get("/posts/user/:userID", (req, res) => {
        const postQuery = "SELECT * FROM POSTS WHERE userID = ?"
        db.query(postQuery, [req.params.userID], (err, data) => {
            if (err) return res.status(500).json(err)
            return res.json(data)
        })
    })

    app.get("/boards/user/:userID", (req, res) => {
        const postQuery = `SELECT b.boardID, b.boardDesc, b.privStatus,
            CASE
                WHEN e.boardID IS NOT NULL THEN 'Event'
                WHEN j.boardID IS NOT NULL THEN 'Job'
                WHEN q.boardID IS NOT NULL THEN 'Question'
            ELSE 'General'
            END AS boardType, e.eventTime, e.eventLoc, q.category, j.jobfield, j.employerName, j.appDeadline
            FROM BOARDS b
            LEFT JOIN EVENTBOARD e ON e.boardID = b.boardID
            LEFT JOIN JOBBOARD j ON j.boardID = b.boardID
            LEFT JOIN QUESTIONBOARD q ON q.boardID = b.boardID
            WHERE b.userID = ?`
        db.query(postQuery, [req.params.userID], (err, data) => {
            if (err) return res.status(500).json(err)
            return res.json(data)
        })
    })

    app.get("/groups/user/:userID", (req, res) => {
        const postQuery = `SELECT sg.groupID, sg.groupName, sg.groupDesc, sg.numberOfMembers,
            CASE
                WHEN c.groupID IS NOT NULL THEN 'Course'
                WHEN m.groupID IS NOT NULL THEN 'Major'
                WHEN cl.groupID IS NOT NULL THEN 'Club'
            ELSE 'General'
            END AS groupType, c.courseCode, m.department, cl.clubRepID, u.fname AS repFname, u.lname AS repLname
            FROM SOCIAL_GROUP sg
            LEFT JOIN COURSE c ON sg.groupID = c.groupID
            LEFT JOIN MAJOR m ON sg.groupID = m.groupID
            LEFT JOIN CLUB cl ON sg.groupID = cl.groupID
            LEFT JOIN USERS u ON cl.clubRepID = u.userID
            WHERE sg.userID = ?`
        db.query(postQuery, [req.params.userID], (err, data) => {
            if (err) return res.status(500).json(err)
            return res.json(data)
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
        const userQ = "INSERT INTO USERS (userID, fname, lname, username, passwords) VALUES (?, ?, ?, ?, ?)"
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
        SELECT u.userID, u.fname, u.lname, u.username, u.passwords, s.personalEmail, f.universityEmail, c.businessEmail
        FROM USERS u
        LEFT JOIN STUDENT s ON u.userID = s.userID
        LEFT JOIN FACULTY f ON u.userID = f.userID
        LEFT JOIN COMPANY_REP c ON u.userID = c.userID
        WHERE s.personalEmail = ? OR f.universityEmail = ? OR c.businessEmail = ?
    `
    db.query(q, [email, email, email], (err, data) => {
        if (err) return res.status(500).json(err)
        if (data.length === 0) return res.status(401).json("Invalid credentials")
        if (data[0].passwords !== password) return res.status(401).json("Invalid credentials")

        const user = data[0]
        let accountType = null
        if (user.personalEmail) accountType = "student"
        else if (user.universityEmail) accountType = "faculty"
        else if (user.businessEmail) accountType = "company"

        return res.json({ ...user, accountType })
    })
})

    app.post("/admin-login", (req, res) => {
        const { email, password } = req.body
        const q = `
            SELECT u.userID, u.fname, u.lname, u.username, u.passwords, a.ADMINSID
            FROM USERS u
            INNER JOIN ADMINS a ON u.userID = a.userID
            LEFT JOIN STUDENT s ON u.userID = s.userID
            LEFT JOIN FACULTY f ON u.userID = f.userID
            LEFT JOIN COMPANY_REP c ON u.userID = c.userID
            WHERE s.personalEmail = ? OR f.universityEmail = ? OR c.businessEmail = ?
        `
        db.query(q, [email, email, email], (err, data) => {
            if (err) return res.status(500).json(err)
            if (data.length === 0) return res.status(401).json("Invalid credentials")
            if (data[0].passwords !== password) return res.status(401).json("Invalid credentials")
            return res.json({ ...data[0], accountType: "admin" })
        })
    })

    // University page endpoints
    app.get("/unipage/:userID", (req, res) => {
        db.query("SELECT * FROM UNIPAGE WHERE userID = ?", [req.params.userID], (err, data) => {
            if (err) return res.status(500).json(err)
            return res.json(data[0] || null)
        })
    })

    app.post("/unipage/:userID", (req, res) => {
        const { UniName, UniDesc } = req.body
        const { userID } = req.params
        db.query("SELECT userID FROM UNIPAGE WHERE userID = ?", [userID], (err, data) => {
            if (err) { console.error("unipage select err:", err); return res.status(500).json(err.sqlMessage || err) }
            if (data.length > 0) {
                db.query("UPDATE UNIPAGE SET UniName = ?, UniDesc = ?, approved = 0 WHERE userID = ?", [UniName, UniDesc, userID], (err2) => {
                    if (err2) { console.error("unipage update err:", err2); return res.status(500).json(err2.sqlMessage || err2) }
                    return res.json("University page updated")
                })
            } else {
                db.query("INSERT INTO UNIPAGE (userID, UniName, UniDesc, approved) VALUES (?, ?, ?, 0)", [userID, UniName, UniDesc], (err2) => {
                    if (err2) { console.error("unipage insert err:", err2); return res.status(500).json(err2.sqlMessage || err2) }
                    return res.json("University page created")
                })
            }
        })
    })

    // All approved university pages (for browsing)
    app.get("/unipages", (req, res) => {
        db.query("SELECT u.userID, u.UniName, u.UniDesc FROM UNIPAGE u WHERE u.approved = 1", (err, data) => {
            if (err) return res.status(500).json(err)
            return res.json(data)
        })
    })

    // Company page endpoints
    app.get("/comppage/:userID", (req, res) => {
        db.query("SELECT * FROM COMPPAGE WHERE userID = ?", [req.params.userID], (err, data) => {
            if (err) return res.status(500).json(err)
            return res.json(data[0] || null)
        })
    })

    app.post("/comppage/:userID", (req, res) => {
        const { CompName, CompDesc } = req.body
        const { userID } = req.params
        db.query("SELECT userID FROM COMPPAGE WHERE userID = ?", [userID], (err, data) => {
            if (err) return res.status(500).json(err)
            if (data.length > 0) {
                // reset approved to 0 on edit so admin must re-approve
                db.query("UPDATE COMPPAGE SET CompName = ?, CompDesc = ?, approved = 0 WHERE userID = ?", [CompName, CompDesc, userID], (err2) => {
                    if (err2) return res.status(500).json(err2)
                    return res.json("Company page updated")
                })
            } else {
                db.query("INSERT INTO COMPPAGE (userID, CompName, CompDesc, approved) VALUES (?, ?, ?, 0)", [userID, CompName, CompDesc], (err2) => {
                    if (err2) return res.status(500).json(err2)
                    return res.json("Company page created")
                })
            }
        })
    })

    // All approved company pages (for browsing)
    app.get("/comppages", (req, res) => {
        db.query("SELECT c.userID, c.CompName, c.CompDesc FROM COMPPAGE c WHERE c.approved = 1", (err, data) => {
            if (err) return res.status(500).json(err)
            return res.json(data)
        })
    })

    // Admin: get all pages pending approval
    app.get("/admin/pages", (req, res) => {
        const uniQ = `SELECT p.userID, p.UniName, p.UniDesc, p.approved, u.fname, u.lname
                      FROM UNIPAGE p JOIN USERS u ON p.userID = u.userID`
        const compQ = `SELECT p.userID, p.CompName, p.CompDesc, p.approved, u.fname, u.lname
                       FROM COMPPAGE p JOIN USERS u ON p.userID = u.userID`
        db.query(uniQ, (err, uni) => {
            if (err) { console.error("admin uni err:", err); return res.status(500).json(err.sqlMessage || err) }
            db.query(compQ, (err2, comp) => {
                if (err2) { console.error("admin comp err:", err2); return res.status(500).json(err2.sqlMessage || err2) }
                return res.json({ uni, comp })
            })
        })
    })

    // Admin: approve a university page
    app.post("/admin/approve/uni/:userID", (req, res) => {
        db.query("UPDATE UNIPAGE SET approved = 1 WHERE userID = ?", [req.params.userID], (err) => {
            if (err) return res.status(500).json(err)
            return res.json("University page approved")
        })
    })

    // Admin: approve a company page
    app.post("/admin/approve/comp/:userID", (req, res) => {
        db.query("UPDATE COMPPAGE SET approved = 1 WHERE userID = ?", [req.params.userID], (err) => {
            if (err) return res.status(500).json(err)
            return res.json("Company page approved")
        })
    })
})