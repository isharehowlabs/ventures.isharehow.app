import React from 'react';
import { GetStaticProps, GetStaticPaths } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  Divider,
  Chip,
  useTheme,
  Avatar,
  AvatarGroup,
  Paper,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import AppShell from '../../components/AppShell';
import { getAllBlogPosts, getBlogPostBySlug, AUTHORS } from '../../lib/blog';

export const getStaticPaths: GetStaticPaths = async () => {
  const { allBlogPosts } = await getAllBlogPosts();
  const paths = allBlogPosts.map((post) => ({
    params: { slug: post.slug },
  }));

  return {
    paths,
    fallback: 'blocking', // Use blocking fallback for better ISR support
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug as string;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      post,
    },
  };
};

interface BlogPostPageProps {
  post: {
    slug: string;
    title: string;
    description: string;
    date: string;
    image?: string;
    tags: string[];
    authors?: string[];
    content?: string;
  };
}

export default function BlogPostPage({ post: staticPost }: BlogPostPageProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [post, setPost] = React.useState(staticPost);

  // Check localStorage for cached post on mount
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const cachedPosts = localStorage.getItem('blogPosts');
      
      if (cachedPosts) {
        try {
          const posts = JSON.parse(cachedPosts);
          const cachedPost = posts.find((p: any) => p.slug === staticPost.slug);
          if (cachedPost) {
            setPost(cachedPost);
          }
        } catch (error) {
          console.error('Error parsing cached blog posts:', error);
        }
      }
    }
  }, [staticPost.slug]);

  // Listen for storage events to update when blog is refreshed
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleStorageChange = () => {
        const cachedPosts = localStorage.getItem('blogPosts');
        
        if (cachedPosts) {
          try {
            const posts = JSON.parse(cachedPosts);
            const cachedPost = posts.find((p: any) => p.slug === staticPost.slug);
            if (cachedPost) {
              setPost(cachedPost);
            }
          } catch (error) {
            console.error('Error parsing cached blog posts:', error);
          }
        }
      };

      window.addEventListener('storage', handleStorageChange);
      window.addEventListener('blogPostsRefreshed', handleStorageChange);

      return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('blogPostsRefreshed', handleStorageChange);
      };
    }
  }, [staticPost.slug]);

  return (
    <>
      <Head>
        <title>{post.title} - iShareHow Labs Blog</title>
        <meta name="description" content={post.description} />
        {post.image && <meta property="og:image" content={post.image} />}
      </Head>

      <AppShell active="blog">
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
          {/* Header */}
          <Box
            sx={{
              py: { xs: 4, md: 6 },
              background: isDark
                ? 'linear-gradient(135deg, rgba(75, 93, 189, 0.15) 0%, rgba(107, 125, 215, 0.1) 100%)'
                : 'linear-gradient(135deg, rgba(75, 93, 189, 0.08) 0%, rgba(107, 125, 215, 0.05) 100%)',
            }}
          >
            <Container maxWidth="md">
              <Button
                component={Link}
                href="/blog"
                startIcon={<ArrowBackIcon />}
                sx={{
                  mb: 4,
                  color: 'text.secondary',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                Back to Blog
              </Button>

              <Stack spacing={3}>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {post.tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      variant="outlined"
                      color="primary"
                    />
                  ))}
                </Box>

                <Typography
                  variant="h2"
                  component="h1"
                  fontWeight={800}
                  sx={{
                    fontSize: { xs: '2rem', md: '3rem' },
                    lineHeight: 1.2,
                  }}
                >
                  {post.title}
                </Typography>

                <Typography
                  variant="h6"
                  sx={{
                    color: 'text.secondary',
                    lineHeight: 1.7,
                  }}
                >
                  {post.description}
                </Typography>

                <Stack direction="row" spacing={3} alignItems="center" sx={{ flexWrap: 'wrap' }}>
                  {post.authors && post.authors.length > 0 && (
                    <Stack direction="row" spacing={2} alignItems="center">
                      <PersonIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                      <AvatarGroup
                        sx={{
                          '& .MuiAvatar-circular': {
                            width: 32,
                            height: 32,
                            border: `1px solid ${theme.palette.divider}`,
                          },
                        }}
                      >
                        {post.authors.map((author) => {
                          const authorInfo = AUTHORS[author];
                          if (!authorInfo) return null;
                          return (
                            <Avatar
                              key={author}
                              alt={authorInfo.name}
                              src={authorInfo.avatar}
                            />
                          );
                        })}
                      </AvatarGroup>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {post.authors
                          .map((userId) => AUTHORS[userId]?.name || userId)
                          .join(', ')}
                      </Typography>
                    </Stack>
                  )}
                  {post.date && (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CalendarIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {new Date(post.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </Typography>
                    </Stack>
                  )}
                </Stack>
              </Stack>
            </Container>
          </Box>

          <Divider />

          {/* Featured Image */}
          {post.image && (
            <Container maxWidth="md" sx={{ py: 4 }}>
              <Box
                component="img"
                src={post.image}
                alt={post.title}
                sx={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: 2,
                  boxShadow: isDark
                    ? '0 8px 24px rgba(0, 0, 0, 0.4)'
                    : '0 8px 24px rgba(170, 180, 190, 0.3)',
                }}
              />
            </Container>
          )}

          {/* Content */}
          <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
            <Paper
              variant="outlined"
              sx={{
                p: { xs: 3, md: 6 },
                bgcolor: 'background.paper',
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              {post.content ? (
                <Box
                  sx={{
                    '& p': {
                      mb: 3,
                      lineHeight: 1.8,
                      color: 'text.primary',
                    },
                    '& h2': {
                      mt: 4,
                      mb: 2,
                      fontWeight: 700,
                      fontSize: '1.75rem',
                    },
                    '& h3': {
                      mt: 3,
                      mb: 2,
                      fontWeight: 600,
                      fontSize: '1.5rem',
                    },
                    '& ul, & ol': {
                      mb: 3,
                      pl: 4,
                      '& li': {
                        mb: 1,
                        lineHeight: 1.8,
                      },
                    },
                  }}
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
              ) : (
                <Typography
                  variant="body1"
                  sx={{
                    color: 'text.primary',
                    lineHeight: 1.8,
                    mb: 2,
                  }}
                >
                  {post.description}
                </Typography>
              )}

              <Divider sx={{ my: 4 }} />

              {/* Call to Action */}
              <Box
                sx={{
                  textAlign: 'center',
                  p: 4,
                  bgcolor: isDark
                    ? 'rgba(75, 93, 189, 0.1)'
                    : 'rgba(75, 93, 189, 0.05)',
                  borderRadius: 2,
                }}
              >
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Ready to Transform Your Business?
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                  Join 100+ organizations achieving 30% efficiency gains with our integrated ecosystem.
                </Typography>
                <Button
                  component={Link}
                  href="/demo"
                  variant="contained"
                  size="large"
                  sx={{
                    bgcolor: 'primary.main',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                  }}
                >
                  Get Started Today
                </Button>
              </Box>
            </Paper>
          </Container>

          {/* Back to Blog */}
          <Container maxWidth="md" sx={{ pb: 6 }}>
            <Button
              component={Link}
              href="/blog"
              startIcon={<ArrowBackIcon />}
              variant="outlined"
              fullWidth
              sx={{
                borderColor: 'primary.main',
                color: 'primary.main',
                '&:hover': {
                  borderColor: 'primary.dark',
                  bgcolor: 'primary.main',
                  color: 'white',
                },
              }}
            >
              Back to All Posts
            </Button>
          </Container>
        </Box>
      </AppShell>
    </>
  );
}

