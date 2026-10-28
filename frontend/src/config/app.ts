export const APP_NAME = 'Personal AI Assistant'
export const CANDIDATE_NAME = 'Akshat Bhardwaj'
export const CANDIDATE_HEADLINE = 'AI/ML Engineer · Generative AI · RAG & GraphRAG'
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ?? 'http://localhost:8000'
export const MAX_MESSAGE_CHARS = 1000
export const MAX_HISTORY_SENT = 10

export const SUGGESTED_QUESTIONS = [
  'What should we know about your life story in a few sentences?',
  "What's your number one superpower?",
  'What are the top three areas you\u2019d like to grow in?',
  'What misconception do your coworkers have about you?',
  'How do you push your boundaries and limits?',
  'Tell me about the churn prediction project.',
  'How do you approach designing an AI agent?',
  'Why do you want to join 100x?',
]
