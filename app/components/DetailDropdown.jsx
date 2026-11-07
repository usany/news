'use client'

import { useState } from 'react'

export default function DetailDropdown({ notices = [] }) {
  const [isOpen, setIsOpen] = useState(false)

  if (!notices || notices.length === 0) {
    return null
  }

  return (
    <div className="detail-dropdown" onClick={(e) => e.stopPropagation()}>
      <button
        className="detail-dropdown-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className="detail-dropdown-label">Details</span>
        <span className={`detail-dropdown-arrow ${isOpen ? 'detail-dropdown-open' : ''}`}>
          ▼
        </span>
      </button>

      {isOpen && (
        <div className="detail-dropdown-content">
          <div className="notices-list">
            {notices.map((notice) => (
              <div key={notice.id} className="notice-item">
                <div className="notice-header">
                  <h4 className="notice-title">{notice.title}</h4>
                  {notice.link && (
                    <a
                      href={notice.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="notice-link-icon"
                      title="Open notice link"
                      aria-label={`Open ${notice.title}`}
                    >
                      🔗
                    </a>
                  )}
                </div>
                {notice.category && (
                  <span className="notice-category">
                    {notice.category}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
