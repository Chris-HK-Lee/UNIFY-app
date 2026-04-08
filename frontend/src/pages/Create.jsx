import React from 'react'
import { useState } from 'react'
import './Create.css'

const Create = () => {
  const [active, setActive]       = useState(null)
  const [boardType, setboardType] = useState(null)
  const [groupType, setgroupType] = useState(null) 
  const userID = 1 // rn user ID is constant, later need a save state after login so that the user who is logged in is posting

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
      post:     'http://localhost:9999/posts',
      group:    'http://localhost:9999/social_group',
      course:   'http://localhost:9999/social_group/course',
      major:    'http://localhost:9999/social_group/major',
      club:     'http://localhost:9999/social_group/club',
      board:    'http://localhost:9999/boards',
      event:    'http://localhost:9999/boards/event',
      question: 'http://localhost:9999/boards/question',
      job:      'http://localhost:9999/boards/job',
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
            <button type="submit">post</button>
          </div>
        </form>
      )}

      {active === 'board' && (
        <form onSubmit={(e) => handleSubmit(e, 'board')} className="create-form">
          <h2>New board</h2>
          <div className="radio-field">
            <label> board Type </label>
              <label id = "option">
                <input type="radio" name="choice" value="Question" checked={boardType === 'Question'} onChange={handleboard} />
                Question
              </label>
              <label id="option">
                <input type="radio" name="choice" value="Event" checked={boardType === 'Event'} onChange={handleboard} />
                Event
              </label>
              <label id="option">
                <input type="radio" name="choice" value="Job" checked={boardType === 'Job'} onChange={handleboard} />
                Job
              </label>
            </div>
          <div className="field">
            <label>Content</label>
            <textarea name="boardDescription" rows={4} placeholder="Give a description of your board!" required />
          </div>
          <div className="field">
            <label>Visibility</label>
            <select name="privStatus">
              <option value="public">Public</option>
              <option value="private">Private (Friends-Only)</option>
            </select>
          </div>
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
                <input type="radio" name="choice" value="Course" checked={groupType === 'Course'} onChange={handlegroup} /> 
                Course
              </label>
              <label id="option">
                <input type="radio" name="choice" value="Major" checked={groupType === 'Major'} onChange={handlegroup} />
                Major
              </label>
              <label id="option">
                <input type="radio" name="choice" value="Club" checked={groupType === 'Club'} onChange={handlegroup} />
                Club
              </label>
            </div>
          <div className="field">
            <label>Name</label>
            <textarea name="groupName" rows={1} placeholder="Provide a name for your group!" required />
          </div>
          <div className="field">
            <label>Content</label>
            <textarea name="groupDescription" rows={4} placeholder="Give a description of your group!" required />
          </div>
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