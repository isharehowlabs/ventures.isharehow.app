// src/components/dashboard/LearningPanel.tsx
import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Stack,
  Typography,
  Tabs,
  Tab,
  IconButton,
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  Paper,
  LinearProgress,
  useTheme,
  alpha,
} from '@mui/material';
import {
  ArticleOutlined,
  VideoLibraryOutlined,
  MenuBookOutlined,
  PictureAsPdfOutlined,
  PlayCircleOutline,
  PictureAsPdf,
  SchoolOutlined,
  Download,
  Launch,
  FilterList,
  Close as CloseIcon,
  Note as NoteIcon,
  Build as BuildIcon,
  TrendingUp,
  AccessTime,
  CheckCircle,
  Bookmark,
} from '@mui/icons-material';
import type { SvgIconComponent } from '@mui/icons-material';

interface LearningContent {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  videoUrl?: string;
  thumbnail?: string;
  lessons?: number;
  uploadDate?: string;
  pdfResources?: string[];
  progress?: number;
  enrolled?: number;
}

interface PDFResource {
  id: string;
  title: string;
  description: string;
  category: string;
  url: string;
  fileSize: string;
  pages?: number;
  uploadDate: string;
  thumbnail?: string;
}

// Combined courses and video classes - KEEPING ALL VIDEO CLASSES
const learningContent: LearningContent[] = [
  {
    id: 'video-1',
    title: 'Learning Hub Video Classes',
    description: 'A comprehensive collection of video classes covering various topics and learning paths.',
    instructor: 'iShareHow',
    duration: 'Playlist',
    level: 'Beginner',
    category: 'General',
    videoUrl: 'https://www.youtube.com/embed/videoseries?list=PLwyVPJ9qE2K-g5CQgIYtOfnrfl7ebWRkp',
    uploadDate: new Date().toISOString().split('T')[0],
    progress: 45,
    enrolled: 1250,
  },
  {
    id: 'course-1',
    title: 'Introduction to Ai Development',
    description: 'Learn the fundamentals of AI development including machine learning, neural networks, and data processing basics.',
    instructor: 'iShareHow',
    duration: 'Self Paced',
    level: 'Beginner',
    category: 'AI Development',
    videoUrl: 'https://www.youtube.com/playlist?list=PLwyVPJ9qE2K8vj0Wfb4rxAmZntkysHPlE',
    uploadDate: new Date().toISOString().split('T')[0],
    progress: 30,
    enrolled: 890,
  },
];

// Sample PDF resources
const pdfResources: PDFResource[] = [
  {
    id: 'pdf-1',
    title: 'Complete JavaScript Guide',
    description: 'Comprehensive guide covering JavaScript fundamentals, ES6+, and modern best practices.',
    category: 'Programming',
    url: '/resources/javascript-guide.pdf',
    fileSize: '2.4 MB',
    pages: 145,
    uploadDate: '2024-01-15',
  },
];

