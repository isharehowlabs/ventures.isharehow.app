import React, { useState, useRef } from 'react';
import { InferGetStaticPropsType } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Stack,
  Divider,
  Chip,
  useTheme,
  Paper,
  Pagination,
  Avatar,
  AvatarGroup,
} from '@mui/material';
import {
  ArrowForward as ArrowForwardIcon,
  Article as ArticleIcon,
} from '@mui/icons-material';
import AppShell from '../components/AppShell';
import { getAllBlogPosts, getBlogPostBySlug, AUTHORS, BlogPost } from '../lib/blog';

export const getStaticProps = () => {
  const data = getAllBlogPosts();
  return {
    props: data,
  };
};

const PAGE_SIZE = 7;

function PostPreview(props: BlogPost) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <React.Fragment>
      <Box sx={{ display: 'flex', gap: 0.5, mb: 1.5, flexWrap: 'wrap' }}>
        {props.tags.map((tag) => (
          <Chip
            key={tag}
            label={tag}
            size="small"
            variant="outlined"
            color="primary"
            sx={{
              height: 22,
              fontWeight: 'medium',
              fontSize: theme.typography.pxToRem(13),
              '& .MuiChip-label': {
                px: '6px',
              },
            }}
          />
        ))}
      </Box>
      <Typography component="h2" variant="h6" gutterBottom sx={{ fontWeight: 700, mb: 1 }}>
        <Link
          href={`/blog/${props.slug}`}
          style={{
            color: theme.palette.text.primary,
            textDecoration: 'none',
          }}
        >
          {props.title}
        </Link>
      </Typography>
      <Typography
        variant="body2"
        sx={{
          color: 'text.secondary',
          mb: 'auto',
          lineHeight: 1.7,
        }}
      >
        {props.description}
      </Typography>
      {props.authors && props.authors.length > 0 && (
        <AvatarGroup
          sx={{
            mt: 2,
            mb: 1,
            alignSelf: 'flex-start',
            '& .MuiAvatar-circular': {
              width: 28,
              height: 28,
              fontSize: theme.typography.pxToRem(13),
              fontWeight: theme.typography.fontWeightMedium,
              border: `1px solid ${theme.palette.divider}`,
              outline: '3px solid',
              outlineColor: isDark ? theme.palette.background.default : '#FFF',
              backgroundColor: isDark ? theme.palette.background.paper : theme.palette.grey[100],
            },
          }}
        >
          {props.authors.map((author) => {
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
      )}
      <Box
        sx={{
          display: { sm: 'block', md: 'flex' },
          justifyContent: 'space-between',
          alignItems: 'end',
          mt: 2,
        }}
      >
        <Box sx={{ position: 'relative' }}>
          {props.authors && props.authors.length > 0 && (
            <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 0.5 }}>
              {props.authors
                .slice(0, 3)
                .map((userId) => {
                  const name = AUTHORS[userId]?.name;
                  if (name) {
                    if (props.authors && props.authors.length > 1) {
                      return name.split(' ')[0];
                    }
                    return name;
                  }
                  return userId;
                })
                .join(', ')}
              {props.authors.length > 2 && ', and more.'}
            </Typography>
          )}
          {props.date && (
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {new Date(props.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Typography>
          )}
        </Box>
        <Button
          component={Link}
          href={`/blog/${props.slug}`}
          endIcon={<ArrowForwardIcon />}
          size="small"
          variant="outlined"
          sx={{
            mt: { xs: 1, md: 0 },
            borderColor: 'primary.main',
            color: 'primary.main',
            '&:hover': {
              borderColor: 'primary.dark',
              bgcolor: 'primary.main',
              color: 'white',
            },
          }}
        >
          Read more
        </Button>
      </Box>
    </React.Fragment>
  );
}

export default function Blog(props: InferGetStaticPropsType<typeof getStaticProps>) {
  const router = useRouter();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const postListRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const [selectedTags, setSelectedTags] = useState<Record<string, boolean>>({});

  const { allBlogPosts, tagInfo: rawTagInfo } = props;
  const [firstPost, secondPost, ...otherPosts] = allBlogPosts;

  // Calculate tag info excluding featured posts
  const tagInfo = { ...rawTagInfo };
  [firstPost, secondPost].forEach((post) => {
    post.tags.forEach((tag) => {
      if (tagInfo[tag]) {
        tagInfo[tag]! -= 1;
      }
    });
  });

  Object.entries(tagInfo).forEach(([tagName, tagCount]) => {
    if (tagCount === 0) {
      delete tagInfo[tagName];
    }
  });

  const filteredPosts = otherPosts.filter((post) => {
    if (Object.keys(selectedTags).length === 0) {
      return true;
    }
    return post.tags.some((tag) => Object.keys(selectedTags).includes(tag));
  });

  const pageStart = page * PAGE_SIZE;
  const totalPage = Math.ceil(filteredPosts.length / PAGE_SIZE);
  const displayedPosts = filteredPosts.slice(pageStart, pageStart + PAGE_SIZE);

  const getTags = React.useCallback(() => {
    const { tags = '' } = router.query;
    return (typeof tags === 'string' ? tags.split(',') : tags || [])
      .map((str) => str.trim())
      .filter((tag) => !!tag);
  }, [router.query]);

  React.useEffect(() => {
    const arrayTags = getTags();
    const finalTags: Record<string, boolean> = {};
    arrayTags.forEach((tag) => {
      finalTags[tag] = true;
    });
    setSelectedTags(finalTags);
    setPage(0);
  }, [getTags]);

  const removeTag = (tag: string) => {
    router.push(
      {
        query: {
          ...router.query,
          tags: getTags().filter((value) => value !== tag),
        },
      },
      undefined,
      { shallow: true }
    );
  };

  const addTag = (tag: string) => {
    router.push(
      {
        query: {
          ...router.query,
          tags: tag,
        },
      },
      undefined,
      { shallow: true }
    );
  };

  return (
    <>
      <Head>
        <title>Blog - iShareHow Labs</title>
        <meta
          name="description"
          content="Follow the iShareHow blog to learn about new product features, latest advancements in digital transformation, and community initiatives."
        />
      </Head>

      <AppShell active="blog">
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
          {/* Hero Section */}
          <Box
            sx={{
              py: { xs: 6, md: 10 },
              background: isDark
                ? 'linear-gradient(135deg, rgba(75, 93, 189, 0.15) 0%, rgba(107, 125, 215, 0.1) 100%)'
                : 'linear-gradient(135deg, rgba(75, 93, 189, 0.08) 0%, rgba(107, 125, 215, 0.05) 100%)',
            }}
          >
            <Container maxWidth="lg">
              <Stack spacing={2} alignItems="center" textAlign="center">
                <Chip
                  label="Blog"
                  color="primary"
                  sx={{ mb: 2, fontWeight: 700, fontSize: '0.9rem', py: 2.5 }}
                />
                <Typography
                  variant="h2"
                  component="h1"
                  fontWeight={800}
                  sx={{
                    fontSize: { xs: '2rem', md: '3rem' },
                    mb: 2,
                  }}
                >
                  Stay <span style={{ color: theme.palette.primary.main }}>in the loop</span> with
                  <br /> the latest from iShareHow Labs
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: 'text.secondary',
                    maxWidth: '700px',
                    lineHeight: 1.7,
                  }}
                >
                  Discover insights, tutorials, and updates from our team. Learn about our services, community, and the latest in digital transformation.
                </Typography>
              </Stack>
            </Container>
          </Box>

          <Divider />

          {/* Featured Posts */}
          <Container sx={{ mt: { xs: 4, sm: 6 }, mb: 4 }}>
            <Box
              component="ul"
              sx={{
                display: 'grid',
                m: 0,
                p: 0,
                gap: 3,
                gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
                listStyle: 'none',
              }}
            >
              {[firstPost, secondPost].map((post) => (
                <Paper
                  key={post.slug}
                  component="li"
                  variant="outlined"
                  sx={{
                    p: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    bgcolor: 'background.paper',
                    border: `1px solid ${theme.palette.divider}`,
                    boxShadow: isDark
                      ? '0 4px 12px rgba(0, 0, 0, 0.4)'
                      : '0 4px 12px rgba(170, 180, 190, 0.2)',
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: isDark
                        ? '0 8px 24px rgba(0, 0, 0, 0.6)'
                        : '0 8px 24px rgba(170, 180, 190, 0.3)',
                    },
                  }}
                >
                  {post.image && (
                    <Box
                      component="img"
                      src={post.image}
                      alt={post.title}
                      sx={{
                        aspectRatio: '16 / 9',
                        width: '100%',
                        height: 'auto',
                        objectFit: 'cover',
                        borderRadius: 1,
                        mb: 2,
                      }}
                    />
                  )}
                  <PostPreview {...post} />
                </Paper>
              ))}
            </Box>
          </Container>

          {/* Main Content Area */}
          <Container
            ref={postListRef}
            sx={{
              py: { xs: 4, sm: 6, md: 8 },
              display: 'grid',
              gridTemplateColumns: { md: '1fr 320px' },
              columnGap: 4,
            }}
          >
            {/* Posts List */}
            <Box>
              <Typography
                component="h2"
                variant="h5"
                sx={{ fontWeight: 700, mb: { xs: 2, sm: 3 }, mt: { xs: 0, md: 4 } }}
              >
                Posts{' '}
                {Object.keys(selectedTags).length > 0 && (
                  <span>
                    tagged as{' '}
                    <Typography component="span" variant="inherit" color="primary">
                      &quot;{Object.keys(selectedTags)[0]}&quot;
                    </Typography>
                  </span>
                )}
              </Typography>

              <Box component="ul" sx={{ p: 0, m: 0, listStyle: 'none' }}>
                {displayedPosts.map((post) => (
                  <Box
                    component="li"
                    key={post.slug}
                    sx={{
                      py: 3,
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                      '&:not(:last-of-type)': {
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                      },
                    }}
                  >
                    <PostPreview {...post} />
                  </Box>
                ))}
              </Box>

              {totalPage > 1 && (
                <Pagination
                  page={page + 1}
                  count={totalPage}
                  variant="outlined"
                  shape="rounded"
                  color="primary"
                  onChange={(_, value) => {
                    setPage(value - 1);
                    postListRef.current?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center' }}
                />
              )}
            </Box>

            {/* Sidebar */}
            <Box sx={{ gridRow: 'span 2' }}>
              <Box
                sx={{
                  position: 'sticky',
                  top: 100,
                  mt: { xs: 4, md: 8 },
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 3,
                }}
              >
                {/* Tag Filter */}
                <Paper variant="outlined" sx={{ p: 3, bgcolor: 'background.paper' }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                    <ArticleIcon sx={{ color: 'primary.main' }} />
                    <Typography
                      component="h3"
                      variant="h6"
                      sx={{ color: 'text.primary', fontWeight: 700 }}
                    >
                      Filter posts by tag
                    </Typography>
                  </Stack>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {Object.keys(tagInfo).map((tag) => {
                      const selected = !!selectedTags[tag];
                      return (
                        <Chip
                          key={tag}
                          variant={selected ? 'filled' : 'outlined'}
                          color={selected ? 'primary' : 'default'}
                          label={`${tag} (${tagInfo[tag]})`}
                          onClick={() => {
                            if (selected) {
                              removeTag(tag);
                            } else {
                              postListRef.current?.scrollIntoView({ behavior: 'smooth' });
                              addTag(tag);
                            }
                          }}
                          onDelete={selected ? () => removeTag(tag) : undefined}
                          size="small"
                          sx={{
                            '&:hover': {
                              bgcolor: selected ? 'primary.dark' : 'action.hover',
                            },
                          }}
                        />
                      );
                    })}
                  </Box>
                </Paper>

                {/* About Section */}
                <Paper variant="outlined" sx={{ p: 3, bgcolor: 'background.paper' }}>
                  <Typography
                    component="h3"
                    variant="h6"
                    gutterBottom
                    sx={{ color: 'text.primary', fontWeight: 700, mb: 2 }}
                  >
                    About iShareHow Labs
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, lineHeight: 1.7 }}>
                    We deliver integrated Managed Services, Creative-as-a-Service, and Strategic Intelligence to help organizations achieve 30% efficiency gains.
                  </Typography>
                  <Button
                    component={Link}
                    href="/demo"
                    variant="outlined"
                    size="small"
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
                    Learn More
                  </Button>
                </Paper>
              </Box>
            </Box>
          </Container>
        </Box>
      </AppShell>
    </>
  );
}

