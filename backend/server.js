import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import cookieParser from 'cookie-parser';
import crypto from 'crypto';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { GraphQLClient } from 'graphql-request';
import { GoogleGenerativeAI } from '@google/generative-ai';
import authRoutes from './routes/auth.js';
import docsRoutes from './routes/docs.js';
import figmaRoutes from './routes/figma.js';
import resourcesRoutes from './routes/resources.js';
import mcpRoutes from './routes/mcp.js';
dotenv.config();

const app = express();
const httpServer = createServer(app);

// Determine allowed origins for CORS
const getAllowedOrigins = () => {
  if (process.env.FRONTEND_URL) {
    return process.env.FRONTEND_URL.split(',').map(url => url.trim());
  }
  // Default origins for development and production
  return [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://ventures.isharehow.app',
    'https://isharehowdash.firebaseapp.com',
  ];
};

const allowedOrigins = getAllowedOrigins();

// Log configuration
console.log('SHOPIFY_STORE_URL:', process.env.SHOPIFY_STORE_URL);
console.log('SHOPIFY_ACCESS_TOKEN:', process.env.SHOPIFY_ACCESS_TOKEN ? '***' + process.env.SHOPIFY_ACCESS_TOKEN.slice(-4) : 'undefined');
console.log('GOOGLE_AI_API_KEY:', process.env.GOOGLE_AI_API_KEY ? '***' + process.env.GOOGLE_AI_API_KEY.slice(-4) : 'undefined');
console.log('GOOGLE_REDIRECT_URI:', process.env.GOOGLE_REDIRECT_URI || 'undefined');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? '***' + process.env.GOOGLE_CLIENT_ID.slice(-4) : 'undefined');
console.log('Allowed CORS origins:', allowedOrigins);

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

