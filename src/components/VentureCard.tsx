import React, { useState } from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Box,
  IconButton,
  Stack,
  Chip,
  alpha,
  useTheme,
  Fade,
  Tooltip,
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Share as ShareIcon,
  Visibility as VisibilityIcon,
  Launch as LaunchIcon,
} from '@mui/icons-material';

interface VentureStats {
  likes: number;
  views: string;
  saves: number;
}

interface Venture {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  category: string;
  color: string;
  stats: VentureStats;
  url: string;
  tags: string[];
}

interface VentureCardProps {
  venture: Venture;
  onSave?: (ventureId: string, isSaved: boolean) => void;
}

const VentureCard: React.FC<VentureCardProps> = ({ venture, onSave }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const theme = useTheme();

  const handleVisitApp = () => {
    window.open(venture.url, '_blank');
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newSavedState = !isSaved;
    setIsSaved(newSavedState);
    if (onSave) {
      onSave(venture.id, newSavedState);
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: venture.title,
        text: venture.description,
        url: window.location.origin + venture.url,
      });
    } else {
      navigator.clipboard.writeText(window.location.origin + venture.url);
    }
  };

  return (
    <Card
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleVisitApp}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
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
          borderColor: venture.color,
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
        }}
      >
        <Chip
          label={venture.category}
          size="small"
          sx={{
            bgcolor: venture.color,
            color: 'white',
            fontWeight: 700,
            fontSize: '0.7rem',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            boxShadow: theme.shadows[4],
          }}
        />
      </Box>

      {/* Image */}
      <Box sx={{ position: 'relative', overflow: 'hidden' }}>
        <CardMedia
          component="img"
          height="240"
          image={venture.image}
          alt={venture.title}
          sx={{
            transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: isHovered ? 'scale(1.1)' : 'scale(1)',
          }}
        />
        
        {/* Hover Overlay */}
        <Fade in={isHovered}>
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: alpha(venture.color, 0.85),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <LaunchIcon sx={{ fontSize: 48, color: 'white' }} />
            <Typography
              variant="h6"
              sx={{
                color: 'white',
                fontWeight: 700,
                textAlign: 'center',
                px: 2,
              }}
            >
              Visit Application
            </Typography>
          </Box>
        </Fade>
      </Box>

      {/* Content */}
      <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 800,
            mb: 0.5,
            lineHeight: 1.3,
            color: 'text.primary',
          }}
        >
          {venture.title}
        </Typography>
        
        <Typography
          variant="body2"
          sx={{
            color: venture.color,
            fontWeight: 600,
            mb: 1.5,
          }}
        >
          {venture.subtitle}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            lineHeight: 1.6,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {venture.description}
        </Typography>

        {/* Tags */}
        <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ gap: 0.5 }}>
          {venture.tags.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              variant="outlined"
              sx={{
                fontSize: '0.7rem',
                height: 22,
                borderColor: alpha(venture.color, 0.3),
                color: venture.color,
                fontWeight: 600,
              }}
            />
          ))}
        </Stack>
      </CardContent>

      {/* Actions */}
      <CardActions
        sx={{
          px: 2,
          pb: 2,
          pt: 0,
          justifyContent: 'space-between',
          borderTop: 1,
          borderColor: 'divider',
        }}
      >
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Tooltip title={isLiked ? 'Unlike' : 'Like'}>
            <IconButton
              size="small"
              onClick={handleLike}
              sx={{
                color: isLiked ? 'error.main' : 'text.secondary',
                '&:hover': {
                  bgcolor: alpha(theme.palette.error.main, 0.1),
                },
              }}
            >
              {isLiked ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
            {venture.stats.likes + (isLiked ? 1 : 0)}
          </Typography>

          <Box sx={{ mx: 1 }}>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <VisibilityIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                {venture.stats.views}
              </Typography>
            </Stack>
          </Box>
        </Stack>

        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Share">
            <IconButton
              size="small"
              onClick={handleShare}
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: 'primary.main',
                },
              }}
            >
              <ShareIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Tooltip title={isSaved ? 'Remove from saved' : 'Save'}>
            <IconButton
              size="small"
              onClick={handleSave}
              sx={{
                color: isSaved ? 'primary.main' : 'text.secondary',
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                },
              }}
            >
              {isSaved ? <BookmarkIcon fontSize="small" /> : <BookmarkBorderIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
        </Stack>
      </CardActions>

      {/* Accent Line on Top */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          bgcolor: venture.color,
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
      />
    </Card>
  );
};

export default VentureCard;

