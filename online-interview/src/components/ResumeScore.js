import React from 'react';
import { Box, Typography, CircularProgress, Paper } from '@mui/material';

const ResumeScore = ({ score, level }) => {
  const getColorByLevel = (level) => {
    switch (level) {
      case 'Senior':
        return '#2e7d32';
      case 'Mid-level':
        return '#1976d2';
      case 'Junior':
        return '#ed6c02';
      default:
        return '#757575';
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <Typography variant="h6" color="primary" gutterBottom>
          Your Experience Level
        </Typography>
        
        <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
          <CircularProgress
            variant="determinate"
            value={score}
            size={120}
            thickness={4}
            sx={{ color: getColorByLevel(level) }}
          />
          <Box
            sx={{
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="h4" component="div" color="text.secondary">
              {score}
            </Typography>
          </Box>
        </Box>

        <Typography 
          variant="h5" 
          sx={{ 
            color: getColorByLevel(level),
            fontWeight: 'bold'
          }}
        >
          {level}
        </Typography>
      </Box>
    </Paper>
  );
};

export default ResumeScore; 