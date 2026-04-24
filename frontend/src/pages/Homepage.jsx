import React, { useState, useEffect }from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import './Homepage.css'
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

        return (
            <div className="card-list">
            {posts.map(post => (
                <div className="card" key={post.postID}>
                <div className="card-left">
                    <span className="card-sub">@{user.username}</span>
                    <p className="card-content">{post.postContent}</p>
                </div>
                <span className="card-status">{post.privStatus}</span>
                </div>
            ))}
            </div>
        )
    }

    const UserBoards = ({ userID }) => {
    const [boards, setBoards] = useState([])

        useEffect(() => {
            fetch(`http://localhost:8800/boards/user/${userID}`)
            .then(res => res.json())
            .then(data => setBoards(data))
            .catch(err => console.error(err))
        }, [userID])

        if (boards.length === 0) return <p className="empty">No boards yet.</p>
        
        const getDetail = (board) => {
            if (board.boardType === 'Question') return `Category: ${board.category}`
            if (board.boardType === 'Event')  return `Time: ${board.eventTime} | Location: ${board.eventLoc}`
            if (board.boardType === 'Job')  return `Field: ${board.jobfield} | Employer: ${board.employerName} | Deadline: ${board.appDeadline}`
            return 'General Board'
        }

        return (
            <div className="card-list">
            {boards.map(board => (
                <div className="card" key={board.groupID}>
                <div className="card-left">
                    <span className="card-sub">{getDetail(board)}</span>
                    <p className="card-sub">{board.boardDesc}</p>
                    <div className="card-actions">
                        <button>Leave</button>
                        <button>Edit</button>
                        <button>Delete</button>
                    </div>
                    
                </div>
                <div className="card-right">
                    <span className="card-status">{board.privStatus}</span>
                </div>
                </div>
            ))}
            </div>
        )
    }

    const UserGroups = ({ userID }) => {
        const [groups, setGroups] = useState([])

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
            if (group.groupType === 'Club')   return `Club Rep Name: ${group.repFname} ${group.repLname}`
            return 'General Group'
        }

        return (
            <div className="card-list">
            {groups.map(group => (
                <div className="card" key={group.groupID}>
                <div className="card-left">
                    <span className="card-sub">{getDetail(group)}</span>
                    <p className="card-sub">{group.groupDesc}</p>
                    <div className="card-actions">
                        <button className="card-button">Leave</button>
                        <button className="card-button">Edit</button>
                        <button className="card-button">Delete</button>
                    </div>
                    
                </div>
                <div className="card-right">
                    <span className="card-detail" >{group.groupName}</span>
                    <button className="card-button">{group.numberOfMembers} members</button>
                </div>
                </div>
            ))}
            </div>
        )
    }

    const renderPage = () => {
        if (activePage === 'home')    
            return <div className="main-content">
                <h2>Welcome, {user?.fname} {user?.lname}!</h2>
                <p>Account type: {user?.accountType}</p>
                <p>User ID: {userID}</p>
            <div className="profile-tabs">
                <button className={profileTab === 'posts'  ? 'active' : ''} onClick={() => setProfileTab('posts')}>My Posts</button>
                <button className={profileTab === 'boards' ? 'active' : ''} onClick={() => setProfileTab('boards')}>My Boards</button>
                <button className={profileTab === 'groups' ? 'active' : ''} onClick={() => setProfileTab('groups')}>My Groups</button>
            </div>

            <div className="profile-tab-content">
                {profileTab === 'posts'  && <UserPosts  userID={userID} />}
                {profileTab === 'boards' && <UserBoards userID={userID} />}
                {profileTab === 'groups' && <UserGroups userID={userID} />}
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
          <div>
            <p className="sidebar-name">{user?.fname} {user?.lname}</p>
            <p className="sidebar-acc">@{user?.username}</p>
            <p className="sidebar-type">{user?.accountType}</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button className={activePage === 'home'   ? 'active' : ''} onClick={() => setActivePage('home')}>Home</button>
          <button className={activePage === 'create' ? 'active' : ''} onClick={() => setActivePage('create')}>Create</button>
          <button className={activePage === 'pages'  ? 'active' : ''} onClick={() => setActivePage('posts')}>Posts</button>
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