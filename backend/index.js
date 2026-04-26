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

    app.get("/", (req, res) => {
        res.json("Hello, this is the backend!")
    })

    //get all users
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

    // get one user's info from a userID
    app.get("/users/:userID", (req, res) => {
        const postQuery = `SELECT u.userID, u.fname, u.lname, u.username,
                CASE
                    WHEN a.ADMINSID IS NOT NULL THEN 'admin'
                    WHEN s.userID   IS NOT NULL THEN 'student'
                    WHEN f.userID   IS NOT NULL THEN 'faculty'
                    WHEN c.userID   IS NOT NULL THEN 'company'
                END AS accountType
                FROM USERS u
                LEFT JOIN ADMINS      a ON u.userID = a.userID
                LEFT JOIN STUDENT     s ON u.userID = s.userID
                LEFT JOIN FACULTY     f ON u.userID = f.userID
                LEFT JOIN COMPANY_REP c ON u.userID = c.userID
                WHERE u.userID = ?`
        db.query(postQuery, [req.params.userID], (err, data) => {
            if (err) return res.status(500).json(err)
            if (data.length === 0) return res.status(404).json("User not found")
            return res.json(data[0])
        })
    })

    app.get("/friend/check", (req, res) => {
        const { friendID, friendeeID } = req.query
        console.log("Checking friendship:", friendID, friendeeID)

        db.query(
            "SELECT * FROM FRIEND WHERE (friendID = ? AND friendeeID = ?) OR (friendID = ? AND friendeeID = ?)",
            [friendID, friendeeID, friendeeID, friendID],
            (err, rows) => {
            if (err) return res.status(500).json(err)
            return res.json({ areFriends: rows.length > 0 })
            }
        )
    })

    // freinding another user
    app.post("/friend", (req, res) => {
        const { friendID, friendeeID } = req.body
        console.log("Friending user:", friendID, "from:", friendeeID)

        db.query("INSERT INTO FRIEND (friendID, friendeeID) VALUES (?, ?)", [friendID, friendeeID], (err) => {
            if (err) return res.status(500).json(err)
            return res.json("Friended successfully")
        })
    })

    // unfreinding another user
    app.delete("/unfriend", (req, res) => {
        const { friendID, friendeeID } = req.body
        console.log("Unfriending user:", friendID, "from:", friendeeID)

        db.query("DELETE FROM FRIEND WHERE (friendID = ? AND friendeeID = ?) OR (friendID = ? AND friendeeID = ?)", [friendID, friendeeID, friendeeID, friendID], (err) => {
            if (err) return res.status(500).json(err)
            return res.json("Unriended successfully")
        })
    })

    // getting all of a users friends
    app.get("/friend/user/:userID", (req, res) => {
    const postQuery = `SELECT u.userID, u.fname, u.lname, u.username,
        CASE
            WHEN s.userID IS NOT NULL THEN 'student'
            WHEN f.userID IS NOT NULL THEN 'faculty'
            WHEN c.userID IS NOT NULL THEN 'company'
            WHEN a.ADMINSID IS NOT NULL THEN 'admin'
            ELSE 'unknown'
        END AS accountType
        FROM FRIEND fr
        JOIN USERS u ON (
        CASE 
            WHEN fr.friendID = ? THEN fr.friendeeID
            ELSE fr.friendID
        END = u.userID
        )
        LEFT JOIN STUDENT s ON u.userID = s.userID
        LEFT JOIN FACULTY f ON u.userID = f.userID
        LEFT JOIN COMPANY_REP c ON u.userID = c.userID
        LEFT JOIN ADMINS a ON u.userID = a.userID
        WHERE fr.friendID = ? OR fr.friendeeID = ?`
        db.query(postQuery, [req.params.userID, req.params.userID, req.params.userID], (err, data) => {
            if (err) return res.status(500).json(err)
            return res.json(data)
        })
    })
    
    //add a user directly
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

    //creating posts
    app.post("/posts", (req, res) => {
        console.log("Posts hit:", req.body)
        const { postContent, privStatus, userID } = req.body

        db.query("SELECT COALESCE(MAX(postID), 0) + 1 AS nextID FROM POSTS", (err, rows) => {
            if (err) return res.status(500).json(err)
            const postID = rows[0].nextID

            const postQuery = "INSERT INTO POSTS (postID, postContent, privStatus, userID) VALUES (?, ?, ?, ?)"
            db.query(postQuery, [postID, postContent, privStatus, userID], (err, result) => {
                if (err) {
                    console.error("Post insert failed:", err.message)
                    return res.status(500).json(err)
                }
                else {
                    return res.json("Post created successfully")
                }
            })
        })
    })

    //creating groups
    app.post("/social_group", (req, res) => {
        console.log("Groups hit:", req.body)
        const { choice, groupName, groupDesc, courseCode, department, clubAff, userID } = req.body

        db.query("SELECT COALESCE(MAX(groupID), 0) + 1 AS nextID FROM SOCIAL_GROUP", (err, rows) => {
            if (err) return res.status(500).json(err)
            const groupID = rows[0].nextID

            const groupQuery = "INSERT INTO SOCIAL_GROUP (groupID, groupName, groupDesc, userID) VALUES (?, ?, ?, ?)"
            db.query(groupQuery, [groupID, groupName, groupDesc, userID], (err) => {
            if (err) return res.status(500).json(err)

            // helper to add creator to GROUP_MEMBERS then respond
            const addMemberAndRespond = (message) => {
                db.query("INSERT INTO GROUP_MEMBERS (groupID, userID) VALUES (?, ?)", [groupID, userID], (err) => {
                if (err) return res.status(500).json(err)
                return res.json(message)
                })
            }

            if (choice === 'course') {
                const q = "INSERT INTO COURSE (groupID, courseCode, userID) VALUES (?, ?, ?)"
                db.query(q, [groupID, courseCode, userID], (err) => {
                if (err) return res.status(500).json(err)
                addMemberAndRespond("Course group created successfully")
                })

            } else if (choice === 'major') {
                const q = "INSERT INTO MAJOR (groupID, department, userID) VALUES (?, ?, ?)"
                db.query(q, [groupID, department, userID], (err) => {
                if (err) return res.status(500).json(err)
                addMemberAndRespond("Major group created successfully")
                })

            } else if (choice === 'club') {
                const q = "INSERT INTO CLUB (groupID, userID, clubAff) VALUES (?, ?, ?)"
                db.query(q, [groupID, userID, clubAff], (err) => {
                if (err) return res.status(500).json(err)
                addMemberAndRespond("Club group created successfully")
                })

            } else {
                addMemberAndRespond("General group created successfully")
            }
            })
        })
    })

    //creating boards
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

    // get all posts for a board
    app.get("/boards/:boardID/posts", (req, res) => {
    const q = `
        SELECT p.postID, p.postContent, p.privStatus, p.userID,
            u.fname, u.lname, u.username
        FROM UPLOADED up
        JOIN POSTS p ON up.postID = p.postID
        JOIN USERS u ON p.userID = u.userID
        WHERE up.boardID = ? 
        ORDER BY p.postID DESC`
    db.query(q, [req.params.boardID], (err, data) => {
        if (err) return res.status(500).json(err)
        return res.json(data)
    })
    })

    // post a reply (post) to a board
    app.post("/boards/post", (req, res) => {
    const { postContent, privStatus, userID, boardID } = req.body
    console.log("Reply post hit:", postContent, privStatus, userID, boardID)

    db.query("SELECT COALESCE(MAX(postID), 0) + 1 AS nextID FROM POSTS", (err, rows) => {
        if (err) return res.status(500).json(err)
        const postID = rows[0].nextID

        const postQuery = "INSERT INTO POSTS (postID, postContent, privStatus, userID) VALUES (?, ?, ?, ?)"
        db.query(postQuery, [postID, postContent, privStatus, userID], (err) => {
        if (err) return res.status(500).json(err)

        const uploadQuery = "INSERT INTO UPLOADED (userID, postID, boardID) VALUES (?, ?, ?)"
        db.query(uploadQuery, [userID, postID, boardID], (err) => {
            if (err) return res.status(500).json(err)
            return res.json("Post created and uploaded to board")
        })
        })
    })
    })

    //getting a user's posts
    app.get("/posts/user/:userID", (req, res) => {
        const postQuery = "SELECT * FROM POSTS p WHERE userID = ? ORDER BY p.postID DESC"
        db.query(postQuery, [req.params.userID], (err, data) => {
            if (err) return res.status(500).json(err)
            return res.json(data)
        })
    })

    //getting posts that are different from a user's own
    app.get("/otherPosts/user/:userID", (req, res) => {
        // make sure to show posts that does not belong to user from req, and are public only
        const postQuery = `SELECT p.postID, p.userID, p.postContent, p.privStatus, u.username, u.userID 
        FROM POSTS p LEFT JOIN USERS u ON u.userID = p.userID 
        WHERE NOT p.userID = ? AND p.privStatus = 'public'
        ORDER BY p.postID DESC`
        db.query(postQuery, [req.params.userID], (err, data) => {
            if (err) return res.status(500).json(err)
            return res.json(data)
        })
    })

    // editing a user's own post
    app.put("/posts/:postID", (req, res) => {
        const { postContent, privStatus } = req.body
        db.query("UPDATE POSTS SET postContent = ?, privStatus = ? WHERE postID = ?",
            [postContent, privStatus, req.params.postID], (err) => {
            if (err) return res.status(500).json(err.sqlMessage || err)
            return res.json("Post updated successfully")
        })
    })

    //getting friends posts that are different from a user's own
    app.get("/fPosts/user/:userID", (req, res) => {
        const postQuery = `SELECT p.postID, p.userID, p.postContent, p.privStatus, u.username, u.userID
        FROM POSTS p LEFT JOIN USERS u ON u.userID = p.userID
        WHERE NOT p.userID = ? AND p.userID IN (SELECT CASE
            WHEN f.friendID = ? THEN f.friendeeID
            ELSE f.friendID
        END FROM FRIEND f WHERE f.friendID = ? OR f.friendeeID = ?)
        ORDER BY p.postID DESC`
        db.query(postQuery, [req.params.userID, req.params.userID, req.params.userID, req.params.userID], (err, data) => {
            if (err) return res.status(500).json(err)
            return res.json(data)
        })
    })

    //deleting a user's own post
    app.delete("/posts/:postID", (req, res) => {
        const { postID } = req.params
        console.log("Deleting post:", postID)

        db.query("DELETE FROM UPLOADED WHERE postID = ?", [postID, postID], (err) => {
        db.query("DELETE FROM POSTS WHERE postID = ?", [postID], (err) => {
                if (err) return res.status(500).json(err)
                return res.json("Post deleted successfully")
        })})
    })

    // getting a user's own boards
    app.get("/boards/user/:userID", (req, res) => {
        //get all boards, and specify where they are to response
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
            WHERE b.userID = ?
            ORDER BY b.boardID DESC`
        db.query(postQuery, [req.params.userID], (err, data) => {
            if (err) return res.status(500).json(err)
            return res.json(data)
        })
    })

    //getting boards that are different from a user's own
    app.get("/otherBoards/user/:userID", (req, res) => {
        // make sure to show boards that does not belong to user from req, and are public only
        const postQuery = `SELECT b.boardID, b.userID, b.boardDesc, b.privStatus, u.username, u.userID,
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
        LEFT JOIN USERS u ON u.userID = b.userID 
        WHERE NOT b.userID = ? AND b.privStatus = 'public'
        ORDER BY b.boardID DESC`
        db.query(postQuery, [req.params.userID], (err, data) => {
            if (err) return res.status(500).json(err)
            return res.json(data)
        })
    })

    // editing a user's own board (description and privacy only — type-specific fields are fixed)
    app.put("/boards/:boardID", (req, res) => {
        const { boardDesc, privStatus } = req.body
        db.query("UPDATE BOARDS SET boardDesc = ?, privStatus = ? WHERE boardID = ?",
            [boardDesc, privStatus, req.params.boardID], (err) => {
            if (err) return res.status(500).json(err.sqlMessage || err)
            return res.json("Board updated successfully")
        })
    })

    //getting all friends boards and is not the user's own
    app.get("/fBoards/user/:userID", (req, res) => {
        const postQuery = `SELECT b.boardID, b.userID, b.boardDesc, b.privStatus, u.username, u.userID,
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
        LEFT JOIN USERS u ON u.userID = b.userID
        WHERE NOT b.userID = ?
        AND b.userID IN (SELECT CASE
            WHEN f.friendID = ? THEN f.friendeeID
            ELSE f.friendID
        END FROM FRIEND f WHERE f.friendID = ? OR f.friendeeID = ?)
        ORDER BY b.boardID DESC`
        db.query(postQuery, [req.params.userID, req.params.userID, req.params.userID, req.params.userID], (err, data) => {
            if (err) return res.status(500).json(err)
            return res.json(data)
        })
    })

    //deleting a user's own board
    app.delete("/boards/:boardID", (req, res) => {
        const { boardID } = req.params
        console.log("Deleting board:", boardID)

        //delete subtypes first due to foreign key constraints
        db.query("DELETE FROM EVENTBOARD WHERE boardID = ?", [boardID], (err) => {
        db.query("DELETE FROM JOBBOARD WHERE boardID = ?", [boardID], (err) => {
        db.query("DELETE FROM QUESTIONBOARD WHERE boardID = ?", [boardID], (err) => {
        db.query("SELECT postID FROM UPLOADED WHERE boardID = ?", [boardID], (err, posts) => {
        console.log("Deleting posts from boards:", posts)
        db.query("DELETE FROM UPLOADED WHERE boardID = ?", [boardID], (err) => {
            if (err) return res.status(500).json(err)

            if (posts.length > 0) {
              const postIDs = posts.map(p => p.postID)
              db.query("DELETE FROM POSTS WHERE postID IN (?)", [postIDs], (err) => {
                if (err) return res.status(500).json(err)

                db.query("DELETE FROM BOARDS WHERE boardID = ?", [boardID], (err) => {
                  if (err) return res.status(500).json(err)
                  return res.json("Board deleted successfully")
                })
              })
            } else {
              db.query("DELETE FROM BOARDS WHERE boardID = ?", [boardID], (err) => {
                if (err) return res.status(500).json(err)
                return res.json("Board deleted successfully")
            })}
        })})})})})
    })

    // editing a user's own group (name and description only)
    app.put("/groups/:groupID", (req, res) => {
        const { groupName, groupDesc } = req.body
        db.query("UPDATE SOCIAL_GROUP SET groupName = ?, groupDesc = ? WHERE groupID = ?",
            [groupName, groupDesc, req.params.groupID], (err) => {
            if (err) return res.status(500).json(err.sqlMessage || err)
            return res.json("Group updated successfully")
        })
    })

    // leaving a group that a user is in
    app.delete("/groups/leave", (req, res) => {
        const { userID, groupID } = req.body
        console.log("Leaving group:", groupID, "user:", userID)

        db.query("DELETE FROM GROUP_MEMBERS WHERE groupID = ? AND userID = ?", [groupID, userID], (err) => {
            if (err) return res.status(500).json(err)
            return res.json("Left group successfully")
        })
    })

    // joining a group that a user is not in
    app.post("/groups/join", (req, res) => {
        const { userID, groupID } = req.body
        console.log("Joining group:", groupID, "user:", userID)

        // first check if already a member
        db.query("SELECT * FROM GROUP_MEMBERS WHERE groupID = ? AND userID = ?", [groupID, userID], (err, rows) => {
            if (err) return res.status(500).json(err)
            if (rows.length > 0) return res.status(409).json("Already a member of this group")

            db.query("INSERT INTO GROUP_MEMBERS (groupID, userID) VALUES (?, ?)", [groupID, userID], (err) => {
            if (err) return res.status(500).json(err)
            return res.json("Joined group successfully")
            })
        })
    })

    // getting all groups a user is not in
    app.get("/otherGroups/user/:userID", (req, res) => {
        //get all groups, and specify where they are to response
        const postQuery = `SELECT sg.groupID, sg.groupName, sg.groupDesc, COUNT(DISTINCT gm.userID) AS numMembers,
        CASE
            WHEN c.groupID IS NOT NULL THEN 'Course'
            WHEN m.groupID IS NOT NULL THEN 'Major'
            WHEN cl.groupID IS NOT NULL THEN 'Club'
        ELSE 'General'
            END AS groupType, c.courseCode, m.department, cl.clubAff
        FROM SOCIAL_GROUP sg
            LEFT JOIN GROUP_MEMBERS gm ON sg.groupID = gm.groupID
            LEFT JOIN COURSE c ON sg.groupID = c.groupID
            LEFT JOIN MAJOR m ON sg.groupID = m.groupID
            LEFT JOIN CLUB cl ON sg.groupID = cl.groupID
            WHERE sg.groupID NOT IN (SELECT groupID FROM GROUP_MEMBERS WHERE userID = ?)
        GROUP BY sg.groupID, sg.groupName, sg.groupDesc, groupType, c.courseCode, m.department, cl.clubAff
        ORDER BY sg.groupID DESC`
        db.query(postQuery, [req.params.userID], (err, data) => {
            if (err) return res.status(500).json(err)
            return res.json(data)
        })
    })

    //get all groups of a user's friends and that a user is not in
    app.get("/fGroups/user/:userID", (req, res) => {
        //get all groups, and specify where they are to response
        const postQuery = `SELECT sg.groupID, sg.groupName, sg.groupDesc, COUNT(DISTINCT gm.userID) AS numMembers,
        CASE
            WHEN c.groupID IS NOT NULL THEN 'Course'
            WHEN m.groupID IS NOT NULL THEN 'Major'
            WHEN cl.groupID IS NOT NULL THEN 'Club'
        ELSE 'General'
            END AS groupType, c.courseCode, m.department, cl.clubAff
        FROM SOCIAL_GROUP sg
            LEFT JOIN GROUP_MEMBERS gm ON sg.groupID = gm.groupID
            LEFT JOIN COURSE c ON sg.groupID = c.groupID
            LEFT JOIN MAJOR m ON sg.groupID = m.groupID
            LEFT JOIN CLUB cl ON sg.groupID = cl.groupID
            WHERE sg.groupID NOT IN (SELECT groupID FROM GROUP_MEMBERS WHERE userID = ?)
            AND sg.groupID IN (SELECT gm2.groupID FROM GROUP_MEMBERS gm2
            WHERE gm2.userID IN (SELECT CASE
                WHEN f.friendID = ? THEN f.friendeeID
                ELSE f.friendID
            END FROM FRIEND f WHERE f.friendID = ? OR f.friendeeID = ?))
        GROUP BY sg.groupID, sg.groupName, sg.groupDesc, groupType, c.courseCode, m.department, cl.clubAff
        ORDER BY sg.groupID DESC`
        db.query(postQuery, [req.params.userID, req.params.userID, req.params.userID, req.params.userID], (err, data) => {
            if (err) return res.status(500).json(err)
            return res.json(data)
        })
    })

    // getting all groups a user is in
    app.get("/groups/user/:userID", (req, res) => {
        //get all groups, and specify where they are to response
        const postQuery = `SELECT sg.groupID, sg.groupName, sg.groupDesc, COUNT(DISTINCT gm.userID) AS numMembers,
        CASE
            WHEN c.groupID IS NOT NULL THEN 'Course'
            WHEN m.groupID IS NOT NULL THEN 'Major'
            WHEN cl.groupID IS NOT NULL THEN 'Club'
        ELSE 'General'
            END AS groupType, c.courseCode, m.department, cl.clubAff
        FROM SOCIAL_GROUP sg
            LEFT JOIN GROUP_MEMBERS gm ON sg.groupID = gm.groupID
            LEFT JOIN COURSE c ON sg.groupID = c.groupID
            LEFT JOIN MAJOR m ON sg.groupID = m.groupID
            LEFT JOIN CLUB cl ON sg.groupID = cl.groupID
            WHERE sg.groupID IN (SELECT groupID FROM GROUP_MEMBERS WHERE userID = ?)
        GROUP BY sg.groupID, sg.groupName, sg.groupDesc, groupType, c.courseCode, m.department, cl.clubAff
        ORDER BY sg.groupID DESC`
        db.query(postQuery, [req.params.userID], (err, data) => {
            if (err) return res.status(500).json(err)
            return res.json(data)
        })
    })

    // getting all members of a group
    app.get("/groups/:groupID/members", (req, res) => {
        const postQuery = `SELECT u.userID, u.fname, u.lname, u.username
        FROM GROUP_MEMBERS gm
        JOIN USERS u ON gm.userID = u.userID
        WHERE gm.groupID = ?`
        db.query(postQuery, [req.params.groupID], (err, data) => {
            if (err) return res.status(500).json(err)
            return res.json(data)
        })
    })

    // deleting a group 
     app.delete("/groups/:groupID", (req, res) => {
        const { groupID } = req.params
        console.log("Deleting group:", groupID)

        //delete subtypes first due to foreign key constraints
        db.query("DELETE FROM GROUP_MEMBERS WHERE groupID = ?", [groupID], (err) => {
        db.query("DELETE FROM MAJOR WHERE groupID = ?", [groupID], (err) => {
        db.query("DELETE FROM COURSE WHERE groupID = ?", [groupID], (err) => {
        db.query("DELETE FROM CLUB WHERE groupID = ?", [groupID], (err) => {
        db.query("DELETE FROM SOCIAL_GROUP WHERE groupID = ?", [groupID], (err) => {
            if (err) return res.status(500).json(err)
            return res.json("Group deleted successfully")
        })})})})})
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

    // Admin: remove a university page
    app.delete("/admin/page/uni/:userID", (req, res) => {
        db.query("DELETE FROM UNIPAGE WHERE userID = ?", [req.params.userID], (err) => {
            if (err) return res.status(500).json(err)
            return res.json("University page removed")
        })
    })

    // Admin: remove a company page
    app.delete("/admin/page/comp/:userID", (req, res) => {
        db.query("DELETE FROM COMPPAGE WHERE userID = ?", [req.params.userID], (err) => {
            if (err) return res.status(500).json(err)
            return res.json("Company page removed")
        })
    })

    // Admin: get all users
    app.get("/admin/users", (req, res) => {
        const q = `
            SELECT u.userID, u.fname, u.lname, u.username,
                CASE
                    WHEN a.userID IS NOT NULL THEN 'admin'
                    WHEN s.userID IS NOT NULL THEN 'student'
                    WHEN f.userID IS NOT NULL THEN 'faculty'
                    WHEN c.userID IS NOT NULL THEN 'company'
                END AS accountType,
                COALESCE(s.personalEmail, f.universityEmail, c.businessEmail) AS email
            FROM USERS u
            LEFT JOIN ADMINS a ON u.userID = a.userID
            LEFT JOIN STUDENT s ON u.userID = s.userID
            LEFT JOIN FACULTY f ON u.userID = f.userID
            LEFT JOIN COMPANY_REP c ON u.userID = c.userID
        `
        db.query(q, (err, data) => {
            if (err) return res.status(500).json(err.sqlMessage || err)
            return res.json(data)
        })
    })

    // Admin: remove a user and all their subtype records
    app.delete("/admin/user/:userID", (req, res) => {
        const { userID } = req.params
        const deletes = [
            "DELETE FROM UNIPAGE WHERE userID = ?",
            "DELETE FROM COMPPAGE WHERE userID = ?",
            "DELETE FROM UPLOADED WHERE userID = ?",
            "DELETE FROM POSTS WHERE userID = ?",
            "DELETE FROM EVENTBOARD WHERE userID = ?",
            "DELETE FROM QUESTIONBOARD WHERE userID = ?",
            "DELETE FROM JOBBOARD WHERE userID = ?",
            "DELETE FROM BOARDS WHERE userID = ?",
            "DELETE FROM COURSE WHERE userID = ?",
            "DELETE FROM MAJOR WHERE userID = ?",
            "DELETE FROM CLUB WHERE userID = ?",
            "DELETE FROM SOCIAL_GROUP WHERE userID = ?",
            "DELETE FROM FRIEND WHERE friendID = ? OR friendeeID = ?",
            "DELETE FROM ADMINS WHERE userID = ?",
            "DELETE FROM STUDENT WHERE userID = ?",
            "DELETE FROM FACULTY WHERE userID = ?",
            "DELETE FROM COMPANY_REP WHERE userID = ?",
            "DELETE FROM USERS WHERE userID = ?",
        ]
        let i = 0
        const runNext = () => {
            if (i >= deletes.length) return res.json("User removed")
            const q = deletes[i++]
            const params = q.includes("friendID") ? [userID, userID] : [userID]
            db.query(q, params, (err) => {
                if (err) { console.error("delete user err:", err); return res.status(500).json(err.sqlMessage || err) }
                runNext()
            })
        }
        runNext()
    })
})