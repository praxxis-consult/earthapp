import { useCallback, useEffect, useRef, useState } from 'react'

export const OTP_SECONDS = 24

/** Counts down from 24 (Figma "00:24") and restarts on demand. */
export function useCountdown() {
  const [seconds, setSeconds] = useState(OTP_SECONDS)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)
  const start = useCallback(() => {
    if (timer.current) clearInterval(timer.current)
    timer.current = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(timer.current!)
          return 0
        }
        return s - 1
      })
    }, 1000)
  }, [])
  const restart = useCallback(() => {
    setSeconds(OTP_SECONDS)
    start()
  }, [start])
  useEffect(() => {
    start()
    return () => {
      if (timer.current) clearInterval(timer.current)
    }
  }, [start])
  const label = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
  return { seconds, label, restart }
}
