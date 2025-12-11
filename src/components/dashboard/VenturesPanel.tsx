'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  InputAdornment,
  ToggleButtonGroup,
  ToggleButton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  LinearProgress,
  Avatar,
  AvatarGroup,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Alert,
  useTheme,
  alpha,
  Paper,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  ViewModule as GridViewIcon,
  ViewList as ListViewIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  WorkOutline as WorkIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import { Venture, VentureStatus } from '../../types/venture';
import { ventureService } from '../../services/ventureService';
import VentureCard from './ventures/VentureCard';
import AddVentureDialog from './ventures/AddVentureDialog';
import VentureDetailsDialog from './ventures/VentureDetailsDialog';

const VenturesPanel: React.FC = () => {
  const theme = useTheme();
  const [ventures, setVentures] = useState<Venture[]>([]);
  const [filteredVentures, setFilteredVentures] = useState<Venture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<VentureStatus | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedVenture, setSelectedVenture] = useState<Venture | null>(null);
  const [metrics, setMetrics] = useState({
    total: 0,
    active: 0,
    completed: 0,
    totalRevenue: 0,
  });
  const [menuAnchor, setMenuAnchor] = useState<{ [key: number]: HTMLElement | null }>({});

  useEffect(() => {
    loadVentures();
    loadMetrics();
  }, []);

  useEffect(() => {
    filterVentures();
  }, [ventures, searchQuery, statusFilter]);

  const loadVentures = async () => {
    try {
      setLoading(true);
      const data = await ventureService.getVentures();
      setVentures(data);
      setError(null);
    } catch (err) {
      setError('Failed to load ventures');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadMetrics = async () => {
    try {
      const data = await ventureService.getMetrics();
      setMetrics(data);
    } catch (err) {
      console.error('Failed to load metrics:', err);
    }
  };

  const filterVentures = () => {
    let filtered = ventures;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(v => v.status === statusFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        v =>
          v.name.toLowerCase().includes(query) ||
          v.description.toLowerCase().includes(query) ||
          v.clientName?.toLowerCase().includes(query) ||
          v.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    setFilteredVentures(filtered);
  };

  const handleAddVenture = async (ventureData: any) => {
    try {
      await ventureService.createVenture(ventureData);
      await loadVentures();
      await loadMetrics();
      setAddDialogOpen(false);
    } catch (err) {
      console.error('Failed to add venture:', err);
      alert('Failed to add venture');
    }
  };

  const handleDeleteVenture = async (id: number) => {
    if (!confirm('Are you sure you want to delete this venture?')) return;

    try {
      await ventureService.deleteVenture(id);
      await loadVentures();
      await loadMetrics();
    } catch (err) {
      console.error('Failed to delete venture:', err);
      alert('Failed to delete venture');
    }
  };

  const handleViewDetails = (venture: Venture) => {
    setSelectedVenture(venture);
    setDetailsDialogOpen(true);
  };

  const handleEditVenture = (venture: Venture) => {
    // For now, just view details. Can add edit functionality later
    handleViewDetails(venture);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, ventureId: number) => {
    setMenuAnchor(prev => ({ ...prev, [ventureId]: event.currentTarget }));
  };

  const handleMenuClose = (ventureId: number) => {
    setMenuAnchor(prev => ({ ...prev, [ventureId]: null }));
  };

  const getStatusColor = (status: VentureStatus): 'default' | 'primary' | 'success' | 'warning' | 'error' => {
    switch (status) {
      case VentureStatus.ACTIVE:
        return 'primary';
      case VentureStatus.COMPLETED:
        return 'success';
      case VentureStatus.ON_HOLD:
        return 'warning';
      case VentureStatus.PLANNING:
        return 'default';
      case VentureStatus.CANCELLED:
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: VentureStatus): string => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const MetricCard = ({ title, value, icon, color }: any) => (
    <Card
      sx={{
        height: '100%',
        background: `linear-gradient(135deg, ${alpha(color, 0.1)} 0%, ${alpha(color, 0.05)} 100%)`,
        border: `1px solid ${alpha(color, 0.2)}`,
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box
            sx={{
              bgcolor: alpha(color, 0.15),
              color: color,
              p: 1,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
        </Box>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
      </CardContent>
    </Card>
  );

  if (loading && ventures.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Ventures"
            value={metrics.total}
            icon={<WorkIcon />}
            color={theme.palette.primary.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Active Ventures"
            value={metrics.active}
            icon={<TrendingUpIcon />}
            color={theme.palette.info.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Completed"
            value={metrics.completed}
            icon={<CheckCircleIcon />}
            color={theme.palette.success.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Revenue"
            value={`$${(metrics.totalRevenue / 1000).toFixed(0)}K`}
            icon={<MoneyIcon />}
            color={theme.palette.warning.main}
          />
        </Grid>
      </Grid>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Toolbar */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          placeholder="Search ventures..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ flex: '1 1 300px' }}
        />

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            label="All"
            onClick={() => setStatusFilter('all')}
            color={statusFilter === 'all' ? 'primary' : 'default'}
            variant={statusFilter === 'all' ? 'filled' : 'outlined'}
          />
          <Chip
            label="Planning"
            onClick={() => setStatusFilter(VentureStatus.PLANNING)}
            color={statusFilter === VentureStatus.PLANNING ? 'primary' : 'default'}
            variant={statusFilter === VentureStatus.PLANNING ? 'filled' : 'outlined'}
          />
          <Chip
            label="Active"
            onClick={() => setStatusFilter(VentureStatus.ACTIVE)}
            color={statusFilter === VentureStatus.ACTIVE ? 'primary' : 'default'}
            variant={statusFilter === VentureStatus.ACTIVE ? 'filled' : 'outlined'}
          />
          <Chip
            label="On Hold"
            onClick={() => setStatusFilter(VentureStatus.ON_HOLD)}
            color={statusFilter === VentureStatus.ON_HOLD ? 'primary' : 'default'}
            variant={statusFilter === VentureStatus.ON_HOLD ? 'filled' : 'outlined'}
          />
          <Chip
            label="Completed"
            onClick={() => setStatusFilter(VentureStatus.COMPLETED)}
            color={statusFilter === VentureStatus.COMPLETED ? 'primary' : 'default'}
            variant={statusFilter === VentureStatus.COMPLETED ? 'filled' : 'outlined'}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, newMode) => newMode && setViewMode(newMode)}
            size="small"
          >
            <ToggleButton value="grid">
              <GridViewIcon />
            </ToggleButton>
            <ToggleButton value="table">
              <ListViewIcon />
            </ToggleButton>
          </ToggleButtonGroup>

          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddDialogOpen(true)}>
            Add Venture
          </Button>
        </Box>
      </Box>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <Grid container spacing={3}>
          {filteredVentures.length === 0 ? (
            <Grid item xs={12}>
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="text.secondary">
                  No ventures found
                </Typography>
              </Box>
            </Grid>
          ) : (
            filteredVentures.slice(page * rowsPerPage, (page + 1) * rowsPerPage).map((venture) => (
              <Grid item xs={12} sm={6} md={4} key={venture.id}>
                <VentureCard
                  venture={venture}
                  onEdit={handleEditVenture}
                  onDelete={handleDeleteVenture}
                  onView={handleViewDetails}
                />
              </Grid>
            ))
          )}
        </Grid>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Progress</TableCell>
                <TableCell>Budget</TableCell>
                <TableCell>Deadline</TableCell>
                <TableCell>Team</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredVentures.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography color="text.secondary" py={4}>
                      No ventures found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredVentures.slice(page * rowsPerPage, (page + 1) * rowsPerPage).map((venture) => (
                  <TableRow
                    key={venture.id}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => handleViewDetails(venture)}
                  >
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {venture.name}
                        </Typography>
                        {venture.clientName && (
                          <Typography variant="caption" color="text.secondary">
                            {venture.clientName}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label={getStatusLabel(venture.status)} color={getStatusColor(venture.status)} size="small" />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={venture.progress}
                          sx={{ flex: 1, height: 6, borderRadius: 3 }}
                        />
                        <Typography variant="caption">{venture.progress}%</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">${venture.budget.toLocaleString()}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        ${venture.spent.toLocaleString()} spent
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{new Date(venture.deadline).toLocaleDateString()}</Typography>
                    </TableCell>
                    <TableCell>
                      <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 28, height: 28 } }}>
                        {venture.team.map((member) => (
                          <Avatar key={member.id} alt={member.name} src={member.avatar}>
                            {member.name.charAt(0)}
                          </Avatar>
                        ))}
                      </AvatarGroup>
                    </TableCell>
                    <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                      <IconButton size="small" onClick={(e) => handleMenuOpen(e, venture.id)}>
                        <MoreVertIcon />
                      </IconButton>
                      <Menu
                        anchorEl={menuAnchor[venture.id]}
                        open={Boolean(menuAnchor[venture.id])}
                        onClose={() => handleMenuClose(venture.id)}
                      >
                        <MenuItem
                          onClick={() => {
                            handleViewDetails(venture);
                            handleMenuClose(venture.id);
                          }}
                        >
                          <ListItemIcon>
                            <VisibilityIcon fontSize="small" />
                          </ListItemIcon>
                          <ListItemText>View Details</ListItemText>
                        </MenuItem>
                        <MenuItem
                          onClick={() => {
                            handleEditVenture(venture);
                            handleMenuClose(venture.id);
                          }}
                        >
                          <ListItemIcon>
                            <EditIcon fontSize="small" />
                          </ListItemIcon>
                          <ListItemText>Edit</ListItemText>
                        </MenuItem>
                        <MenuItem
                          onClick={() => {
                            handleDeleteVenture(venture.id);
                            handleMenuClose(venture.id);
                          }}
                        >
                          <ListItemIcon>
                            <DeleteIcon fontSize="small" color="error" />
                          </ListItemIcon>
                          <ListItemText sx={{ color: 'error.main' }}>Delete</ListItemText>
                        </MenuItem>
                      </Menu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={filteredVentures.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </TableContainer>
      )}

      {/* Pagination for Grid View */}
      {viewMode === 'grid' && filteredVentures.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <TablePagination
            component="div"
            count={filteredVentures.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[6, 12, 24]}
          />
        </Box>
      )}

      {/* Dialogs */}
      <AddVentureDialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} onSave={handleAddVenture} />
      <VentureDetailsDialog
        open={detailsDialogOpen}
        venture={selectedVenture}
        onClose={() => setDetailsDialogOpen(false)}
      />
    </Box>
  );
};

export default VenturesPanel;
