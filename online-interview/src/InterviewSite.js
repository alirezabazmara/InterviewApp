import React, { useState } from "react";
import { Button, Card, CardContent, Typography, Container, Box, TextField } from "@mui/material";

const InterviewSite = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [questions, setQuestions] = useState([]);

  const uploadResume = async () => {
    if (!selectedFile) {
      alert("Please select a file.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", selectedFile);

    const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

    const response = await fetch(`${API_BASE_URL}/upload-resume`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    if (data.success) {
      alert("Resume processed successfully!");
      
      const questionsResponse = await fetch(`${API_BASE_URL}/generate-questions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: data.text }),
      });

      const questionsData = await questionsResponse.json();
      if (questionsData.success) {
        setQuestions(questionsData.questions);
      } else {
        alert("Error generating questions.");
      }
    } else {
      alert("Error processing resume.");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ textAlign: "center", mt: 5 }}>
      <Typography variant="h3" gutterBottom>Online Interview</Typography>
      <Typography variant="subtitle1" color="textSecondary">Let's have an interview!</Typography>
      
      <Card sx={{ mt: 3, p: 2 }}>
        <CardContent>
          <Typography variant="h6">Upload Your Resume</Typography>
          <input
            type="file"
            onChange={(e) => setSelectedFile(e.target.files[0])}
            style={{ marginTop: 10 }}
          />
          <Box mt={2}>
            <Button variant="contained" color="primary" onClick={uploadResume}>
              Upload
            </Button>
          </Box>
        </CardContent>
      </Card>
      
      {questions.length > 0 && (
        <Card sx={{ mt: 3, p: 2 }}>
          <CardContent>
            <Typography variant="h6">Interview Questions</Typography>
            <ul>
              {questions.map((question, index) => (
                <li key={index}>
                  <Typography>{question}</Typography>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default InterviewSite;
