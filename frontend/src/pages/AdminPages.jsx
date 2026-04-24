import React, { useState, useEffect } from 'react'

const AdminPages = () => {
    const [uni, setUni] = useState([])
    const [comp, setComp] = useState([])
    const [message, setMessage] = useState("")

    const load = () => {
        fetch("http://localhost:8800/admin/pages")
            .then(res => res.json())
            .then(data => { setUni(data.uni || []); setComp(data.comp || []) })
            .catch(err => console.error(err))
    }

    useEffect(() => { load() }, [])

    const approve = async (type, userID) => {
        setMessage("")
        const res = await fetch(`http://localhost:8800/admin/approve/${type}/${userID}`, { method: "POST" })
        const result = await res.json()
        setMessage(typeof result === "string" ? result : "Approved!")
        load()
    }

    const statusBadge = (approved) => (
        <span style={{ color: approved ? "green" : "orange", fontWeight: "bold", marginLeft: "8px" }}>
            {approved ? "Live" : "Pending"}
        </span>
    )

    return (
        <div style={{ padding: "40px" }}>
            <h2>Page Approvals</h2>
            {message && <p style={{ color: "green" }}>{message}</p>}

            <h3>University Pages</h3>
            {uni.length === 0 ? <p>No university pages yet.</p> : uni.map(p => (
                <div key={p.userID} style={{ border: "1px solid #ccc", borderRadius: "8px", padding: "16px", marginBottom: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                            <strong>{p.UniName || "(no name)"}</strong>
                            {statusBadge(p.approved)}
                            <p style={{ margin: "2px 0 0", fontSize: "0.85em", color: "#666" }}>Submitted by: {p.fname} {p.lname}</p>
                            <p style={{ margin: "4px 0 0" }}>{p.UniDesc || "(no description)"}</p>
                        </div>
                        {!p.approved && (
                            <button onClick={() => approve("uni", p.userID)}
                                style={{ backgroundColor: "#4caf50", color: "white", border: "none", padding: "8px 16px", borderRadius: "4px", cursor: "pointer" }}>
                                Approve
                            </button>
                        )}
                    </div>
                </div>
            ))}

            <h3 style={{ marginTop: "32px" }}>Company Pages</h3>
            {comp.length === 0 ? <p>No company pages yet.</p> : comp.map(p => (
                <div key={p.userID} style={{ border: "1px solid #ccc", borderRadius: "8px", padding: "16px", marginBottom: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                            <strong>{p.CompName || "(no name)"}</strong>
                            {statusBadge(p.approved)}
                            <p style={{ margin: "2px 0 0", fontSize: "0.85em", color: "#666" }}>Submitted by: {p.fname} {p.lname}</p>
                            <p style={{ margin: "4px 0 0" }}>{p.CompDesc || "(no description)"}</p>
                        </div>
                        {!p.approved && (
                            <button onClick={() => approve("comp", p.userID)}
                                style={{ backgroundColor: "#4caf50", color: "white", border: "none", padding: "8px 16px", borderRadius: "4px", cursor: "pointer" }}>
                                Approve
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}

export default AdminPages
