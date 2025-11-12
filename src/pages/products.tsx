import Head from 'next/head';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';

import AppShell from '../components/AppShell';

const STORE_DOMAIN = 'isharehow.myshopify.com';

// Get backend URL - supports environment variable or defaults
const getBackendUrl = (): string => {
  // Check for explicit environment variable (available at build time for static export)
  const envUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (envUrl) {
    return envUrl.replace(/\/$/, '');
  }
  
  // For client-side, check window location
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // In development, default to localhost:3001
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:3001';
    }
    
    // In production, try different backend URL patterns
    // Option 1: Backend proxied on same origin (most common for static sites)
    // Option 2: Backend on subdomain (e.g., api.ventures.isharehow.app)
    // Option 3: Backend on same domain, different port (if accessible)
    
    // Try same origin first (if backend is proxied via web server like nginx/apache)
    // This is the most common setup for static sites
    if (hostname.includes('ventures.isharehow.app')) {
      // First try same origin (backend might be proxied)
      // If that doesn't work, the error will be clear
      return window.location.origin;
    }
    
    // Fallback: try API subdomain for other domains
    return `https://api.${hostname}`;
  }
  
  // Fallback for SSR/build time
  return '';
};

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
          <article key={product.id} className="product-card">
            {featuredImage?.originalSrc ? (
              // eslint-disable-next-line @next/next/no-img-element -- Decorative image
              <img src={featuredImage.originalSrc} alt={featuredImage.altText ?? product.title} />
            ) : null}
            <div className="product-info">
              <h3>{product.title}</h3>
              {formattedPrice ? <p className="product-price">{formattedPrice}</p> : null}
              {product.description ? (
                <p className="product-description">{product.description}</p>
              ) : null}
              <Link
                href={`https://${STORE_DOMAIN}/products/${product.handle}`}
                target="_blank"
                rel="noreferrer"
                className="product-link"
              >
                View on Shopify
              </Link>
            </div>
          </article>
        );
      }),
    [products]
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
        <main className="products-page">
          <header>
            <h1>Shop Products</h1>
            <p>Browse curated products from the IShareHow Ventures storefront.</p>
          </header>

          {error ? (
            <div role="alert" className="alert error">
              <p>{error}</p>
              <button type="button" onClick={() => fetchProducts()}>
                Retry
              </button>
            </div>
          ) : null}

          <section className="grid">{productCards}</section>

          <footer className="actions">
            {loading ? <p>Loading...</p> : null}
            {!loading && pageInfo.hasNextPage ? (
              <button type="button" onClick={handleLoadMore} className="load-more">
                Load More
              </button>
            ) : null}
            {!loading && !pageInfo.hasNextPage && products.length > 0 ? (
              <p>All products loaded.</p>
            ) : null}
          </footer>
        </main>
      </AppShell>
    </>
  );
};

export default ProductsPage;