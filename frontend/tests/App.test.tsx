import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import App from '../src/App'

function mockFetch(handlers: { health?: () => Response; chat?: (body: unknown) => Response }) {
  return vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
    const url = String(input)
    if (url.endsWith('/api/health')) {
      return handlers.health?.() ?? Response.json({ status: 'ok', app: 'x', provider: 'demo', demo_mode: true, version: '1' })
    }
    if (url.endsWith('/api/chat')) {
      const body = init?.body ? JSON.parse(String(init.body)) : {}
      return handlers.chat?.(body) ?? Response.json({ answer: 'Mock answer', provider: 'demo', demo_mode: true })
    }
    throw new Error('unexpected url ' + url)
  })
}

describe('App', () => {
  beforeEach(() => {
    // No Web Speech API in jsdom: exercises the text-only fallback.
    delete (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition
  })

  it('renders the landing page and starts the interview', async () => {
    mockFetch({})
    render(<App />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Akshat Bhardwaj')
    await userEvent.click(screen.getByRole('button', { name: /start interview/i }))
    expect(screen.getByText(/Ask me anything about my work/i)).toBeInTheDocument()
    expect(await screen.findByText('Demo mode')).toBeInTheDocument()
  })

  it('shows the voice fallback when speech recognition is unsupported', async () => {
    mockFetch({})
    render(<App />)
    await userEvent.click(screen.getByRole('button', { name: /start interview/i }))
    expect(screen.getByText(/Voice input isn’t available/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /ask by voice/i })).not.toBeInTheDocument()
  })

  it('submits a typed question and shows the answer', async () => {
    const fetchSpy = mockFetch({ chat: () => Response.json({ answer: 'I built a Gemini agent.', provider: 'demo', demo_mode: true }) })
    render(<App />)
    await userEvent.click(screen.getByRole('button', { name: /start interview/i }))
    await userEvent.type(screen.getByLabelText(/type your question/i), "What's your superpower?{enter}")
    expect(screen.getByText("What's your superpower?")).toBeInTheDocument()
    expect(await screen.findByText('I built a Gemini agent.')).toBeInTheDocument()
    expect(screen.getByText(/Demo answer/)).toBeInTheDocument()
    const chatCall = fetchSpy.mock.calls.find((c) => String(c[0]).endsWith('/api/chat'))!
    expect(JSON.parse(String(chatCall[1]?.body))).toEqual({ message: "What's your superpower?", history: [] })
  })

  it('sends a suggested question when clicked', async () => {
    mockFetch({})
    render(<App />)
    await userEvent.click(screen.getByRole('button', { name: /start interview/i }))
    await userEvent.click(screen.getByRole('button', { name: /number one superpower/i }))
    expect(await screen.findByText('Mock answer')).toBeInTheDocument()
  })

  it('shows an error with retry when the backend fails, then recovers', async () => {
    let fail = true
    mockFetch({
      chat: () => (fail ? Response.json({ detail: 'Too many requests. Please wait a moment.' }, { status: 429 }) : Response.json({ answer: 'Recovered', provider: 'demo', demo_mode: true })),
    })
    render(<App />)
    await userEvent.click(screen.getByRole('button', { name: /start interview/i }))
    await userEvent.type(screen.getByLabelText(/type your question/i), 'Hello{enter}')
    expect(await screen.findByRole('alert')).toHaveTextContent(/Too many requests/)
    fail = false
    await userEvent.click(screen.getByRole('button', { name: /retry/i }))
    expect(await screen.findByText('Recovered')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('shows a banner when the backend health check fails', async () => {
    mockFetch({ health: () => new Response(null, { status: 503 }) })
    render(<App />)
    await userEvent.click(screen.getByRole('button', { name: /start interview/i }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/unreachable/i)
  })

  it('asks for confirmation before resetting and clears the conversation', async () => {
    mockFetch({})
    render(<App />)
    await userEvent.click(screen.getByRole('button', { name: /start interview/i }))
    await userEvent.type(screen.getByLabelText(/type your question/i), 'Hi{enter}')
    await screen.findByText('Mock answer')
    await userEvent.click(screen.getByRole('button', { name: /^reset$/i }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /reset conversation/i }))
    expect(screen.queryByText('Mock answer')).not.toBeInTheDocument()
    expect(screen.getByText(/Ask me anything/)).toBeInTheDocument()
  })

  it('is keyboard operable: Tab reaches the question box and Enter sends', async () => {
    mockFetch({})
    render(<App />)
    await userEvent.keyboard('{Enter}') // Start interview has autofocus
    const box = screen.getByLabelText(/type your question/i)
    box.focus()
    await userEvent.keyboard('Hi there{Enter}')
    expect(await screen.findByText('Mock answer')).toBeInTheDocument()
  })
})