// Cookie parser - must be before session middleware
app.use(cookieParser());

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
    resave: true, // Save session even if not modified
    saveUninitialized: true, // Allow saving uninitialized sessions for OAuth state
    rolling: true, // Reset expiration on every request
    cookie: {
      secure: process.env.NODE_ENV === 'production', // Must be true for sameSite: 'none'
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days (increased from 24 hours)
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      domain: process.env.NODE_ENV === 'production' ? '.isharehow.app' : undefined, // Allow subdomain sharing
      path: '/', // Ensure cookie is available for all paths
    },
    name: 'ventures.sid', // Custom session name to avoid conflicts
    // Add session validation
    genid: () => {
      return crypto.randomBytes(16).toString('hex');
    },
  })
);

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// CORS and JSON parsing
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked request from origin: ${origin}. Allowed origins:`, allowedOrigins);
        callback(new Error(`Not allowed by CORS. Origin: ${origin}`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With'],
    exposedHeaders: ['Set-Cookie'],
  })
);
app.use(express.json());

// Debug middleware for session/cookie issues (development only)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/auth')) {
      console.log('Request details:', {
        path: req.path,
        method: req.method,
        hasCookie: !!req.headers.cookie,
        cookieHeader: req.headers.cookie,
        sessionID: req.sessionID,
        hasSession: !!req.session,
      });
    }
    next();
  });
}

// Authentication routes
app.use('/api/auth', authRoutes);

// API routes
app.use('/api/docs', docsRoutes);
app.use('/api/figma', figmaRoutes);
app.use('/api/resources', resourcesRoutes);
app.use('/api/mcp', mcpRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    hasGoogleAIKey: !!process.env.GOOGLE_AI_API_KEY,
    hasShopifyConfig: !!(process.env.SHOPIFY_STORE_URL && process.env.SHOPIFY_ACCESS_TOKEN)
  });
});

const client = new GraphQLClient(process.env.SHOPIFY_STORE_URL, {
  headers: {
    'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN,
    'X-Shopify-API-Version': '2024-10'
  },
});

// GraphQL query for products with pagination
const PRODUCTS_QUERY = `
  query getProducts($first: Int!, $after: String) {
    products(first: $first, after: $after, sortKey: UPDATED_AT, reverse: true) {
      edges {
        node {
          id
          title
          handle
          media(first: 10) {
            edges {
              node {
                ... on MediaImage {
                  image {
                    url
                  }
                }
              }
            }
          }
          variants(first: 1) {
            edges {
              node {
                price
              }
            }
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

// GraphQL query for orders (last 30 days)
const QUERY = `
  query getOrders($query: String!) {
    orders(first: 100, query: $query) {
      edges {
        node {
          id
          lineItems(first: 250) {
            edges {
              node {
                quantity
                product {
                  id
                  title
                  handle
                  featuredImage { url }
                  variants(first: 1) { edges { node { price } } }
                }
              }
            }
          }
        }
      }
    }
  }
`;

// Updated endpoint to support pagination for "Show More" button
app.get('/api/products', async (req, res) => {
  try {
    // Check if Shopify credentials are configured
    if (!process.env.SHOPIFY_STORE_URL || !process.env.SHOPIFY_ACCESS_TOKEN) {
      console.error('Shopify credentials not configured');
      return res.status(500).json({ 
        error: 'Shopify credentials not configured',
        message: 'SHOPIFY_STORE_URL and SHOPIFY_ACCESS_TOKEN must be set'
      });
    }

    const first = parseInt(req.query.first, 10) || 8;
    const after = req.query.after || null;
    console.log(`Fetching products... first: ${first}, after: ${after}`);
    
    const variables = { first, after };
    console.log('Making GraphQL request to Shopify...');
    
    const data = await client.request(PRODUCTS_QUERY, variables);
    console.log('Received data from Shopify, processing products...');
    
    if (!data || !data.products || !data.products.edges) {
      console.error('Invalid data structure from Shopify:', data);
      return res.status(500).json({ error: 'Invalid response from Shopify API' });
    }
    
    const products = data.products.edges.map(edge => {
      const mediaImages = edge.node.media.edges.filter(edge => edge.node.image);
      return {
        id: edge.node.id,
        title: edge.node.title,
        handle: edge.node.handle,
        img: mediaImages[0]?.node.image.url || 'https://dummyimage.com/300x300/cccccc/000000&text=No+Image',
        price: edge.node.variants.edges[0]?.node.price ? `$${edge.node.variants.edges[0].node.price}` : 'N/A'
      };
    });
    
    console.log(`Successfully processed ${products.length} products`);
    res.json({
      products,
      pageInfo: data.products.pageInfo
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data || error.response
    });
    res.status(500).json({ 
      error: 'Failed to fetch products',
      message: error.message || 'Unknown error occurred',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

app.get('/api/best-sellers', async (req, res) => {
  try {
    const days = req.query.days || 30;
    const dateQuery = `created_at:>=${new Date(Date.now() - days * 86400000).toISOString().split('T')[0]}`;

    const data = await client.request(QUERY, { query: dateQuery });
    const orders = data.orders.edges;

    // Aggregate: Map product ID to {title, image, price, totalSold}
    const productMap = new Map();
    orders.forEach(order => {
      order.node.lineItems.edges.forEach(item => {
        const prod = item.node.product;
        if (!prod) return;
        const key = prod.id;
        if (!productMap.has(key)) {
          productMap.set(key, {
            id: key,
            title: prod.title,
            image: prod.featuredImage?.url || 'https://via.placeholder.com/300?text=Plant',
            price: prod.variants.edges[0]?.node.price || '0.00',
            totalSold: 0
          });
        }
        productMap.get(key).totalSold += item.node.quantity;
      });
    });

    // Sort top 10 by totalSold descending
    const bestSellers = Array.from(productMap.values())
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 10);

    res.json({ bestSellers, totalOrders: orders.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch best sellers' });
  }
});

// Gemini chat endpoint
app.post('/api/gemini-chat', async (req, res) => {
  console.log('Received POST /api/gemini-chat request');
  console.log('Request body:', JSON.stringify(req.body, null, 2));

  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      console.error('Invalid messages:', messages);
      return res.status(400).json({ message: 'Invalid or empty messages array' });
    }

    if (!process.env.GOOGLE_AI_API_KEY) {
      console.error('GOOGLE_AI_API_KEY is not configured');
      return res.status(500).json({ message: 'Google AI API key not configured' });
    }

    console.log(`Processing ${messages.length} messages`);
    
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
    
    // Convert messages to Gemini chat history format (all except the last message)
    const history = messages.slice(0, -1).map((msg) => {
      if (!msg.text || typeof msg.text !== 'string') {
        throw new Error(`Invalid message format: ${JSON.stringify(msg)}`);
      }
      return {
        role: msg.role === 'model' ? 'model' : 'user',
        parts: [{ text: msg.text }],
      };
    });

    console.log(`Chat history length: ${history.length}`);

    // Send the last message (which should be the user's latest message)
    const lastMessage = messages[messages.length - 1];
    
    if (!lastMessage || !lastMessage.text || typeof lastMessage.text !== 'string') {
      throw new Error(`Invalid last message format: ${JSON.stringify(lastMessage)}`);
    }

    // Try different model names - gemini-pro is the most stable
    const modelNames = ['gemini-2.0-pro', 'gemini-2.0-flash'];
    let text = null;
    let lastError = null;

    for (const modelName of modelNames) {
      try {
        console.log(`Attempting to use model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const chat = model.startChat({ history });
        
        console.log('Sending message to Gemini:', lastMessage.text.substring(0, 50) + '...');
        const result = await chat.sendMessage(lastMessage.text);
        const response = await result.response;
        text = response.text();
        
        console.log(`Successfully used model: ${modelName}`);
        break; // Success, exit loop
      } catch (err) {
        console.warn(`Model ${modelName} failed:`, err.message);
        lastError = err;
        
        // If it's a model not found error (404), try next model
        if (err.message && (err.message.includes('404') || err.message.includes('not found'))) {
          continue; // Try next model
        } else {
          // For other errors, don't retry
          throw err;
        }
      }
    }

    if (!text) {
      throw new Error(`All model attempts failed. Last error: ${lastError?.message || 'Unknown error'}. Please check your Google AI API key and available models.`);
    }

    console.log('Received response from Gemini, length:', text.length);
    res.status(200).json({ text });
  } catch (error) {
    console.error('Error in Gemini API:', error);
    console.error('Error stack:', error.stack);
    const errorMessage = error?.message || 'Unknown error occurred';
    const errorDetails = error?.toString() || 'No error details available';
    res.status(500).json({ 
      message: 'Internal server error', 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? errorDetails : undefined
    });
  }
});

// Twitch goals endpoint (followers and viewers)
app.get('/api/twitch/goals', async (req, res) => {
  try {
    const twitchClientId = process.env.TWITCH_CLIENT_ID;
    const twitchAccessToken = process.env.TWITCH_ACCESS_TOKEN;
    const twitchUsername = process.env.TWITCH_USERNAME || 'jameleliyah';
    const followerGoal = parseInt(process.env.TWITCH_FOLLOWER_GOAL || '2500', 10);
    const viewerGoal = parseInt(process.env.TWITCH_VIEWER_GOAL || '5000', 10);

    if (!twitchClientId || !twitchAccessToken) {
      // Return default values if Twitch credentials not configured
      return res.json({
        followers: 1247,
        followerGoal: followerGoal,
        viewers: 1200,
        viewerGoal: viewerGoal,
        message: 'Twitch credentials not configured, using default values'
      });
    }

    // First, get the user ID from username
    const userResponse = await fetch(`https://api.twitch.tv/helix/users?login=${twitchUsername}`, {
      headers: {
        'Client-ID': twitchClientId,
        'Authorization': `Bearer ${twitchAccessToken}`,
      },
    });

    if (!userResponse.ok) {
      throw new Error(`Twitch API error: ${userResponse.status}`);
    }

    const userData = await userResponse.json();
    
    if (!userData.data || userData.data.length === 0) {
      throw new Error('Twitch user not found');
    }

    const userId = userData.data[0].id;

    // Get follower count
    const followersResponse = await fetch(`https://api.twitch.tv/helix/users/follows?to_id=${userId}&first=1`, {
      headers: {
        'Client-ID': twitchClientId,
        'Authorization': `Bearer ${twitchAccessToken}`,
      },
    });

    let followers = 1247; // Default fallback
    if (followersResponse.ok) {
      const followersData = await followersResponse.json();
      followers = followersData.total || 1247;
    }

    // Get stream info for current viewer count
    const streamResponse = await fetch(`https://api.twitch.tv/helix/streams?user_id=${userId}`, {
      headers: {
        'Client-ID': twitchClientId,
        'Authorization': `Bearer ${twitchAccessToken}`,
      },
    });

    let viewers = 1200; // Default fallback
    if (streamResponse.ok) {
      const streamData = await streamResponse.json();
      if (streamData.data && streamData.data.length > 0) {
        viewers = streamData.data[0].viewer_count || 1200;
      }
    }

    res.json({
      followers,
      followerGoal: followerGoal,
      viewers,
      viewerGoal: viewerGoal,
    });
  } catch (error) {
    console.error('Error fetching Twitch goals:', error);
    // Return default values on error
    res.json({
      followers: 1247,
      followerGoal: parseInt(process.env.TWITCH_FOLLOWER_GOAL || '2500', 10),
      viewers: 1200,
      viewerGoal: parseInt(process.env.TWITCH_VIEWER_GOAL || '5000', 10),
      error: error.message,
    });
  }
});

// Legacy endpoint for backwards compatibility
app.get('/api/twitch/followers', async (req, res) => {
  try {
    const twitchClientId = process.env.TWITCH_CLIENT_ID;
    const twitchAccessToken = process.env.TWITCH_ACCESS_TOKEN;
    const twitchUsername = process.env.TWITCH_USERNAME || 'jameleliyah';
    const followerGoal = parseInt(process.env.TWITCH_FOLLOWER_GOAL || '2500', 10);

    if (!twitchClientId || !twitchAccessToken) {
      return res.json({
        followers: 1247,
        goal: followerGoal,
      });
    }

    const userResponse = await fetch(`https://api.twitch.tv/helix/users?login=${twitchUsername}`, {
      headers: {
        'Client-ID': twitchClientId,
        'Authorization': `Bearer ${twitchAccessToken}`,
      },
    });

    if (!userResponse.ok) {
      return res.json({ followers: 1247, goal: followerGoal });
    }

    const userData = await userResponse.json();
    if (!userData.data || userData.data.length === 0) {
      return res.json({ followers: 1247, goal: followerGoal });
    }

    const userId = userData.data[0].id;
    const followersResponse = await fetch(`https://api.twitch.tv/helix/users/follows?to_id=${userId}&first=1`, {
      headers: {
        'Client-ID': twitchClientId,
        'Authorization': `Bearer ${twitchAccessToken}`,
      },
    });

    let followers = 1247;
    if (followersResponse.ok) {
      const followersData = await followersResponse.json();
      followers = followersData.total || 1247;
    }

    res.json({ followers, goal: followerGoal });
  } catch (error) {
    res.json({ followers: 1247, goal: 2500 });
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });

  // Join room for design token updates
  socket.on('join:design-tokens', () => {
    socket.join('design-tokens');
  });

  // Join room for document collaboration
  socket.on('join:document', (docId) => {
    socket.join(`document:${docId}`);
    console.log(`Client ${socket.id} joined document:${docId} room`);
  });
});

// Make io available to routes for emitting events
app.set('io', io);

// Error handling middleware (must be last)
app.use((err, req, res, next) => {
  console.error('Error:', err);
  console.error('Stack:', err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
  console.log(`Socket.io server ready`);
});

// Handle uncaught errors
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
