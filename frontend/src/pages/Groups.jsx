import React, { useState, useEffect, useRef }from 'react'
import { useLocation } from 'react-router-dom'
import './Homepage.css'
import ViewPopup from './viewPopup'

const Groups = () => {
    const user = JSON.parse(sessionStorage.getItem("user"))
    const { state } = useLocation()
    const userID = state?.userID ?? user?.userID
    const [groups, setGroups] = useState([])
    const viewPopupRef = useRef()
    
    useEffect(() => {
        fetch(`http://localhost:8800/otherGroups/user/${userID}`)
        .then(res => res.json())
        .then(data => setGroups(data))
        .catch(err => console.error(err))
    }, [userID])
    
    
    if (groups.length === 0) return <p className="empty">No groups from others yet.</p>

    const getDetail = (group) => {
        if (group.groupType === 'Course') return `Course: ${group.courseCode}`
        if (group.groupType === 'Major')  return `Department: ${group.department}`
        if (group.groupType === 'Club')   return `Club Rep Name: ${group.repFname} ${group.repLname}`
        return 'General Group'
    }

    const joinGroup = async (userID, groupID) => {
        try {
            const res = await fetch(`http://localhost:8800/groups/join`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userID, groupID })
            })
            const raw = await res.text()
            console.log(raw)
            setGroups(prev => prev.filter(g => g.groupID !== groupID))
        } catch (err) {
            console.error("Join failed:", err)
        }
    }

    return (
        <>
        <div className="main-content">
            <h2>Explore Groups</h2>
        </div>
        <div className="card-list">
        {groups.map(group => (
            <div className="card" key={group.groupID}>
            <div className="card-left">
                <span className="card-sub">{getDetail(group)}</span>
                <span className="card-content">{group.groupDesc}</span>
                <div className="card-actions">
                    <button onClick={() => joinGroup(userID, group.groupID)}>Join</button>
                </div>
            </div>
            <div className="card-right">
                <span className="card-detail" >{group.groupName}</span>
                <button className="card-button" onClick={() => viewPopupRef.current.viewMembers(group)} >View {group.numMembers} members</button>
            </div>
            </div>
        ))}
        </div>

    <ViewPopup ref={viewPopupRef} /> 
    </>
    )
}

export default Groups