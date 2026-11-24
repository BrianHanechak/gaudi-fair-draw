import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

beforeEach(() => {
  window.localStorage.clear()
})

afterEach(() => {
  cleanup()
})

describe('App', () => {
  it('deals five supplies, refills one and undoes the draw', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(
      screen.getByRole('button', { name: /deal the five supplies/i }),
    )

    expect(
      screen.getByRole('heading', { name: /the five supplies/i }),
    ).toBeInTheDocument()
    expect(
      screen.getAllByRole('heading', { name: /^supply \d$/i }),
    ).toHaveLength(5)
    expect(
      screen.getByRole('img', { name: /71 of 96 tiles left/i }),
    ).toBeInTheDocument()

    const refillButtons = screen.getAllByRole('button', {
      name: /refill supply/i,
    })
    expect(refillButtons).toHaveLength(5)
    await user.click(
      screen.getByRole('button', { name: /refill supply 1/i }),
    )
    expect(
      screen.getByRole('img', { name: /66 of 96 tiles left/i }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /undo draw/i }))
    expect(
      screen.getByRole('img', { name: /71 of 96 tiles left/i }),
    ).toBeInTheDocument()
  })

  it('deals four per supply in expert mode', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('radio', { name: /expert/i }))
    await user.click(
      screen.getByRole('button', { name: /deal the five supplies/i }),
    )

    expect(
      screen.getByRole('img', { name: /76 of 96 tiles left/i }),
    ).toBeInTheDocument()
    expect(screen.getByText(/expert · 4 per refill/i)).toBeInTheDocument()
  })

  it('resumes a game after a remount', async () => {
    const user = userEvent.setup()
    const first = render(<App />)

    await user.click(
      screen.getByRole('button', { name: /deal the five supplies/i }),
    )
    expect(
      screen.getByRole('img', { name: /71 of 96 tiles left/i }),
    ).toBeInTheDocument()

    first.unmount()
    render(<App />)

    expect(
      screen.getByRole('heading', { name: /the five supplies/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('img', { name: /71 of 96 tiles left/i }),
    ).toBeInTheDocument()
  })
})
