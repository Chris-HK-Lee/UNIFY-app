import React, { useState, forwardRef, useImperativeHandle } from 'react'
import { useLocation } from 'react-router-dom'
import Popup from './Popup'

const UserPopup = forwardRef((props, ref) => {
    const user = JSON.parse(sessionStorage.getItem("user"))
    const { state } = useLocation()
    const userID = state?.userID ?? user?.userID
    const [userPopup, setUserPopup] = useState({ isOpen: false, user: null })
    const [friendStatus, setFriendStatus] = useState('none')

    const viewUser = async (viewedUserID) => {
        try {
            const [userRes, friendRes] = await Promise.all([
            fetch(`http://localhost:8800/users/${viewedUserID}`),
            fetch(`http://localhost:8800/friend/check?friendID=${viewedUserID}&friendeeID=${userID}`)
        ])
        const data = await userRes.json()
        const friendData = await friendRes.json()

        setFriendStatus(friendData.areFriends ? 'friends' : 'none')
        setUserPopup({ isOpen: true, user: data })
        } catch (err) {
            console.error("Failed to fetch user:", err)
        }
    }

    const closeUserPopup = () => {
        setUserPopup({ isOpen: false, user: null })
        setFriendStatus('none')
    }

    const addFriend = async (friendID, friendeeID) => {
        try {
            const res = await fetch(`http://localhost:8800/friend`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ friendID, friendeeID })
            })
            const raw = await res.text()
            console.log(raw)
            if (res.ok) {
                setFriendStatus('friends')  // grey out button on success
            } else if (res.status === 409) {
                setFriendStatus('friends')  // already friends
            }
        } catch(err) {
            console.error("Friending failed:", err)
        }

    }

    useImperativeHandle(ref, () => ({ viewUser }))

    const isOwnProfile = userPopup.user?.userID === userID

    return (
        <Popup isOpen={userPopup.isOpen} onClose={closeUserPopup} title="User Profile" >
        {userPopup.user && (
            <div className="card-left">
                <div className="sidebar-name">{userPopup.user.fname} {userPopup.user.lname}</div>
                <div className="sidebar-acc">@{userPopup.user.username}</div>
                <div className="sidebar-type">{userPopup.user.accountType}</div>
            {!isOwnProfile && (
                <div className="card-actions">
                    <button
                        onClick={() => addFriend(userPopup.user.userID, userID)}
                        disabled={friendStatus === 'friends'}
                        style={{
                            backgroundColor: friendStatus === 'friends' ? '#ccc' : '',
                            cursor: friendStatus === 'friends' ? 'not-allowed' : 'pointer',
                            color: friendStatus === 'friends' ? '#888' : ''
                        }}
                    > {friendStatus === 'friends' ? 'Friended' : 'Friend'}
                </button>
            </div>
            )}
        </div>
        )}
            <div className="popup-actions">
                <button className="popup-btn-cancel" onClick={closeUserPopup}>Close</button>
            </div>
        </Popup>
    )
})

export default UserPopup