const LearningContentCard: FC<{ 
  content: LearningContent;
  onClick: () => void;
}> = ({ content, onClick }) => {
  const theme = useTheme();
  
  return (
    <Card
      variant="outlined"
      onClick={onClick}
      sx={{
        borderRadius: 3,
        height: '100%',
        overflow: 'hidden',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'pointer',
        position: 'relative',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: 8,
        },
      }}
    >
      {/* Video/Thumbnail Section */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          paddingTop: '56.25%', // 16:9 aspect ratio
          overflow: 'hidden',
          bgcolor: 'grey.200',
        }}
      >
        {content.videoUrl ? (
          <iframe
            src={content.videoUrl}
            title={content.title}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              border: 0,
            }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : content.thumbnail ? (
          <Box
            component="img"
            src={content.thumbnail}
            alt={content.title}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              bgcolor: 'primary.light',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <PlayCircleOutline sx={{ fontSize: 64, color: 'primary.main' }} />
          </Box>
        )}
        {/* Progress Overlay */}
        {content.progress !== undefined && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              bgcolor: alpha('#000', 0.7),
              p: 1,
            }}
          >
            <LinearProgress
              variant="determinate"
              value={content.progress}
              sx={{
                height: 4,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.2),
                '& .MuiLinearProgress-bar': {
                  bgcolor: theme.palette.primary.main,
                },
              }}
            />
            <Typography variant="caption" sx={{ color: 'white', mt: 0.5, display: 'block' }}>
              {content.progress}% Complete
            </Typography>
          </Box>
        )}
        {/* Level Badge */}
        <Chip
          label={content.level}
          size="small"
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            bgcolor: content.level === 'Advanced' 
              ? 'error.main' 
              : content.level === 'Intermediate' 
              ? 'warning.main' 
              : 'success.main',
            color: 'white',
            fontWeight: 700,
          }}
        />
      </Box>

      <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Stack spacing={1.5} sx={{ flexGrow: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, lineHeight: 1.3 }}>
            {content.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, mb: 1 }}>
            {content.description}
          </Typography>
          
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Chip
              label={content.category}
              size="small"
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
            {content.enrolled && (
              <Stack direction="row" spacing={0.5} alignItems="center">
                <SchoolOutlined sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  {content.enrolled}
                </Typography>
              </Stack>
            )}
          </Stack>

          <Divider sx={{ my: 1 }} />

          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={1} alignItems="center">
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                {content.instructor.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Instructor
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {content.instructor}
                </Typography>
              </Box>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <AccessTime sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                {content.duration}
              </Typography>
            </Stack>
          </Stack>
        </Stack>

        <Button
          variant="contained"
          color="primary"
          fullWidth
          startIcon={<PlayCircleOutline />}
          sx={{
            textTransform: 'none',
            fontWeight: 700,
            mt: 2,
            py: 1.5,
            borderRadius: 2,
          }}
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          {content.videoUrl ? 'Watch Class' : 'Start Course'}
        </Button>
      </CardContent>
    </Card>
  );
};

