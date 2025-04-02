import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  LinearProgress,
  IconButton,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';

const InterviewResults = ({ open, onClose, results }) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        bgcolor: 'primary.main',
        color: 'white'
      }}>
        Interview Results
        <IconButton color="inherit" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        {results.map((result, index) => (
          <Accordion key={index} sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                width: '100%',
                pr: 2 
              }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  Question {index + 1}: {result.question.text}
                </Typography>
                <Chip 
                  label={`Score: ${Math.round(result.score * 100)}%`}
                  color={result.score >= 0.7 ? 'success' : result.score >= 0.5 ? 'warning' : 'error'}
                  sx={{ ml: 2 }}
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" color="primary" gutterBottom>
                  Your Answer:
                </Typography>
                <Typography variant="body1" sx={{ pl: 2, borderLeft: '3px solid #eee' }}>
                  {result.answer}
                </Typography>
              </Box>

              <LinearProgress 
                variant="determinate" 
                value={result.score * 100} 
                sx={{ mb: 2, height: 8, borderRadius: 4 }}
              />

              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Box flex={1}>
                  <Typography variant="h6" color="success.main" gutterBottom>
                    Strengths:
                  </Typography>
                  {result.strengths.map((strength, idx) => (
                    <Typography key={idx} variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      • {strength}
                    </Typography>
                  ))}
                </Box>
                <Box flex={1}>
                  <Typography variant="h6" color="error.main" gutterBottom>
                    Areas for Improvement:
                  </Typography>
                  {result.weaknesses.map((weakness, idx) => (
                    <Typography key={idx} variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      • {weakness}
                    </Typography>
                  ))}
                </Box>
              </Box>

              <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 2 }}>
                <Typography variant="h6" color="primary" gutterBottom>
                  Suggestion for Improvement:
                </Typography>
                <Typography variant="body2">
                  {result.suggestion}
                </Typography>
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}
      </DialogContent>
    </Dialog>
  );
};

export default InterviewResults; 