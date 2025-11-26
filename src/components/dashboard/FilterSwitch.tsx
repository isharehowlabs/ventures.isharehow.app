import { Box, FormControlLabel, Switch, Typography } from '@mui/material';

interface FilterSwitchProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
}

export default function FilterSwitch({ label, checked, onChange, description }: FilterSwitchProps) {
  return (
    <Box sx={{ mb: 2 }}>
      <FormControlLabel
        control={
          <Switch
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            color="primary"
          />
        }
        label={
          <Box>
            <Typography variant="body2" fontWeight={500}>
              {label}
            </Typography>
            {description && (
              <Typography variant="caption" color="text.secondary">
                {description}
              </Typography>
            )}
          </Box>
        }
      />
    </Box>
  );
}

