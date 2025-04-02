import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';

const QuestionWithAudio = ({ question }) => {
  const playAudio = () => {
    if (question.audioUrl) {
      const audio = new Audio(`http://localhost:5000${question.audioUrl}`);
      audio.play();
    }
  };

  return (
    <Box display="flex" alignItems="center" justifyContent="space-between">
      <Typography variant="body1">
        {question.text}
      </Typography>
      {question.audioUrl && (
        <IconButton 
          color="primary" 
          onClick={playAudio}
          sx={{ ml: 2 }}
        >
          <VolumeUpIcon />
        </IconButton>
      )}
    </Box>
  );
};

export default QuestionWithAudio; 