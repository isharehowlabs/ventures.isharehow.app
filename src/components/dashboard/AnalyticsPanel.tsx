import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Menu,
  MenuItem,
  TextField,
  Stack,
} from '@mui/material';
import {
  TrendingUp,
  Download as DownloadIcon,
  FilterList as FilterIcon,
  DateRange as DateRangeIcon,
} from '@mui/icons-material';
import WidgetContainer from './WidgetContainer';
import FilterSwitch from './FilterSwitch';

export default function AnalyticsPanel() {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [filterAnchor, setFilterAnchor] = useState<null | HTMLElement>(null);
  const [showCompleted, setShowCompleted] = useState(true);
  const [showPending, setShowPending] = useState(true);

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchor(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchor(null);
  };

  const handleExport = (format: 'csv' | 'pdf') => {
    // Placeholder for export functionality
    console.log(`Exporting as ${format}`);
  };

  return (
    <Box sx={{ height: '100%', overflow: 'auto', p: 2 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h5" fontWeight={700}>
            Analytics Dashboard
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={handleFilterClick}
            >
              Filters
            </Button>
            <Menu
              anchorEl={filterAnchor}
              open={Boolean(filterAnchor)}
              onClose={handleFilterClose}
            >
              <Box sx={{ p: 2, minWidth: 200 }}>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                  Filter Options
                </Typography>
                <FilterSwitch
                  label="Show Completed"
                  checked={showCompleted}
                  onChange={setShowCompleted}
                  description="Display completed projects"
                />
                <FilterSwitch
                  label="Show Pending"
                  checked={showPending}
                  onChange={setShowPending}
                  description="Display pending tasks"
                />
              </Box>
            </Menu>
            <Button
              variant="outlined"
              startIcon={<DateRangeIcon />}
              onClick={() => {
                // Placeholder for date range picker
                console.log('Date range picker');
              }}
            >
              {dateRange === '7d' ? '7 Days' : dateRange === '30d' ? '30 Days' : dateRange === '90d' ? '90 Days' : 'All Time'}
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => handleExport('csv')}
            >
              Export CSV
            </Button>
          </Stack>
        </Box>

        {/* Metrics Overview */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Card className="dashboard-card">
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Total Projects
                </Typography>
                <Typography variant="h4" fontWeight={700}>
                  24
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <TrendingUp fontSize="small" color="success" />
                  <Typography variant="caption" color="success.main" sx={{ ml: 0.5 }}>
                    +12% this month
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card className="dashboard-card">
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Active Clients
                </Typography>
                <Typography variant="h4" fontWeight={700}>
                  12
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <TrendingUp fontSize="small" color="success" />
                  <Typography variant="caption" color="success.main" sx={{ ml: 0.5 }}>
                    +3 this month
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card className="dashboard-card">
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Completion Rate
                </Typography>
                <Typography variant="h4" fontWeight={700}>
                  87%
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <TrendingUp fontSize="small" color="success" />
                  <Typography variant="caption" color="success.main" sx={{ ml: 0.5 }}>
                    +5% improvement
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card className="dashboard-card">
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Revenue
                </Typography>
                <Typography variant="h4" fontWeight={700}>
                  $45K
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <TrendingUp fontSize="small" color="success" />
                  <Typography variant="caption" color="success.main" sx={{ ml: 0.5 }}>
                    +18% growth
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Charts Placeholder */}
        <WidgetContainer title="Project Progress">
          <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Chart visualization will be integrated here
              <br />
              (MUI X Charts or Recharts)
            </Typography>
          </Box>
        </WidgetContainer>

        {/* Data Table Placeholder */}
        <WidgetContainer title="Recent Activity">
          <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              DataGrid will be integrated here
              <br />
              (MUI X DataGrid)
            </Typography>
          </Box>
        </WidgetContainer>
      </Stack>
    </Box>
  );
}

