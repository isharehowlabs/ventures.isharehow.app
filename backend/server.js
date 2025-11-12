
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { GraphQLClient } from 'graphql-request';
dotenv.config();

console.log('SHOPIFY_STORE_URL:', process.env.SHOPIFY_STORE_URL);
console.log('SHOPIFY_ACCESS_TOKEN:', process.env.SHOPIFY_ACCESS_TOKEN ? '***' + process.env.SHOPIFY_ACCESS_TOKEN.slice(-4) : 'undefined');

const app = express();
app.use(cors());
app.use(express.json());

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
    const first = parseInt(req.query.first, 10) || 8;
    const after = req.query.after || null;
    console.log(`Fetching products... first: ${first}, after: ${after}`);
    const variables = { first, after };
    const data = await client.request(PRODUCTS_QUERY, variables);
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
    res.json({
      products,
      pageInfo: data.products.pageInfo
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
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

app.listen(process.env.PORT || 3001, () => console.log(`Backend running on port ${process.env.PORT || 3001}`));
