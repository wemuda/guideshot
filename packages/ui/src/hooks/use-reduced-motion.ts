import * as React from 'react'

function getReducedMotionPreference() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = React.useState(
    getReducedMotionPreference
  )

  React.useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(query.matches)

    update()
    query.addEventListener('change', update)

    return () => query.removeEventListener('change', update)
  }, [])

  return reducedMotion
}

export { useReducedMotion }
