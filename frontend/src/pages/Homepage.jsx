import React, { useState, useEffect, useRef }from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import './Homepage.css'
import ViewPopup from './viewPopup'
import ReplyPopup from './replyPopup'
import Create from './Create'
import Posts from './Posts'
import Boards from './Boards'
import Groups from './Groups'
import Cpage from './Cpage'
import Upage from './Upage'
import AdminPages from './AdminPages'
import AdminUsers from './AdminUsers'


const Homepage = () => {
    const user = JSON.parse(sessionStorage.getItem("user"))
    const { state } = useLocation()
    const userID = state?.userID ?? user?.userID
    const nav = useNavigate()
    const [activePage, setActivePage] = useState('home')
    const [profileTab, setProfileTab] = useState('posts')

    const UserPosts = ({ userID }) => {
        const [posts, setPosts] = useState([])

        useEffect(() => {
            fetch(`http://localhost:8800/posts/user/${userID}`)
            .then(res => res.json())
            .then(data => setPosts(data))
            .catch(err => console.error(err))
        }, [userID])


        if (posts.length === 0) return <p>No posts yet.</p>

        const delPost = async (postID) => {
            try {
            const res = await fetch(`http://localhost:8800/posts/${postID}`, {
                method: 'DELETE'
            })
            const raw = await res.text()
            console.log(raw)
            // remove from UI without refetching
            setPosts(prev => prev.filter(p => p.postID !== postID))
            } catch (err) {
            console.error("Delete failed:", err)
            }
        }

        return (
            <div className="card-list">
            {posts.map(post => (
                <div className="card" key={post.postID}>
                <div className="card-left">
                    <span className="card-sub">@{user.username}</span>
                    <span className="card-content">{post.postContent}</span>
                    <div className="card-actions">
                        <button>Edit</button>
                        <button onClick={() => delPost(post.postID)}>Delete</button>
                    </div>
                </div>
                <span className="card-status">{post.privStatus}</span>
                </div>
            ))}
            </div>
        )
    }

    const UserBoards = ({ userID }) => {
        const [boards, setBoards] = useState([])
        const [replies, setReplies] = useState([])
        const replyPopupRef = useRef()

        useEffect(() => {
            fetch(`http://localhost:8800/boards/user/${userID}`)
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

        if (boards.length === 0) return <p className="empty">No boards yet.</p>
        
        const getDetail = (board) => {
            if (board.boardType === 'Question') return `Category: ${board.category}`
            if (board.boardType === 'Event')  return `Time: ${board.eventTime} | Location: ${board.eventLoc}`
            if (board.boardType === 'Job')  return `Field: ${board.jobfield} | Employer: ${board.employerName} | Deadline: ${board.appDeadline}`
            return 'General Board'
        }

        const delBoard = async (boardID) => {
            try {
            const res = await fetch(`http://localhost:8800/boards/${boardID}`, {
                method: 'DELETE'
            })
            const raw = await res.text()
            console.log(raw)
            // remove from UI without refetching
            setBoards(prev => prev.filter(b => b.boardID !== boardID))
            } catch (err) {
            console.error("Delete failed:", err)
            }
        }

        const handlePostCreated = (boardID, newPost) => {
            setReplies(prev => ({
            ...prev,
            [boardID]: [...(prev[boardID] || []), newPost]
            }))
        }

        return (
            <>
            <div className="card-list">
            {boards.map(board => (
                <div className="card-group" key={board.groupID}>
                    <div className="card">
                <div className="card-left">
                    <span className="card-sub">{getDetail(board)}</span>
                    <span className="card-content">{board.boardDesc}</span>
                    <div className="card-actions">
                        <button>Edit</button>
                        <button onClick={() => replyPopupRef.current.openReply(board)}>Reply</button>
                        <button onClick={() => delBoard(board.boardID)}>Delete</button>
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

            <ReplyPopup ref={replyPopupRef} />
            <ReplyPopup ref={replyPopupRef} onPostCreated={handlePostCreated} />
            </>
        )
    }

    const UserGroups = ({ userID }) => {
        const [groups, setGroups] = useState([])
        const viewPopupRef = useRef()

        useEffect(() => {
            fetch(`http://localhost:8800/groups/user/${userID}`)
            .then(res => res.json())
            .then(data => setGroups(data))
            .catch(err => console.error(err))
        }, [userID])


        if (groups.length === 0) return <p className="empty">No groups yet.</p>

        const getDetail = (group) => {
            if (group.groupType === 'Course') return `Course: ${group.courseCode}`
            if (group.groupType === 'Major')  return `Department: ${group.department}`
            if (group.groupType === 'Club')   return `Affiliation: ${group.clubAff}`
            return 'General Group'
        }

        const leaveGroup = async (userID, groupID) => {
            try {
                const res = await fetch(`http://localhost:8800/groups/leave`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userID, groupID })
                })
                const raw = await res.text()
                console.log(raw)
                setGroups(prev => prev.filter(g => g.groupID !== groupID))
            } catch (err) {
                console.error("Leave failed:", err)
            }
        }

        return(
            <>
            <div className="card-list">
            {groups.map(group => (
                <div className="card" key={group.groupID}>
                <div className="card-left">
                    <span className="card-sub">{getDetail(group)}</span>
                    <span className="card-content">{group.groupDesc}</span>
                    <div className="card-actions">
                        <button onClick={() => leaveGroup(user.userID, group.groupID)}>Leave</button>
                    </div>
                    
                </div>
                <div className="card-right">
                    <span className="card-detail" >{group.groupName}</span>
                    <button className="card-button" onClick={() => viewPopupRef.current.viewMembers(group)}>View {group.numMembers} members</button>
                </div>
                </div>
            ))}
            </div>

            <ViewPopup ref={viewPopupRef} /> 
            </>
        )
    }

    const UserFriends = ({ userID }) => {
        const [friends, setFriends] = useState([])

        useEffect(() => {
            fetch(`http://localhost:8800/friend/user/${userID}`)
            .then(res => res.json())
            .then(data => setFriends(data))
            .catch(err => console.error(err))
        }, [userID])

        if (friends.length === 0) return <p className="empty">No friends yet.</p>

        const unfriend = async (friendID, friendeeID) => {
            try {
                const res = await fetch(`http://localhost:8800/unfriend`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ friendID, friendeeID })
                })
                const raw = await res.text()
                console.log(raw)
                setFriends(prev => prev.filter(g => g.userID !== friendID))
            } catch (err) {
                console.error("Unfriend failed:", err)
            }
        }

        return(
            <div className="card-list">
            {friends.map(friend => (
                <div className="card" key={friend.userID}>
                <div className="card-left">
                    <span className="card-content">{friend.fname} {friend.lname}</span>
                    <span className="card-sub">@{friend.username}</span>
                    <span className="card-sub2">{friend.accountType}</span>
                    
                </div>
                <div className="card-right">
                    <div className="card-actions">
                        <button onClick={() => unfriend(friend.userID, userID)}>Unfriend</button>
                    </div>
                </div>
                </div>
            ))}
            </div>
        )

        
    }

    const renderPage = () => {
        if (activePage === 'home')    
            return <div className="main-content">
                <h2>Welcome, {user?.fname}!</h2>
                <p>Account type: {user?.accountType}</p>
                <p>User ID: {userID}</p>
            <div className="profile-tabs">
                <button className={profileTab === 'posts'  ? 'active' : ''} onClick={() => setProfileTab('posts')}>My Posts</button>
                <button className={profileTab === 'boards' ? 'active' : ''} onClick={() => setProfileTab('boards')}>My Boards</button>
                <button className={profileTab === 'groups' ? 'active' : ''} onClick={() => setProfileTab('groups')}>My Groups</button>
                <button className={profileTab === 'friends' ? 'active' : ''} onClick={() => setProfileTab('friends')}>My Friends</button>
            </div>

            <div className="profile-tab-content">
                {profileTab === 'posts'  && <UserPosts  userID={userID} />}
                {profileTab === 'boards' && <UserBoards userID={userID} />}
                {profileTab === 'groups' && <UserGroups userID={userID} />}
                {profileTab === 'friends' && <UserFriends userID={userID} />}
            </div>
        </div>
    if (activePage === 'create') return <Create />
    if (activePage === 'posts') return <Posts />
    if (activePage === 'boards') return <Boards />
    if (activePage === 'groups') return <Groups />
    if (activePage === 'cpage') return <Cpage />
    if (activePage === 'upage') return <Upage />
    if (activePage === 'adminpages') return <AdminPages />
    if (activePage === 'adminusers') return <AdminUsers />
  }

  return (
    <div className="homepage-layout">

      <div className="sidebar">
        <div className="sidebar-user">
            <p className="sidebar-logo">UNI-FY</p>
          <div>
            <p className="sidebar-name">{user?.fname} {user?.lname}</p>
            <p className="sidebar-acc">@{user?.username}</p>
            <p className="sidebar-type">{user?.accountType}</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button className={activePage === 'home'   ? 'active' : ''} onClick={() => setActivePage('home')}>Home</button>
          <button className={activePage === 'create' ? 'active' : ''} onClick={() => setActivePage('create')}>Create</button>
          <button className={activePage === 'posts'  ? 'active' : ''} onClick={() => setActivePage('posts')}>Posts</button>
          <button className={activePage === 'boards' ? 'active' : ''} onClick={() => setActivePage('boards')}>Boards</button>
          <button className={activePage === 'groups' ? 'active' : ''} onClick={() => setActivePage('groups')}>Groups</button>
          <button className={activePage === 'upage' ? 'active' : ''} onClick={() => setActivePage('upage')}>University Pages</button>
          <button className={activePage === 'cpage' ? 'active' : ''} onClick={() => setActivePage('cpage')}>Company Pages</button>
          {user?.accountType === 'admin' && <button className={activePage === 'adminpages' ? 'active' : ''} onClick={() => setActivePage('adminpages')}>Page Approvals</button>}
          {user?.accountType === 'admin' && <button className={activePage === 'adminusers' ? 'active' : ''} onClick={() => setActivePage('adminusers')}>Manage Users</button>}
        </nav>

        <button className="sidebar-logout" onClick={() => { sessionStorage.removeItem("user") 
        nav('/') }}> Logout </button>
      </div>

      <div className="main-panel">
        {renderPage()}
      </div>

    </div>
  )
}

export default Homepage