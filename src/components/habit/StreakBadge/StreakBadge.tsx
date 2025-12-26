import { useEffect, useRef, useState } from 'react'
import './StreakBadge.css'

const COLORFUL_STREAK_THRESHOLD = 7

interface StreakBadgeProps {
  streak: number
}

export function StreakBadge({ streak }: StreakBadgeProps) {
  const badgeRef = useRef<HTMLSpanElement>(null)
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    if (streak === 0 || hasAnimated) return

    if (typeof IntersectionObserver === 'undefined') {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            entry.target.classList.add('streak-badge-animated')
            setHasAnimated(true)
            observer.disconnect()
          }
        })
      },
      { threshold: 0.1 }
    )

    const currentRef = badgeRef.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.disconnect()
      }
    }
  }, [streak, hasAnimated])

  if (streak === 0) {
    return null
  }

  const badgeClass =
    streak > COLORFUL_STREAK_THRESHOLD
      ? 'streak-badge streak-badge-colorful'
      : 'streak-badge streak-badge-simple'

  return (
    <span ref={badgeRef} className={badgeClass} aria-label={`${streak}-day streak`}>
      {streak}-day streak
    </span>
  )
}

