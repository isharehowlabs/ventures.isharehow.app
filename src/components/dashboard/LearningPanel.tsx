// src/components/dashboard/LearningPanel.tsx
import type { FC } from 'react';
import { useState } from 'react';

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
} from '@mui/icons-material';
import type { SvgIconComponent } from '@mui/icons-material';

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  lessons: number;
  thumbnail?: string;
  category: string;
  videoUrl?: string;
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

interface VideoClass {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  videoUrl: string;
  thumbnail?: string;
  uploadDate: string;
}

// Sample course data
const courses: Course[] = [
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

// Video classes
const videoClasses: VideoClass[] = [
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
];

const CourseCard: FC<{ course: Course }> = ({ course }) => (
  <Card
    variant="outlined"
    sx={{
      borderRadius: 3,
      height: '100%',
      p: 3,
      borderColor: 'divider',
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      transition: 'transform 0.2s, box-shadow 0.2s',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: 4,
      },
    }}
  >
    {course.thumbnail && (
      <Box
        component="img"
        src={course.thumbnail}
        alt={course.title}
        sx={{
          width: '100%',
          height: 160,
          objectFit: 'cover',
          borderRadius: 2,
        }}
      />
    )}
    <Stack direction="row" spacing={1} alignItems="center">
      <Chip
        label={course.level}
        size="small"
        color={course.level === 'Advanced' ? 'secondary' : course.level === 'Intermediate' ? 'default' : 'primary'}
        sx={{ fontWeight: 600 }}
      />
      <Typography variant="body2" color="text.secondary">
        {course.lessons} lessons
      </Typography>
    </Stack>
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
        {course.title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {course.description}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        By {course.instructor} · {course.duration}
      </Typography>
    </Box>
    <Divider />
    <Button
      variant="contained"
      color="primary"
      startIcon={<PlayCircleOutline />}
      sx={{ textTransform: 'none', fontWeight: 700, mt: 'auto' }}
      onClick={() => {
        // Navigate to course or open course details
        console.log('Open course:', course.id);
      }}
    >
      Start Course
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

const VideoCard: FC<{ video: VideoClass }> = ({ video }) => (
  <Card
    variant="outlined"
    sx={{
      borderRadius: 3,
      height: '100%',
      p: 3,
      borderColor: 'divider',
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      transition: 'transform 0.2s, box-shadow 0.2s',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: 4,
      },
    }}
  >
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
        src={video.videoUrl}
        title={video.title}
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
    <Stack direction="row" spacing={1} alignItems="center">
      <Chip
        label={video.level}
        size="small"
        color={video.level === 'Advanced' ? 'secondary' : video.level === 'Intermediate' ? 'default' : 'primary'}
        sx={{ fontWeight: 600 }}
      />
      <Typography variant="body2" color="text.secondary">
        {video.duration}
      </Typography>
    </Stack>
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
        {video.title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {video.description}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        By {video.instructor} · {new Date(video.uploadDate).toLocaleDateString()}
      </Typography>
    </Box>
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

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
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
            Access your courses, PDF resources, and video classes all in one place. Track your progress, download materials, and continue your learning journey.
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
              label="Courses"
              sx={{ textTransform: 'none', fontWeight: 600 }}
            />
            <Tab
              icon={<PictureAsPdfOutlined />}
              iconPosition="start"
              label="PDFs"
              sx={{ textTransform: 'none', fontWeight: 600 }}
            />
            <Tab
              icon={<VideoLibraryOutlined />}
              iconPosition="start"
              label="Video Classes"
              sx={{ textTransform: 'none', fontWeight: 600 }}
            />
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          <Stack spacing={3}>
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
                  My Courses
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Structured learning paths designed to take you from beginner to advanced.
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
              {courses.map((course) => (
                <Grid item xs={12} md={4} key={course.id}>
                  <CourseCard course={course} />
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

        <TabPanel value={activeTab} index={2}>
          <Stack spacing={3}>
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
                  Video Classes
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Watch recorded classes and tutorials to enhance your understanding of key concepts.
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
              {videoClasses.map((video) => (
                <Grid item xs={12} md={4} key={video.id}>
                  <VideoCard video={video} />
                </Grid>
              ))}
            </Grid>
          </Stack>
        </TabPanel>
      </Stack>
    </Box>
  );
}

