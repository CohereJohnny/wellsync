import { CohereClient } from 'cohere-ai'

// Initialize the Cohere client
const apiKey = process.env.COHERE_API_KEY

if (!apiKey) {
  throw new Error('Missing COHERE_API_KEY environment variable')
}

export const cohere = new CohereClient({
  token: apiKey,
}) 