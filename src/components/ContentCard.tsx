'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Avatar,
  alpha,
  useTheme,
  Fade,
  IconButton,
  Snackbar,
  Tooltip,
} from '@mui/material';
import { PlayArrow as PlayIcon, Share as ShareIcon } from '@mui/icons-material';

interface ContentItem {
  id: string;
  title: string;
  description: string;
  channelName: string;
  channelIcon: string;
  timestamp: string;
  category: string[];
  color: string;
  mediaType: 'video' | 'image' | 'iframe';
  mediaUrl: string;
  externalUrl?: string;
  isVenturePartnership?: boolean;
}

interface ContentCardProps {
  content: ContentItem;
}

const ContentCard: React.FC<ContentCardProps> = ({ content }) => {
  const { title, description, channelName, channelIcon, timestamp, category, color, mediaType, mediaUrl, externalUrl, isVenturePartnership } = content;
  const [isHovered, setIsHovered] = useState(false);
  const [shareMessage, setShareMessage] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const theme = useTheme();
  
  // Check if this is a TikTok link
  const isTikTok = externalUrl?.includes('tiktok.com');

  const handleShareClose = () => {
    setShareMessage(null);
  };

  const copyLinkToClipboard = async (shareUrl: string) => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) {
      setShareMessage('Unable to copy link');
      return;
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareMessage('Link copied to clipboard');
    } catch {
      setShareMessage('Unable to copy link');
    }
  };

  const handleShareClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    const fallbackUrl = typeof window !== 'undefined' ? window.location.href : '';
    const shareUrl = externalUrl ?? fallbackUrl;

    if (!shareUrl) {
      setShareMessage('No link available to share');
      return;
    }

    if (typeof navigator !== 'undefined' && navigator.share && externalUrl) {
      try {
        await navigator.share({ title, url: shareUrl });
        setShareMessage('Link shared successfully');
      } catch {
        await copyLinkToClipboard(shareUrl);
      }
    } else {
      await copyLinkToClipboard(shareUrl);
    }
  };

  const handleCardClick = () => {
    if (externalUrl) {
      window.open(externalUrl, '_blank');
    }
  };

  return (
    <>
      <Card
        onClick={handleCardClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        sx={{
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 3,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          border: '1px solid',
          borderColor: 'divider',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: theme.shadows[12],
            borderColor: content.color,
          },
        }}
        >
          {/* Category Badge */}
          <Box
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              zIndex: 3,
              display: 'flex',
              flexDirection: 'column',
              gap: 0.5,
              alignItems: 'flex-end',
            }}
          >
            {content.category.map((cat, index) => (
              <Chip
                key={index}
                label={cat}
                size="small"
                sx={{
                  bgcolor: content.color,
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '0.7rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  boxShadow: theme.shadows[4],
                }}
              />
            ))}
          </Box>

          {/* Media Content */}
          <Box 
            sx={{ 
              position: 'relative', 
              overflow: 'hidden',
              pointerEvents: (mediaType === 'video' || mediaType === 'iframe') ? 'auto' : 'none',
            }}
            onClick={(e) => {
              if (mediaType === 'video' || mediaType === 'iframe') {
                e.stopPropagation();
              }
            }}
          >
            {content.mediaType === 'video' && (
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  height: 240,
                  overflow: 'hidden',
                }}
              >
                <iframe
                  src={content.mediaUrl}
                  title={content.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 0,
                  }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  loading="lazy"
                />
              </Box>
            )}
            
            {content.mediaType === 'image' && (
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  height: 240,
                  overflow: 'hidden',
                  bgcolor: 'grey.200',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {!imageError ? (
                  <Box
                    component="img"
                    src={content.mediaUrl}
                    alt={content.title}
                    onError={() => setImageError(true)}
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                      transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                    }}
                    loading="lazy"
                  />
                ) : (
                  <Box
                    sx={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'grey.200',
                      gap: 1,
                    }}
                  >
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        bgcolor: 'grey.400',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography variant="h4" color="text.secondary">
                        {content.channelIcon || '📷'}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', px: 2 }}>
                      Image unavailable
                    </Typography>
                  </Box>
                )}
                {/* Play button overlay for TikTok links */}
                {isTikTok && !imageError && (
                  <Fade in={isHovered}>
                    <Box
                      sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        bgcolor: 'rgba(0, 0, 0, 0.7)',
                        backdropFilter: 'blur(4px)',
                        transition: 'all 0.3s',
                        '&:hover': {
                          bgcolor: 'rgba(0, 0, 0, 0.9)',
                          transform: 'translate(-50%, -50%) scale(1.1)',
                        },
                      }}
                    >
                      <PlayIcon sx={{ color: 'white', fontSize: 32, ml: 0.5 }} />
                    </Box>
                  </Fade>
                )}
              </Box>
            )}

            {content.mediaType === 'iframe' && (
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  height: 240,
                  overflow: 'hidden',
                }}
              >
                <iframe
                  src={content.mediaUrl}
                  title={content.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 0,
                  }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  loading="lazy"
                />
              </Box>
            )}
          </Box>

          {/* Content */}
          <CardContent sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar
                sx={{
                  bgcolor: content.color,
                  width: 32,
                  height: 32,
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  mr: 1.5,
                }}
              >
                {content.channelIcon}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  {content.channelName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {content.timestamp}
                </Typography>
              </Box>
              <Tooltip title="Share this content" arrow>
                <IconButton 
                  aria-label="Share content" 
                  onClick={handleShareClick} 
                  sx={{ 
                    p: 0.5,
                    zIndex: 3,
                    position: 'relative',
                  }}
                >
                  <ShareIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>

            {/* Title and Description */}
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                mb: 1,
                lineHeight: 1.3,
                color: 'text.primary',
              }}
            >
              {content.title}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                lineHeight: 1.5,
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {content.description}
            </Typography>
            {isVenturePartnership && (
              <Chip
                label="Venture Partnership"
                size="small"
                sx={{
                  mt: 2,
                  bgcolor: alpha(color, 0.15),
                  color,
                  fontWeight: 600,
                  textTransform: 'none',
                }}
              />
            )}
          </CardContent>
        </Card>
        <Snackbar
          open={Boolean(shareMessage)}
          autoHideDuration={2500}
          onClose={handleShareClose}
          message={shareMessage}
        />
      </>
    );
};

export default ContentCard;
