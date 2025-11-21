import Head from 'next/head';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Stack,
  useTheme,
} from '@mui/material';

import AppShell from '../components/AppShell';
import WellnessQuiz from '../components/products/WellnessQuiz';
import { getBackendUrl } from '../utils/backendUrl';

const STORE_DOMAIN = 'isharehow.myshopify.com';

type ShopifyImage = {
  originalSrc: string;
  altText: string | null;
};

type ShopifyProduct = {
  id: string;
  title: string;
  handle: string;
  description?: string;
  descriptionHtml?: string;
  images?: ShopifyImage[];
  priceRange?: {
    minVariantPrice?: {
      amount: string;
      currencyCode: string;
    };
  };
};

type ShopifyPageInfo = {
  hasNextPage: boolean;
  endCursor: string | null;
};

// Backend response format
type BackendProduct = {
  id: string;
  title: string;
  handle: string;
  img: string;
  price: string;
};

type BackendProductsResponse = {
  products: BackendProduct[];
  pageInfo: ShopifyPageInfo;
};

type ProductsResponse = {
  products: ShopifyProduct[];
  pageInfo: ShopifyPageInfo;
};

const currencyFormatter = (currencyCode: string) =>
  new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
  });

// Transform backend product format to frontend format
const transformBackendProduct = (backendProduct: BackendProduct): ShopifyProduct => {
  // Parse price string (e.g., "$10.00" or "N/A")
  let priceAmount: string | undefined;
  let currencyCode = 'USD';
  
  if (backendProduct.price && backendProduct.price !== 'N/A') {
    // Remove $ and parse
    const priceMatch = backendProduct.price.match(/\$?([\d.]+)/);
    if (priceMatch) {
      priceAmount = priceMatch[1];
    }
  }

  return {
    id: backendProduct.id,
    title: backendProduct.title,
    handle: backendProduct.handle,
    images: backendProduct.img ? [{ originalSrc: backendProduct.img, altText: backendProduct.title }] : undefined,
    priceRange: priceAmount ? {
      minVariantPrice: {
        amount: priceAmount,
        currencyCode,
      },
    } : undefined,
  };
};

const ProductsPage = () => {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [pageInfo, setPageInfo] = useState<ShopifyPageInfo>({
    hasNextPage: false,
    endCursor: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(
    async (after: string | null = null) => {
      const backendUrl = getBackendUrl();
      if (!backendUrl) {
        setError('Backend URL is not configured. Please set NEXT_PUBLIC_BACKEND_URL environment variable or ensure backend server is running.');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({ first: '12' });
        if (after) {
          params.append('after', after);
        }

        const response = await fetch(`${backendUrl}/api/products?${params.toString()}`);
        if (!response.ok) {
          throw new Error('Failed to fetch products.');
        }

        const backendData: BackendProductsResponse = await response.json();
        
        // Transform backend products to frontend format
        const transformedProducts = backendData.products.map(transformBackendProduct);

        setProducts((prev) => {
          const existingIds = new Set(prev.map((product) => product.id));
          const deduped = transformedProducts.filter((product) => !existingIds.has(product.id));
          return after ? [...prev, ...deduped] : deduped;
        });
        setPageInfo(backendData.pageInfo);
      } catch (err) {
        let message = 'Failed to fetch products.';
        if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
          message = `Cannot connect to backend server at ${backendUrl}. Please ensure the backend server is running and accessible.`;
        } else if (err instanceof Error) {
          message = err.message;
        }
        setError(message);
        console.error('Products fetch error:', err);
        console.error('Backend URL attempted:', backendUrl);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    void fetchProducts();
  }, [fetchProducts]);

  const handleLoadMore = () => {
    if (pageInfo.hasNextPage && !loading) {
      void fetchProducts(pageInfo.endCursor);
    }
  };

  const theme = useTheme();

  const productCards = useMemo(
    () =>
      products.map((product) => {
        const featuredImage = product.images?.[0];
        const minPrice = product.priceRange?.minVariantPrice;
        const formattedPrice =
          minPrice && minPrice.amount
            ? currencyFormatter(minPrice.currencyCode ?? 'USD').format(Number(minPrice.amount))
            : null;

        return (
          <Card
            key={product.id}
            sx={{
              minWidth: 280,
              maxWidth: 280,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 3,
              border: 1,
              borderColor: 'divider',
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: theme.shadows[8],
              },
            }}
          >
            {featuredImage?.originalSrc && (
              <CardMedia
                component="img"
                height="200"
                image={featuredImage.originalSrc}
                alt={featuredImage.altText ?? product.title}
                sx={{ objectFit: 'cover' }}
              />
            )}
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
              <Typography variant="h6" component="h3" sx={{ fontWeight: 700, mb: 1 }}>
                {product.title}
              </Typography>
              {formattedPrice && (
                <Typography variant="h6" color="primary" sx={{ fontWeight: 700, mb: 1 }}>
                  {formattedPrice}
                </Typography>
              )}
              {product.description && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2, flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}
                >
                  {product.description}
                </Typography>
              )}
              <Button
                component={Link}
                href={`https://${STORE_DOMAIN}/products/${product.handle}`}
                target="_blank"
                rel="noreferrer"
                variant="outlined"
                color="primary"
                size="small"
                sx={{ mt: 'auto', textTransform: 'none', fontWeight: 600 }}
              >
                View on Shopify
              </Button>
            </CardContent>
          </Card>
        );
      }),
    [products, theme]
  );

  return (
    <>
      <Head>
        <title>Products | IShareHow Ventures</title>
        <meta
          name="description"
          content="Browse the latest products available through the IShareHow Ventures store."
        />
      </Head>

      <AppShell active="products">
        <Box sx={{ width: '100%' }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 800, mb: 2 }}>
              Shop Products
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Browse curated products from the IShareHow Ventures storefront.
            </Typography>
          </Box>


          {/* Wellness Quiz Section */}
          <Box sx={{ mb: 6 }}>
            <WellnessQuiz onResult={(system) => console.log('Recommended system:', system)} />
          </Box>

          {error ? (
            <Box
              role="alert"
              sx={{
                p: 3,
                mb: 3,
                bgcolor: 'error.light',
                color: 'error.contrastText',
                borderRadius: 2,
              }}
            >
              <Typography sx={{ mb: 2 }}>{error}</Typography>
              <Button variant="contained" color="error" onClick={() => fetchProducts()}>
                Retry
              </Button>
            </Box>
          ) : null}

          <Box
            sx={{
              width: '100%',
              overflowX: 'auto',
              overflowY: 'hidden',
              pb: 2,
              '&::-webkit-scrollbar': {
                height: 8,
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: 'divider',
                borderRadius: 4,
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'primary.main',
                borderRadius: 4,
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
              },
            }}
          >
            <Stack
              direction="row"
              spacing={3}
              sx={{
                width: 'max-content',
                minWidth: { xs: 'calc(100vw - 64px)', sm: 'calc(280px * 4 + 24px * 3)' },
                px: { xs: 2, sm: 0 },
              }}
            >
              {productCards}
            </Stack>
          </Box>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            {loading && <Typography>Loading...</Typography>}
            {!loading && pageInfo.hasNextPage && (
              <Button
                variant="contained"
                color="primary"
                onClick={handleLoadMore}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                Load More
              </Button>
            )}
            {!loading && !pageInfo.hasNextPage && products.length > 0 && (
              <Typography color="text.secondary">All products loaded.</Typography>
            )}
          </Box>
        </Box>
      </AppShell>
    </>
  );
};

export default ProductsPage;