import { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Get API key from environment variable
const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY;

// Validate API key at module load time
if (!GOOGLE_AI_API_KEY) {
  console.error('ERROR: GOOGLE_AI_API_KEY is not set in environment variables');
  console.error('Please set GOOGLE_AI_API_KEY in your .env.local file or environment variables');
}

// Initialize Gemini client only if API key is available
let genAI: GoogleGenerativeAI | null = null;
if (GOOGLE_AI_API_KEY) {
  try {
    genAI = new GoogleGenerativeAI(GOOGLE_AI_API_KEY);
    console.log('Gemini API client initialized successfully');
  } catch (error) {
    console.error('ERROR: Failed to initialize Gemini API client:', error);
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Check if API key is configured
  if (!GOOGLE_AI_API_KEY) {
    return res.status(500).json({ 
      message: 'Gemini API not configured',
      error: 'GOOGLE_AI_API_KEY environment variable is not set. Please configure it in your environment variables.',
      text: 'Gemini chat integration is not yet configured. Please configure GOOGLE_AI_API_KEY in your environment variables.'
    });
  }

  // Check if client is initialized
  if (!genAI) {
    return res.status(500).json({ 
      message: 'Gemini API client initialization failed',
      error: 'Failed to initialize Gemini API client. Please check your API key configuration.',
      text: 'Gemini API client could not be initialized. Please check your configuration.'
    });
  }

  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ message: 'Invalid or empty messages array' });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Convert messages to Gemini chat history format (all except the last message)
    const history = messages.slice(0, -1).map((msg: any) => ({
      role: msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.text }],
    }));

    const chat = model.startChat({ history });

    // Send the last message (which should be the user's latest message)
    const lastMessage = messages[messages.length - 1];
    const result = await chat.sendMessage(lastMessage.text);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ text });
  } catch (error: any) {
    console.error('Error in Gemini API:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Internal server error';
    let statusCode = 500;
    
    if (error.message?.includes('API key')) {
      errorMessage = 'Invalid or missing Gemini API key. Please check your GOOGLE_AI_API_KEY configuration.';
      statusCode = 500;
    } else if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
      errorMessage = 'Gemini API rate limit exceeded. Please try again later.';
      statusCode = 429;
    } else if (error.message?.includes('model')) {
      errorMessage = 'Gemini model not available. Please check your model configuration.';
      statusCode = 400;
    } else {
      errorMessage = error.message || 'An unexpected error occurred while processing your request.';
    }
    
    res.status(statusCode).json({ 
      message: errorMessage,
      error: error.message || 'Unknown error',
      text: `Sorry, I encountered an error: ${errorMessage}`
    });
  }
}