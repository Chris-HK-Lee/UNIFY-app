import React from 'react'
import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import './Create.css'

const Create = () => {
  const user = JSON.parse(sessionStorage.getItem("user"));
  const { state } = useLocation();
  const userID = state?.userID ?? user?.userID;
  const [active, setActive]       = useState(null)
  const [boardType, setboardType] = useState(null)
  const [groupType, setgroupType] = useState(null) 

  const toggle = (type) => {
    if (active === type) {
      setActive(null)
    } else {
      setActive(type)
    }
  }

  const handleboard = (e) => {
    setboardType(e.target.value);
  };

  const handlegroup = (e) => {
    setgroupType(e.target.value);
  };

  const handleSubmit = async (e, type) => {
    e.preventDefault()
    const formData = Object.fromEntries(new FormData(e.target))
    const body = { ...formData, userID }

    const endpoints = {
      post:     'http://localhost:8800/posts',
      group:    'http://localhost:8800/social_group',
      board:    'http://localhost:8800/boards',
    }

    try {
      const res = await fetch(endpoints[type], {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (!res.ok) {
        const err = await res.json()
        console.error('Server error:', err)
        alert(`Failed to create ${type}: ${JSON.stringify(err)}`)
        return
      }

      const data = await res.json()
      console.log('Success:', data)
      setActive(null)       // closes the form on success
      setboardType(null)
      setgroupType(null)

    } catch (err) {
        console.error('Network error:', err)
        alert(`Network error: ${err.message}`)
    }
  }

  return (
    <div className="create-page">
      <h1>Create</h1>

      <div className="create-buttons">
        {['post', 'board', 'group'].map(type => (
          <button
            key={type}
            onClick={() => toggle(type)}
            className={active === type ? 'active' : ''}
          >
            {active === type ? `− ${type}` : `+ ${type}`}
          </button>
        ))}
      </div>

      {active === 'post' && (
        <form onSubmit={(e) => handleSubmit(e, 'post')} className="create-form">
          <h2>New post</h2>
          <div className="field">
            <label>Content</label>
            <textarea name="postContent" rows={4} placeholder="What's on your mind?" required />
          </div>
          <div className="field">
            <label>Visibility</label>
            <select name="privStatus">
              <option value="public">Public</option>
              <option value="private">Private (Friends-Only)</option>
            </select>
          </div>
          <div className="field">
            <label>Upload to a board? (optional)</label>
            <select name="boardID">
              <option value="">— None —</option>
            </select>
          </div>
          <div className="form-actions">
            <button type="button" onClick={() => setActive(null)}>Cancel</button>
            <button type="submit">Post</button>
          </div>
        </form>
      )}

      {active === 'board' && (
        <form onSubmit={(e) => handleSubmit(e, 'board')} className="create-form">
          <h2>New board</h2>
          <div className="radio-field">
            <label> board Type </label>
              <label id = "option">
                <input type="radio" name="choice" value="question" checked={boardType === 'question'} onChange={handleboard} />
                Question
              </label>
              <label id="option">
                <input type="radio" name="choice" value="event" checked={boardType === 'event'} onChange={handleboard} />
                Event
              </label>
              <label id="option">
                <input type="radio" name="choice" value="job" checked={boardType === 'job'} onChange={handleboard} />
                Job
              </label>
            </div>
          {boardType === 'question' && (
            <div className="field">
              <label>Category or Topic</label>
              <input name="category" type="text" placeholder="e.g. Study spots on campus?" required />
            </div>
          )}  
          <div className="field">
            <label>Content</label>
            <textarea name="boardDesc" rows={4} placeholder="Give a description of your board!" required />
          </div>
          <div className="field">
            <label>Visibility</label>
            <select name="privStatus">
              <option value="public">Public</option>
              <option value="private">Private (Friends-Only)</option>
            </select>
          </div>
          {boardType === 'event' && (
            <div className="field">
              <label>Event Time & Date</label>
              <input name= "eventTime" type="datetime-local" onChange={(e) => console.log(e.target.value)} required/>
              <label>Event Location</label>
              <input name="eventLoc" type="text" placeholder="e.g. HNSC 128 at UofC" required />
            </div>
          )}
          {boardType === 'job' && (
            <div className="field">
              <label>Field or Industry</label>
              <input name="jobfield" type="text" placeholder="e.g. IT Cloud Support, Business Analytics etc." required />
              <label>Employer name and Company</label>
              <input name="employerName" type="text" placeholder="e.g. Susan Lory @ Nutrien" required />
              <label>Application Deadline</label>
              <input name="appDeadline" type="datetime-local" onChange={(e) => console.log(e.target.value)} required />
            </div>
          )} 
          <div className="form-actions">
            <button type="button" onClick={() => setActive(null)}>Cancel</button>
            <button type="submit">Make board</button>
          </div>
        </form>
      )}

      {active === 'group' && (
        <form onSubmit={(e) => handleSubmit(e, 'group')} className="create-form">
          <h2>New group</h2>
          <div className="radio-field">
            <label> group Type </label>
              <label id="option">
                <input type="radio" name="choice" value="course" checked={groupType === 'course'} onChange={handlegroup} /> 
                Course
              </label>
              <label id="option">
                <input type="radio" name="choice" value="major" checked={groupType === 'major'} onChange={handlegroup} />
                Major
              </label>
              <label id="option">
                <input type="radio" name="choice" value="club" checked={groupType === 'club'} onChange={handlegroup} />
                Club
              </label>
            </div>
          <div className="field">
            <label>Name</label>
            <textarea name="groupName" rows={1} placeholder="Provide a name for your group!" required />
          </div>
          <div className="field">
            <label>Content</label>
            <textarea name="groupDesc" rows={4} placeholder="Give a description of your group!" required />
          </div>
          {groupType === 'course' && (
            <div className="field">
              <label>Course Code</label>
              <input name="courseCode" type="text" placeholder="e.g. CPSC471" required />
            </div>
          )}
          {groupType === 'major' && (
            <div className="field">
              <label>Major or Department</label>
              <input name="department" type="text" placeholder="e.g. Computer Science" required />
            </div>
          )}
          {groupType === 'club' && (
            <div className="field">
              <label>Club Affiliation</label>
              <input name="clubAff" type="text" placeholder="Enter the club's school affiliation!" required />
            </div>
          )}
          <div className="form-actions">
            <button type="button" onClick={() => setActive(null)}>Cancel</button>
            <button type="submit">Make group</button>
          </div>
        </form>
      )}
    </div>
  )
}

export default Create