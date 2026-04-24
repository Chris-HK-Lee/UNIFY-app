import React, { useState, useEffect } from 'react'

const typeColor = { admin: "#9c27b0", faculty: "#1976d2", company: "#f57c00", student: "#388e3c" }

const AdminUsers = () => {
    const [users, setUsers] = useState([])
    const [message, setMessage] = useState("")
    const currentUser = JSON.parse(sessionStorage.getItem("user"))

    const load = () => {
        fetch("http://localhost:8800/admin/users")
            .then(res => res.json())
            .then(data => setUsers(Array.isArray(data) ? data : []))
            .catch(err => console.error(err))
    }

    useEffect(() => { load() }, [])

    const removeUser = async (userID) => {
        setMessage("")
        const res = await fetch(`http://localhost:8800/admin/user/${userID}`, { method: "DELETE" })
        const result = await res.json()
        setMessage(typeof result === "string" ? result : "User removed!")
        load()
    }

    return (
        <div style={{ padding: "40px" }}>
            <h2>All Users</h2>
            {message && <p style={{ color: "green" }}>{message}</p>}
            {users.length === 0 ? <p>No users found.</p> : users.map(u => (
                <div key={u.userID} style={{ border: "1px solid #ccc", borderRadius: "8px", padding: "16px", marginBottom: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                            <strong>{u.fname} {u.lname}</strong>
                            <span style={{
                                backgroundColor: typeColor[u.accountType] || "#999",
                                color: "white", fontSize: "0.75em", padding: "2px 8px",
                                borderRadius: "12px", marginLeft: "8px"
                            }}>
                                {u.accountType}
                            </span>
                            <p style={{ margin: "2px 0 0", color: "#555" }}>@{u.username}</p>
                            <p style={{ margin: "2px 0 0", fontSize: "0.85em", color: "#888" }}>{u.email}</p>
                        </div>
                        {u.userID !== currentUser?.userID && (
                            <button onClick={() => removeUser(u.userID)} style={{
                                backgroundColor: "#e53935", color: "white", border: "none",
                                padding: "8px 16px", borderRadius: "4px", cursor: "pointer"
                            }}>
                                Remove
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}

export default AdminUsers
