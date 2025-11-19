// src/components/dashboard/LearningPanel.tsx
import type { FC } from 'react';
import { useState, useEffect } from 'react';

import {
  Avatar,
  Box,
  Button,
  Card,
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

// Combined courses and video classes
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
  },
  {
    id: 'course-1',
    title: 'Introduction to Web Development',
    description: 'Learn the fundamentals of web development including HTML, CSS, and JavaScript basics.',
    instructor: 'Jane Smith',
    duration: '8 weeks',
    level: 'Beginner',
    lessons: 24,
    category: 'Web Development',
    thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop',
  },
  {
    id: 'course-2',
    title: 'Advanced React Patterns',
    description: 'Master advanced React patterns, hooks, and state management techniques for scalable applications.',
    instructor: 'John Doe',
    duration: '6 weeks',
    level: 'Advanced',
    lessons: 18,
    category: 'Frontend',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=600&fit=crop',
  },
  {
    id: 'course-3',
    title: 'Python for Data Science',
    description: 'Complete guide to Python programming for data analysis, visualization, and machine learning.',
    instructor: 'Sarah Johnson',
    duration: '10 weeks',
    level: 'Intermediate',
    lessons: 30,
    category: 'Data Science',
    thumbnail: 'https://images.unsplash.com/photo-1528595447627-52cf01f2e49c?w=800&h=600&fit=crop',
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
  {
    id: 'pdf-2',
    title: 'UI/UX Design Principles',
    description: 'Essential principles and guidelines for creating effective user interfaces and experiences.',
    category: 'Design',
    url: '/resources/ui-ux-principles.pdf',
    fileSize: '1.8 MB',
    pages: 98,
    uploadDate: '2024-02-01',
  },
  {
    id: 'pdf-3',
    title: 'System Architecture Patterns',
    description: 'Common patterns and best practices for designing scalable and maintainable systems.',
    category: 'Architecture',
    url: '/resources/system-architecture.pdf',
    fileSize: '3.2 MB',
    pages: 212,
    uploadDate: '2024-01-20',
  },
];

const LearningContentCard: FC<{ 
  content: LearningContent;
  onClick: () => void;
}> = ({ content, onClick }) => (
  <Card
    variant="outlined"
    onClick={onClick}
    sx={{
      borderRadius: 3,
      height: '100%',
      p: 3,
      borderColor: 'divider',
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      transition: 'transform 0.2s, box-shadow 0.2s',
      cursor: 'pointer',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: 4,
      },
    }}
  >
    {content.videoUrl ? (
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          paddingTop: '56.25%', // 16:9 aspect ratio
          borderRadius: 2,
          overflow: 'hidden',
          bgcolor: 'grey.200',
        }}
      >
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
      </Box>
    ) : content.thumbnail ? (
      <Box
        component="img"
        src={content.thumbnail}
        alt={content.title}
        sx={{
          width: '100%',
          height: 160,
          objectFit: 'cover',
          borderRadius: 2,
        }}
      />
    ) : (
      <Box
        sx={{
          width: '100%',
          height: 160,
          borderRadius: 2,
          bgcolor: 'primary.light',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <PlayCircleOutline sx={{ fontSize: 64, color: 'primary.main' }} />
      </Box>
    )}
    <Stack direction="row" spacing={1} alignItems="center">
      <Chip
        label={content.level}
        size="small"
        color={content.level === 'Advanced' ? 'secondary' : content.level === 'Intermediate' ? 'default' : 'primary'}
        sx={{ fontWeight: 600 }}
      />
      {content.lessons && (
        <Typography variant="body2" color="text.secondary">
          {content.lessons} lessons
        </Typography>
      )}
    </Stack>
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
        {content.title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {content.description}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        By {content.instructor} · {content.duration}
      </Typography>
    </Box>
    <Divider />
    <Button
      variant="contained"
      color="primary"
      startIcon={<PlayCircleOutline />}
      sx={{ textTransform: 'none', fontWeight: 700, mt: 'auto' }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      {content.videoUrl ? 'Watch Class' : 'Start Course'}
    </Button>
  </Card>
);

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
        boxShadow: 2,
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
        <Stack direction="row" spacing={1} alignItems="center">
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
  const [activeTab, setActiveTab] = useState(0);
  const [selectedContent, setSelectedContent] = useState<LearningContent | null>(null);
  const [notes, setNotes] = useState<{ [key: string]: string }>({});

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

  return (
    <Box sx={{ height: '100%', overflow: 'auto', p: { xs: 2, sm: 3 } }}>
      <Stack spacing={4}>
        <Box>
          <Chip
            label="Learning Hub"
            color="primary"
            icon={<SchoolOutlined fontSize="small" />}
            sx={{ fontWeight: 700, mb: 2, alignSelf: 'flex-start' }}
          />
          <Typography
            variant="h4"
            sx={{
              fontWeight: 900,
              mb: 2,
              background: 'linear-gradient(90deg, #22D3EE, #6366F1)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Your Learning Hub
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 720 }}>
            Access your courses and video classes all in one place. Click any class to watch in a larger view and take notes.
          </Typography>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="learning content tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab
              icon={<MenuBookOutlined />}
              iconPosition="start"
              label="Courses & Classes"
              sx={{ textTransform: 'none', fontWeight: 600 }}
            />
            <Tab
              icon={<PictureAsPdfOutlined />}
              iconPosition="start"
              label="PDFs"
              sx={{ textTransform: 'none', fontWeight: 600 }}
            />
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          <Stack spacing={3}>
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
                  My Courses & Classes
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Click any course or class to watch videos in a larger view and take notes.
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
            <Grid container spacing={3}>
              {learningContent.map((content) => (
                <Grid item xs={12} md={4} key={content.id}>
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
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
                  PDF Resources
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Downloadable guides, references, and study materials to supplement your learning.
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
            <Stack spacing={2}>
              {pdfResources.map((pdf) => (
                <PDFCard key={pdf.id} pdf={pdf} />
              ))}
            </Stack>
          </Stack>
        </TabPanel>
      </Stack>

      {/* Expanded Video/Class Dialog with Notes */}
      <Dialog
        open={!!selectedContent}
        onClose={handleCloseDialog}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            height: '90vh',
            maxHeight: '90vh',
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
                {/* Video Section */}
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
                    <Typography variant="body2" color="text.secondary">
                      {selectedContent.description}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                      <Chip
                        label={selectedContent.level}
                        size="small"
                        color={selectedContent.level === 'Advanced' ? 'secondary' : selectedContent.level === 'Intermediate' ? 'default' : 'primary'}
                      />
                      <Chip label={selectedContent.category} size="small" variant="outlined" />
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
                      p: 2,
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

