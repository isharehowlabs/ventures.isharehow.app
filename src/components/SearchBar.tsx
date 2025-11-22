import { useState, useEffect, useRef } from 'react';
import {
  IconButton,
  InputBase,
  Paper,
  Popper,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Typography,
  Box,
  Fade,
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  Article as ArticleIcon,
  ShoppingBag as ProductIcon,
  TrendingUp as RiseIcon,
  Science as LabsIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/router';

interface SearchResult {
  title: string;
  type: 'page' | 'product' | 'content';
  href: string;
  icon: React.ReactNode;
}

const searchableItems: SearchResult[] = [
  { title: 'Home', type: 'page', href: '/', icon: <ArticleIcon /> },
  { title: 'About', type: 'page', href: '/about', icon: <ArticleIcon /> },
  { title: 'Portfolio', type: 'content', href: '/content', icon: <ArticleIcon /> },
  { title: 'Products', type: 'product', href: '/products', icon: <ProductIcon /> },
  { title: 'Co-Work Dashboard', type: 'page', href: '/labs', icon: <LabsIcon /> },
  { title: 'RISE Dashboard', type: 'page', href: '/rise', icon: <RiseIcon /> },
  { title: 'Profile', type: 'page', href: '/profile', icon: <ArticleIcon /> },
  { title: 'Settings', type: 'page', href: '/settings', icon: <ArticleIcon /> },
];

export default function SearchBar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const anchorRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (query.trim()) {
      const filtered = searchableItems.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered.slice(0, 5));
    } else {
      setResults([]);
    }
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelect = (href: string) => {
    router.push(href);
    setOpen(false);
    setQuery('');
  };

  return (
    <Box ref={anchorRef} sx={{ display: { xs: 'none', sm: 'block' } }}>
      <IconButton
        color="inherit"
        onClick={() => setOpen(true)}
        aria-label="search"
      >
        <SearchIcon />
      </IconButton>

      <Popper
        open={open}
        anchorEl={anchorRef.current}
        placement="bottom-start"
        transition
        sx={{ zIndex: 1300, width: 400, maxWidth: '90vw' }}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={200}>
            <Paper
              elevation={8}
              sx={{
                mt: 1,
                overflow: 'hidden',
              }}
            >
              <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <SearchIcon color="action" />
                <InputBase
                  autoFocus
                  fullWidth
                  placeholder="Search pages, products... (Cmd+K)"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  sx={{ flex: 1 }}
                />
                <IconButton size="small" onClick={() => setOpen(false)}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>

              {results.length > 0 && (
                <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                  {results.map((result, index) => (
                    <ListItemButton
                      key={index}
                      onClick={() => handleSelect(result.href)}
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        {result.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={result.title}
                        secondary={result.type}
                      />
                    </ListItemButton>
                  ))}
                </List>
              )}

              {query && results.length === 0 && (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography color="text.secondary">
                    No results found
                  </Typography>
                </Box>
              )}
            </Paper>
          </Fade>
        )}
      </Popper>
    </Box>
  );
}
