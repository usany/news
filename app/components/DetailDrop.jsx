'use client'

import { useState } from 'react'
import styles from './DetailDropdown.module.css'

export default function DetailDropdown({ notices = [] }) {
  const [isOpen, setIsOpen] = useState(false)

  if (!notices || notices.length === 0) {
    return null
  }

  return (
    <div className={styles.detailDropdown} onClick={(e) => e.stopPropagation()}>
      <button
        className={styles.toggleButton}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className={styles.label}>Details</span>
        <span className={`${styles.arrow} ${isOpen ? styles.open : ''}`}>
          ▼
        </span>
      </button>

      {isOpen && (
        <div className={styles.dropdownContent}>
          <div className={styles.noticesList}>
            {notices.map((notice) => (
              <div key={notice.id} className={styles.noticeItem}>
                <div className={styles.noticeHeader}>
                  <h4 className={styles.noticeTitle}>{notice.title}</h4>
                  {notice.link && (
                    <a
                      href={notice.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.linkIcon}
                      title="Open notice link"
                      aria-label={`Open ${notice.title}`}
                    >
                      🔗
                    </a>
                  )}
                </div>
                {notice.category && (
                  <span className={styles.category}>
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
