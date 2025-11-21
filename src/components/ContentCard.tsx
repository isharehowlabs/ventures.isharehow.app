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
  const theme = useTheme();

  const handleShareClose = () => {
    setShareMessage(null);
  };

  const handleShareClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    const fallbackUrl = typeof window !== 'undefined' ? window.location.href : '';
    const shareUrl = externalUrl ?? fallbackUrl;

    if (!shareUrl) {
      setShareMessage('No link available to share');
      return;
    }

    const handleCopyFallback = async () => {
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

    if (typeof navigator !== 'undefined' && navigator.share && externalUrl) {
      navigator
        .share({ title, url: shareUrl })
        .then(() => setShareMessage('Link shared successfully'))
        .catch(() => handleCopyFallback());
    } else {
      handleCopyFallback();
    }
  };

  const handleCardClick = () => {
    if (externalUrl) {
      window.open(externalUrl, '_blank');
    }
  };

  return (
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
          zIndex: 2,
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
      <Box sx={{ position: 'relative', overflow: 'hidden' }}>
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
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
            />
            <Fade in={isHovered}>
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  bgcolor: alpha(theme.palette.common.black, 0.7),
                  borderRadius: '50%',
                  p: 1,
                }}
              >
                <PlayIcon sx={{ color: 'white', fontSize: 32 }} />
              </Box>
            </Fade>
          </Box>
        )}
        
        {content.mediaType === 'image' && (
          <Box
            component="img"
            src={content.mediaUrl}
            alt={content.title}
            sx={{
              width: '100%',
              height: 240,
              objectFit: 'cover',
              transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: isHovered ? 'scale(1.05)' : 'scale(1)',
            }}
          />
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
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
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
              <IconButton aria-label="Share content" onClick={handleShareClick} sx={{ p: 0.5 }}>
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

        {/* Hover Overlay */}
        <Fade in={isHovered}>
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: alpha(theme.palette.primary.main, 0.9),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 3,
              zIndex: 1,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: 'white',
                fontWeight: 700,
                textAlign: 'center',
              }}
            >
              {content.externalUrl ? 'Visit Content' : 'View Content'}
            </Typography>
          </Box>
        </Fade>
        <Snackbar
          open={Boolean(shareMessage)}
          autoHideDuration={2500}
          onClose={handleShareClose}
          message={shareMessage}
        />
      </Card>
  );
};

export default ContentCard;