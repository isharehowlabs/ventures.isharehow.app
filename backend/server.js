
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { GraphQLClient } from 'graphql-request';
import { GoogleGenerativeAI } from '@google/generative-ai';
dotenv.config();

console.log('SHOPIFY_STORE_URL:', process.env.SHOPIFY_STORE_URL);
console.log('SHOPIFY_ACCESS_TOKEN:', process.env.SHOPIFY_ACCESS_TOKEN ? '***' + process.env.SHOPIFY_ACCESS_TOKEN.slice(-4) : 'undefined');
console.log('GOOGLE_AI_API_KEY:', process.env.GOOGLE_AI_API_KEY ? '***' + process.env.GOOGLE_AI_API_KEY.slice(-4) : 'undefined');

const app = express();
app.use(cors());
app.use(express.json());

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

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" }); // Replace with the correct, available model
    const chat = model.startChat({ history });

    // Send the last message (which should be the user's latest message)
    const lastMessage = messages[messages.length - 1];
    
    if (!lastMessage || !lastMessage.text || typeof lastMessage.text !== 'string') {
      throw new Error(`Invalid last message format: ${JSON.stringify(lastMessage)}`);
    }

    console.log('Sending message to Gemini:', lastMessage.text.substring(0, 50) + '...');
    
    const result = await chat.sendMessage(lastMessage.text);
    const response = await result.response;
    const text = response.text();

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

app.listen(process.env.PORT || 3001, () => console.log(`Backend running on port ${process.env.PORT || 3001}`));
