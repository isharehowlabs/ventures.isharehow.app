import { Card, CardContent, Box, Typography, Avatar, Button, Chip, Stack } from '@mui/material';
import { Edit as EditIcon, LocationOn, Email, Phone } from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';

interface ProfileCardProps {
  onEditClick?: () => void;
}

export default function ProfileCard({ onEditClick }: ProfileCardProps) {
  const { user } = useAuth();

  return (
    <Card className="dashboard-card profile-card" sx={{ mb: 3 }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
          <Avatar
            src={user?.avatar}
            alt={user?.name || 'User'}
            sx={{
              width: 80,
              height: 80,
              border: '3px solid',
              borderColor: 'primary.main',
            }}
          >
            {user?.name?.charAt(0) || 'U'}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="h5" fontWeight={700}>
                {user?.name || 'User'}
              </Typography>
              {onEditClick && (
                <Button
                  size="small"
                  startIcon={<EditIcon />}
                  onClick={onEditClick}
                  variant="outlined"
                >
                  Edit
                </Button>
              )}
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {user?.email || 'No email'}
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip label="Member" size="small" color="primary" />
              {user?.isPaidMember && (
                <Chip label="Premium" size="small" color="success" />
              )}
            </Stack>
          </Box>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mt: 2 }}>
          {user?.email && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Email fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {user.email}
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

