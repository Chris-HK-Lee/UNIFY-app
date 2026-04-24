import React, { useState, useEffect } from 'react'

const Cpage = () => {
    const user = JSON.parse(sessionStorage.getItem("user"))
    const isOwner = user?.accountType === "company"

    // Owner state
    const [page, setPage] = useState(null)
    const [editing, setEditing] = useState(false)
    const [CompName, setCompName] = useState("")
    const [CompDesc, setCompDesc] = useState("")
    const [message, setMessage] = useState("")

    // Browse state
    const [allPages, setAllPages] = useState([])
    const [selected, setSelected] = useState(null)
    const [view, setView] = useState("browse") // "browse" | "mine"

    useEffect(() => {
        fetch("http://localhost:8800/comppages")
            .then(res => res.json())
            .then(data => setAllPages(Array.isArray(data) ? data : []))
            .catch(err => console.error(err))
    }, [])

    useEffect(() => {
        if (!isOwner || !user?.userID) return
        fetch(`http://localhost:8800/comppage/${user.userID}`)
            .then(res => res.json())
            .then(data => {
                setPage(data)
                if (data) { setCompName(data.CompName || ""); setCompDesc(data.CompDesc || "") }
            })
            .catch(err => console.error(err))
    }, [isOwner, user?.userID])

    const handleSave = async () => {
        setMessage("")
        const res = await fetch(`http://localhost:8800/comppage/${user.userID}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ CompName, CompDesc }),
        })
        const result = await res.json()
        if (res.ok) {
            setPage({ userID: user.userID, CompName, CompDesc, approved: 0 })
            setEditing(false)
            setMessage(typeof result === "string" ? result : "Saved! Pending admin approval.")
        } else {
            setMessage("Failed to save.")
        }
    }

    if (selected) {
        return (
            <div style={{ padding: "40px" }}>
                <button onClick={() => setSelected(null)} style={{ marginBottom: "16px" }}>← Back</button>
                <h1>{selected.CompName}</h1>
                <p>{selected.CompDesc || "No description."}</p>
            </div>
        )
    }

    return (
        <div style={{ padding: "40px" }}>
            {isOwner && (
                <div style={{ marginBottom: "16px" }}>
                    <button onClick={() => setView("browse")} style={{ marginRight: "8px", fontWeight: view === "browse" ? "bold" : "normal" }}>Browse Pages</button>
                    <button onClick={() => setView("mine")} style={{ fontWeight: view === "mine" ? "bold" : "normal" }}>My Page</button>
                </div>
            )}

            {(!isOwner || view === "browse") && (
                <>
                    <h2>Company Pages</h2>
                    {allPages.length === 0 ? <p>No approved company pages yet.</p> : (
                        <div>
                            {allPages.map(p => (
                                <div key={p.userID} onClick={() => setSelected(p)}
                                    style={{ border: "1px solid #ccc", borderRadius: "8px", padding: "16px", marginBottom: "12px", cursor: "pointer" }}>
                                    <strong>{p.CompName}</strong>
                                    <p style={{ margin: "4px 0 0" }}>{p.CompDesc}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {isOwner && view === "mine" && (
                <>
                    <h2>Your Company Page</h2>
                    {page && !page.approved && <p style={{ color: "orange" }}>Pending admin approval.</p>}
                    {!editing ? (
                        <>
                            <h3>{page?.CompName || "No name set"}</h3>
                            <p>{page?.CompDesc || "No description set."}</p>
                            <button onClick={() => setEditing(true)}>{page ? "Edit Page" : "Create Page"}</button>
                        </>
                    ) : (
                        <>
                            <input value={CompName} onChange={e => setCompName(e.target.value)} placeholder="Company Name"
                                style={{ display: "block", marginBottom: "12px", width: "100%", padding: "8px" }} />
                            <textarea value={CompDesc} onChange={e => setCompDesc(e.target.value)} placeholder="Company Description"
                                rows={5} style={{ display: "block", marginBottom: "12px", width: "100%", padding: "8px" }} />
                            <button onClick={handleSave} style={{ marginRight: "8px" }}>Save</button>
                            <button onClick={() => setEditing(false)}>Cancel</button>
                        </>
                    )}
                    {message && <p style={{ color: "green", marginTop: "12px" }}>{message}</p>}
                </>
            )}
        </div>
    )
}

export default Cpage
