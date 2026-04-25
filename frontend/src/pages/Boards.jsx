import React, { useState, useEffect, useRef }from 'react'
import { useLocation } from 'react-router-dom'
import './Homepage.css'
import UserPopup from './userPopup'

const Boards = () => {
    const user = JSON.parse(sessionStorage.getItem("user"))
    const { state } = useLocation()
    const userID = state?.userID ?? user?.userID
    const [boards, setBoards] = useState([])
    const userPopupRef = useRef()


    useEffect(() => {
            fetch(`http://localhost:8800/otherBoards/user/${userID}`)
            .then(res => res.json())
            .then(data => setBoards(data))
            .catch(err => console.error(err))
        }, [userID])

        if (boards.length === 0) return <p className="empty">No boards from others yet.</p>
        
        const getDetail = (board) => {
            if (board.boardType === 'Question') return `Category: ${board.category}`
            if (board.boardType === 'Event')  return `Time: ${board.eventTime} | Location: ${board.eventLoc}`
            if (board.boardType === 'Job')  return `Field: ${board.jobfield} | Employer: ${board.employerName} | Deadline: ${board.appDeadline}`
            return 'General Board'
        }

        return (
            <>
            <div className="card-list">
            {boards.map(board => (
                <div className="card" key={board.groupID}>
                <div className="card-left">
                    <span className="card-sub">@{board.username}</span>
                    <span className="card-sub">{getDetail(board)}</span>
                    <span className="card-content">{board.boardDesc}</span>
                    <div className="card-actions">
                        <button onClick={() => userPopupRef.current.viewUser(board.userID)}>View User Profile</button>
                        <button>Reply</button>
                    </div>
                </div>
                <div className="card-right">
                    <span className="card-status">{board.privStatus}</span>
                </div>
                </div>
            ))}
            </div>  
            <UserPopup ref={userPopupRef} />
        </>
    )
}

export default Boards