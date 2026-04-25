import React, { useState, useEffect, useRef }from 'react'
import { useLocation } from 'react-router-dom'
import './Homepage.css'
import UserPopup from './userPopup'

const Posts = () => {
    const user = JSON.parse(sessionStorage.getItem("user"))
    const { state } = useLocation()
    const userID = state?.userID ?? user?.userID
    const [posts, setPosts] = useState([])
    const userPopupRef = useRef()

    useEffect(() => {
        fetch(`http://localhost:8800/otherPosts/user/${userID}`)
        .then(res => res.json())
        .then(data => setPosts(data))
        .catch(err => console.error(err))
    }, [userID])

    if (posts.length === 0) return <p>No posts from others yet.</p>

    return (
        <>
        <div className="card-list">
        {posts.map(post => (
            <div className="card" key={post.postID}>
            <div className="card-left">
                <span className="card-sub">@{post.username}</span>
                <span className="card-content">{post.postContent}</span>
                <div className="card-actions">
                    <button onClick={() => userPopupRef.current.viewUser(post.userID)}>View User Profile</button>
                </div>
            </div>
            <span className="card-status">{post.privStatus}</span>
            </div>
        ))}
        </div>
        <UserPopup ref={userPopupRef} />
        </>
    )
        
}

export default Posts