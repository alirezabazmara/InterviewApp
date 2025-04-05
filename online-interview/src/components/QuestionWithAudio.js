import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';

const QuestionWithAudio = ({ question }) => {
  const playAudio = async () => {
    if (question.audioUrl) {
      const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();

      try {
        const response = await fetch(`${API_BASE_URL}${question.audioUrl}`);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.start();
      } catch (error) {
        console.error("Web Audio playback failed:", error);
      }
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
