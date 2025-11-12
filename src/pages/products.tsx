import Head from 'next/head';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';

import AppShell from '../components/AppShell';

const STORE_DOMAIN = 'isharehow.myshopify.com';
const API_BASE_URL = (process.env.NEXT_PUBLIC_BACKEND_URL ?? '').replace(/\/$/, '');

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
      if (!API_BASE_URL) {
        setError('Backend URL is not configured.');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({ first: '12' });
        if (after) {
          params.append('after', after);
        }

        const response = await fetch(`${API_BASE_URL}/api/products?${params.toString()}`);
        if (!response.ok) {
          throw new Error('Failed to fetch products.');
        }

        const data: ProductsResponse = await response.json();

        setProducts((prev) => {
          const existingIds = new Set(prev.map((product) => product.id));
          const deduped = data.products.filter((product) => !existingIds.has(product.id));
          return after ? [...prev, ...deduped] : deduped;
        });
        setPageInfo(data.pageInfo);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unexpected error fetching products.';
        setError(message);
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