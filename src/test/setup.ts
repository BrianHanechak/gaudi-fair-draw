import '@testing-library/jest-dom/vitest'

// jsdom does not implement scrolling; the app scrolls to the top on view changes.
window.scrollTo = () => {}
