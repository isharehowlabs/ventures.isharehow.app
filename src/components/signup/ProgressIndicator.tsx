import React from 'react';
import { Box, Stepper, Step, StepLabel, Typography } from '@mui/material';

interface ProgressIndicatorProps {
  activeStep: number;
  steps: string[];
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ activeStep, steps }) => {
  return (
    <Box sx={{ mb: 4 }}>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label, index) => (
          <Step key={label}>
            <StepLabel>
              <Typography variant="body2" sx={{ fontWeight: activeStep === index ? 700 : 400 }}>
                {label}
              </Typography>
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
};

export default ProgressIndicator;