const PDFCard: FC<{ pdf: PDFResource }> = ({ pdf }) => (
  <Card
    variant="outlined"
    sx={{
      borderRadius: 3,
      p: 3,
      borderColor: 'divider',
      display: 'flex',
      gap: 2,
      flexDirection: { xs: 'column', sm: 'row' },
      alignItems: { xs: 'flex-start', sm: 'center' },
      justifyContent: 'space-between',
      transition: 'transform 0.2s, box-shadow 0.2s',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: 4,
      },
    }}
  >
    <Stack direction="row" spacing={2} sx={{ flexGrow: 1 }}>
      <Avatar
        variant="rounded"
        sx={{
          bgcolor: 'error.light',
          color: 'error.main',
          width: 56,
          height: 56,
        }}
      >
        <PictureAsPdf fontSize="large" />
      </Avatar>
      <Stack spacing={1} sx={{ flexGrow: 1 }}>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <Chip
            label={pdf.category}
            size="small"
            color="primary"
            sx={{ fontWeight: 600 }}
          />
          <Typography variant="caption" color="text.secondary">
            {pdf.fileSize}
          </Typography>
          {pdf.pages && (
            <Typography variant="caption" color="text.secondary">
              · {pdf.pages} pages
            </Typography>
          )}
        </Stack>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {pdf.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {pdf.description}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Uploaded {new Date(pdf.uploadDate).toLocaleDateString()}
        </Typography>
      </Stack>
    </Stack>
    <Stack direction="row" spacing={1}>
      <Button
        href={pdf.url}
        target="_blank"
        rel="noopener noreferrer"
        variant="outlined"
        color="primary"
        startIcon={<Launch />}
        sx={{ textTransform: 'none', fontWeight: 700 }}
      >
        View
      </Button>
      <Button
        href={pdf.url}
        download
        variant="outlined"
        color="primary"
        startIcon={<Download />}
        sx={{ textTransform: 'none', fontWeight: 700 }}
      >
        Download
      </Button>
    </Stack>
  </Card>
);

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`learning-tabpanel-${index}`}
      aria-labelledby={`learning-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function LearningPanel() {
  const theme = useTheme();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedContent, setSelectedContent] = useState<LearningContent | null>(null);
  const [notes, setNotes] = useState<{ [key: string]: string }>({});

  // Map subtab names to indices
  const subtabMap: Record<string, number> = {
    courses: 0,
    pdfs: 1,
  };

  // Initialize subtab from URL query parameter
  useEffect(() => {
    const subtabParam = router.query.subtab as string;
    if (subtabParam && subtabMap[subtabParam] !== undefined) {
      setActiveTab(subtabMap[subtabParam]);
    }
  }, [router.query.subtab]);

  // Load notes from localStorage on mount
  useEffect(() => {
    const savedNotes = localStorage.getItem('learningHubNotes');
    if (savedNotes) {
      try {
        setNotes(JSON.parse(savedNotes));
      } catch (e) {
        console.error('Failed to load notes:', e);
      }
    }
  }, []);

  // Save notes to localStorage whenever they change
  useEffect(() => {
    if (Object.keys(notes).length > 0 || localStorage.getItem('learningHubNotes')) {
      localStorage.setItem('learningHubNotes', JSON.stringify(notes));
    }
  }, [notes]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    
    // Update URL with subtab parameter
    const subtabNames = Object.keys(subtabMap);
    const subtabName = subtabNames.find(key => subtabMap[key] === newValue);
    if (subtabName) {
      router.push({
        pathname: router.pathname,
        query: { ...router.query, tab: 'learning', subtab: subtabName },
      }, undefined, { shallow: true });
    }
  };

  const handleContentClick = (content: LearningContent) => {
    setSelectedContent(content);
    // Load notes for this content if they exist
    if (!notes[content.id]) {
      setNotes((prev) => ({ ...prev, [content.id]: '' }));
    }
  };

  const handleCloseDialog = () => {
    setSelectedContent(null);
  };

  const handleNotesChange = (contentId: string, value: string) => {
    setNotes((prev) => ({ ...prev, [contentId]: value }));
  };

  // Calculate stats
  const totalCourses = learningContent.length;
  const totalPDFs = pdfResources.length;
  const inProgress = learningContent.filter(c => c.progress && c.progress > 0 && c.progress < 100).length;
  const completed = learningContent.filter(c => c.progress === 100).length;
  const avgProgress = learningContent.length > 0
    ? Math.round(learningContent.reduce((sum, c) => sum + (c.progress || 0), 0) / learningContent.length)
    : 0;

  return (
    <Box sx={{ height: '100%', overflow: 'auto' }}>
      <Stack spacing={4}>
        {/* Stats Cards */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                borderRadius: 3,
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                  <MenuBookOutlined />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {totalCourses}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Courses
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                borderRadius: 3,
                background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.success.main, 0.05)} 100%)`,
                border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: 'success.main', width: 56, height: 56 }}>
                  <CheckCircle />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {completed}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completed
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                borderRadius: 3,
                background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)} 0%, ${alpha(theme.palette.warning.main, 0.05)} 100%)`,
                border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: 'warning.main', width: 56, height: 56 }}>
                  <TrendingUp />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {inProgress}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    In Progress
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                borderRadius: 3,
                background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)} 0%, ${alpha(theme.palette.info.main, 0.05)} 100%)`,
                border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: 'info.main', width: 56, height: 56 }}>
                  <PictureAsPdfOutlined />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {totalPDFs}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    PDF Resources
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
        </Grid>

        {/* Progress Overview */}
        <Paper
          elevation={2}
          sx={{
            p: 4,
            borderRadius: 3,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Box>
              <Typography variant="h5" fontWeight={700} gutterBottom>
                Overall Progress
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Track your learning journey
              </Typography>
            </Box>
            <Chip
              label={`${avgProgress}%`}
              color="primary"
              sx={{ fontWeight: 700, fontSize: '1rem', py: 2.5 }}
            />
          </Stack>
          <LinearProgress
            variant="determinate"
            value={avgProgress}
            sx={{
              height: 12,
              borderRadius: 6,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              '& .MuiLinearProgress-bar': {
                borderRadius: 6,
                background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              },
            }}
          />
        </Paper>

        {/* Header Section */}
        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  mb: 1,
                  background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Learning Management
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Access your courses, video classes, and PDF resources all in one place
              </Typography>
            </Box>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<FilterList />}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              Filter
            </Button>
          </Stack>
        </Box>

        {/* Tabs */}
        <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              aria-label="learning content tabs"
              variant="fullWidth"
            >
              <Tab
                icon={<MenuBookOutlined />}
                iconPosition="start"
                label="Courses & Classes"
                sx={{ textTransform: 'none', fontWeight: 600, py: 2 }}
              />
              <Tab
                icon={<PictureAsPdfOutlined />}
                iconPosition="start"
                label="PDF Resources"
                sx={{ textTransform: 'none', fontWeight: 600, py: 2 }}
              />
            </Tabs>
          </Box>

          <Box sx={{ p: 3 }}>
            <TabPanel value={activeTab} index={0}>
              <Stack spacing={3}>
                <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                      My Courses & Video Classes
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Click any course or class to watch videos and take notes
                    </Typography>
                  </Box>
                </Stack>
                <Grid container spacing={3}>
                  {learningContent.map((content) => (
                    <Grid item xs={12} sm={6} md={4} key={content.id}>
                      <LearningContentCard 
                        content={content} 
                        onClick={() => handleContentClick(content)}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Stack>
            </TabPanel>

            <TabPanel value={activeTab} index={1}>
              <Stack spacing={3}>
                <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                      PDF Resources
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Downloadable guides, references, and study materials
                    </Typography>
                  </Box>
                </Stack>
                <Stack spacing={2}>
                  {pdfResources.map((pdf) => (
                    <PDFCard key={pdf.id} pdf={pdf} />
                  ))}
                </Stack>
              </Stack>
            </TabPanel>
          </Box>
        </Paper>
      </Stack>

      {/* Expanded Video/Class Dialog with Notes - KEEPING ALL VIDEO FUNCTIONALITY */}
      <Dialog
        open={!!selectedContent}
        onClose={handleCloseDialog}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            height: '90vh',
            maxHeight: '90vh',
            borderRadius: 3,
          },
        }}
      >
        {selectedContent && (
          <>
            <DialogTitle>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {selectedContent.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    By {selectedContent.instructor} · {selectedContent.duration}
                  </Typography>
                </Box>
                <IconButton onClick={handleCloseDialog}>
                  <CloseIcon />
                </IconButton>
              </Stack>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3} sx={{ height: 'calc(90vh - 120px)' }}>
                {/* Video Section - KEEPING ALL VIDEO CLASSES */}
                <Grid item xs={12} md={8}>
                  <Box
                    sx={{
                      position: 'relative',
                      width: '100%',
                      paddingTop: '56.25%', // 16:9 aspect ratio
                      borderRadius: 2,
                      overflow: 'hidden',
                      bgcolor: 'grey.200',
                      mb: 2,
                    }}
                  >
                    {selectedContent.videoUrl ? (
                      <iframe
                        src={selectedContent.videoUrl}
                        title={selectedContent.title}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          border: 0,
                        }}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: 'primary.light',
                        }}
                      >
                        <PlayCircleOutline sx={{ fontSize: 80, color: 'primary.main' }} />
                      </Box>
                    )}
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                      About This {selectedContent.videoUrl ? 'Class' : 'Course'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {selectedContent.description}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 2 }} flexWrap="wrap">
                      <Chip
                        label={selectedContent.level}
                        size="small"
                        color={selectedContent.level === 'Advanced' ? 'error' : selectedContent.level === 'Intermediate' ? 'warning' : 'success'}
                      />
                      <Chip label={selectedContent.category} size="small" variant="outlined" />
                      {selectedContent.progress !== undefined && (
                        <Chip
                          label={`${selectedContent.progress}% Complete`}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      )}
                    </Stack>
                  </Box>
                </Grid>

                {/* Notes Section */}
                <Grid item xs={12} md={4}>
                  <Paper
                    elevation={2}
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      p: 3,
                      borderRadius: 2,
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                      <NoteIcon color="primary" />
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        My Notes
                      </Typography>
                    </Stack>
                    <TextField
                      multiline
                      fullWidth
                      rows={20}
                      placeholder="Take notes while watching..."
                      value={notes[selectedContent.id] || ''}
                      onChange={(e) => handleNotesChange(selectedContent.id, e.target.value)}
                      variant="outlined"
                      sx={{
                        flexGrow: 1,
                        '& .MuiInputBase-root': {
                          height: '100%',
                          alignItems: 'flex-start',
                        },
                        '& textarea': {
                          height: '100% !important',
                          overflow: 'auto !important',
                        },
                      }}
                    />
                  </Paper>
                </Grid>
              </Grid>
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  );
}
