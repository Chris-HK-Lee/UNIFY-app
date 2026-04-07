import React from 'react'
import { useState } from 'react'
import './Create.css'

const Create = () => {
  const [active, setActive]       = useState(null)
  const [boardType, setBoardType] = useState(null)
  const [groupType, setGroupType] = useState(null) 
  const userID = 1

  const toggle = (type) => {
    if (active === type) {
      setActive(null)
    } else {
      setActive(type)
    }
  }

  const handleSubmit = async (e, type) => {
    e.preventDefault()
    const formData = Object.fromEntries(new FormData(e.target))
    const body = { ...formData, userID }

    const endpoints = {
      post:     'http://localhost:9999/posts',
      generalG: 'http://localhost:9999/social_group',
      course:   'http://localhost:9999/social_group/course',
      major:    'http://localhost:9999/social_group/major',
      club:     'http://localhost:9999/social_group/club',
      generalB: 'http://localhost:9999/boards',
      event:    'http://localhost:9999/boards/event',
      question: 'http://localhost:9999/boards/question',
      job:      'http://localhost:9999/boards/job',
    }

    try {
      const res = await fetch(endpoints[type], {
        method: 'POST',
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
      setBoardType(null)
      setGroupType(null)

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
          <h2>New Post</h2>
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
    </div>
  )
}

export default Create