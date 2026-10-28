import { useState } from 'react'
import { InterviewPage } from './pages/InterviewPage'
import { LandingPage } from './pages/LandingPage'

export default function App() {
  const [started, setStarted] = useState(false)
  return started ? <InterviewPage onExit={() => setStarted(false)} /> : <LandingPage onStart={() => setStarted(true)} />
}
