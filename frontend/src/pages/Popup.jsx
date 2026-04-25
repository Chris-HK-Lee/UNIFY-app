import React from 'react'
import './Popup.css'

const Popup = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-box" onClick={e => e.stopPropagation()}>
        <div className="popup-header">
          <h3 className="popup-title">{title}</h3>
          <button className="popup-close" onClick={onClose}>×</button>
        </div>
        <div className="popup-body">
          {children}
        </div>
      </div>
    </div>
  )
}

export default Popup