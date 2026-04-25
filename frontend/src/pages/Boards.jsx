import React, { useState, useEffect, useRef }from 'react'
import { useLocation } from 'react-router-dom'
import './Homepage.css'
import UserPopup from './userPopup'
import ReplyPopup from './replyPopup'

const Boards = () => {
    const user = JSON.parse(sessionStorage.getItem("user"))
    const { state } = useLocation()
    const userID = state?.userID ?? user?.userID
    const [boards, setBoards] = useState([])
    const [replies, setReplies] = useState([])
    const userPopupRef = useRef()
    const replyPopupRef = useRef()


        useEffect(() => {
            fetch(`http://localhost:8800/otherBoards/user/${userID}`)
            .then(res => res.json())
            .then(data => {
                if (!Array.isArray(data)) return
                setBoards(data)

                // fetch posts for every board at once
                data.forEach(board => {
                fetch(`http://localhost:8800/boards/${board.boardID}/posts`)
                    .then(res => res.json())
                    .then(posts => {
                    setReplies(prev => ({
                        ...prev,
                        [board.boardID]: Array.isArray(posts) ? posts : []
                    }))
                    })
                    .catch(err => console.error(err))
                })
            })
            .catch(err => console.error(err))
        }, [userID])

        if (boards.length === 0) return <p className="empty">No boards from others yet.</p>
        
        const getDetail = (board) => {
            if (board.boardType === 'Question') return `Category: ${board.category}`
            if (board.boardType === 'Event')  return `Time: ${board.eventTime} | Location: ${board.eventLoc}`
            if (board.boardType === 'Job')  return `Field: ${board.jobfield} | Employer: ${board.employerName} | Deadline: ${board.appDeadline}`
            return 'General Board'
        }

        const handlePostCreated = (boardID, newPost) => {
            setReplies(prev => ({
            ...prev,
            [boardID]: [...(prev[boardID] || []), newPost]
            }))
        }

        return (
        <>
        <div className="main-content">
                <h2>Explore Boards</h2>
        </div>
        <div className="card-list">
            {boards.map(board => (
            <div className="card-group" key={board.boardID}>
                <div className="card">
                    <div className="card-left">
                        <span className="card-sub">@{board.username}</span>
                        <span className="card-sub">{getDetail(board)}</span>
                        <span className="card-content">{board.boardDesc}</span>
                        <div className="card-actions">
                            <button onClick={() => userPopupRef.current.viewUser(board.userID)}>View User Profile</button>
                            <button onClick={() => replyPopupRef.current.openReply(board)}>Reply to @{board.username}</button>
                        </div>
                    </div>
                <div className="card-right">
                    <span className="card-status">{board.privStatus}</span>
            </div>
            </div>
            {replies[board.boardID]?.length > 0 && (
                <div className="board-replies">
                    {replies[board.boardID].map(post => (
                    <div className="reply-card" key={post.postID}>
                        <div className="card-left">
                        <span className="card-sub">@{post.username}</span>
                        <span className="card-content">{post.postContent}</span>
                        </div>
                        <div className="card-right">
                        <span className="card-status">{post.privStatus}</span>
                        </div>
                    </div>
                    ))}
                </div>
                )}
            </div>
        ))}
        </div>
        

        <UserPopup ref={userPopupRef} />
        <ReplyPopup ref={replyPopupRef} />
        <ReplyPopup ref={replyPopupRef} onPostCreated={handlePostCreated} />
        </>
    )
}

export default Boards