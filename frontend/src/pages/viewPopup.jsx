import React, { useState, forwardRef, useImperativeHandle, useRef } from 'react'
import Popup from './Popup'
import UserPopup from './userPopup'

const ViewPopup = forwardRef((props, ref) => {
  const [viewPopup, setViewPopup] = useState({ isOpen: false, user: null })
  const userPopupRef = useRef()

  const viewMembers = async (group) => {
        try {
        const res = await fetch(`http://localhost:8800/groups/${group.groupID}/members`)
        const data = await res.json()
        setViewPopup({
            isOpen: true,
            groupID: group.groupID,
            groupName: group.groupName,
            members: Array.isArray(data) ? data : []
        })
        } catch (err) {
        console.error("Failed to fetch members:", err)
        }
    }

  const closeViewPopup = () => {
    setViewPopup({ isOpen: false, groupID: null, groupName: '', members: [] })
  }

  useImperativeHandle(ref, () => ({ viewMembers }))

  return (
    <>
    <Popup isOpen={viewPopup.isOpen} onClose={closeViewPopup} title={`${viewPopup.groupName} — Members`} >
        {viewPopup.members && viewPopup.members.length === 0 && ( <p className="empty">No members found.</p> )}
        {viewPopup.members && viewPopup.members.length > 0 && (
            <div className="card-list">
                {viewPopup.members.map(member => (
                <div className="card" key={member.userID}>
                <div className="card-left">
                    <div className="sidebar-name">{member.fname} {member.lname}</div>
                </div>
                <div className="card-right">
                    <span className="card-content">@{member.username}</span>
                    <div className="card-actions">
                    <button onClick={() => userPopupRef.current.viewUser(member.userID)}>View User Profile</button>
                    </div>
                </div>
            </div>
            ))}
        </div>
        )}
        <div className="popup-actions">
        <button className="popup-btn-cancel" onClick={closeViewPopup}>Close</button>
        </div>
    </Popup>
    <UserPopup ref={userPopupRef} />
    </>
  )
})

export default ViewPopup