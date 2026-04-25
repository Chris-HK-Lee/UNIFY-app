import React, { useState, forwardRef, useImperativeHandle } from 'react'
import { useLocation } from 'react-router-dom'
import Popup from './Popup'

const ReplyPopup = forwardRef((props, ref) => {
  const user = JSON.parse(sessionStorage.getItem("user"))
  const { state } = useLocation()
  const userID = state?.userID ?? user?.userID
  const [replyPopup, setReplyPopup] = useState({
    isOpen: false,
    boardID: null,
    boardDesc: '',
    privStatus: '',
    posts: []
  })
  const [postContent, setPostContent] = useState('')

  const openReply = (board) => {
    setReplyPopup({ isOpen: true, boardID: board.boardID, boardDesc: board.boardDesc, privStatus: board.privStatus })
    setPostContent('')
  }

  const closeReplyPopup = () => {
    setReplyPopup({ isOpen: false, boardID: null, boardDesc: '', posts: [] })
    setPostContent('')
  }

  const createPost = async () => {
    if (!postContent.trim()) return
    try {
      const res = await fetch(`http://localhost:8800/boards/post`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postContent,
          privStatus: replyPopup.privStatus,
          userID,
          boardID: replyPopup.boardID
        })
      })
      if (!res.ok) {
        console.error("Post failed:", await res.text())
        return
      }

      // tell parent about the new post so it can update UI
      if (props.onPostCreated) {
        props.onPostCreated(replyPopup.boardID, {
          postContent,
          privStatus: 'public',
          userID,
          username: user.username,
          fname: user.fname,
          lname: user.lname
        })
      }

      closeReplyPopup()  

    } catch (err) {
      console.error("Posting failed:", err)
    }
  }

  useImperativeHandle(ref, () => ({ openReply }))

  return (
    <Popup
      isOpen={replyPopup.isOpen}
      onClose={closeReplyPopup}
      title={replyPopup.boardDesc || 'Board'}
    >
      <div className="field" style={{ marginTop: '16px' }}>
        <label>Write a reply</label>
        <textarea
          rows={3}
          placeholder="What's on your mind?"
          value={postContent}
          onChange={e => setPostContent(e.target.value)}
        />
      </div>

      <div className="popup-actions">
        <button className="popup-btn-cancel" onClick={closeReplyPopup}>Close</button>
        <button className="popup-btn-confirm" onClick={createPost}>Post</button>
      </div>
    </Popup>
  )
})

export default ReplyPopup