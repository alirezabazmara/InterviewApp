import React, { useState, useEffect } from "react";
import { Container, Box, Typography, Button, Grid, Card, CardContent, CardActions, useTheme } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { 
  Description as DescriptionIcon, 
  Mic, 
  Lightbulb as LightbulbIcon,
  ArrowForward,
  AutoAwesome
} from "@mui/icons-material";

const HomePage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [hovered, setHovered] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const features = [
    {
      icon: <DescriptionIcon sx={{ fontSize: 60 }} />,
      title: "Resume Analysis",
      description: "Our AI analyzes your resume to understand your experience, skills, and expertise.",
      color: "#3f51b5",
      gradient: "linear-gradient(135deg, #3f51b5 0%, #5c6bc0 100%)"
    },
    {
      icon: <Mic sx={{ fontSize: 60 }} />,
      title: "Smart Practice",
      description: "Practice with AI-powered questions that adapt to your responses.",
      color: "#f44336",
      gradient: "linear-gradient(135deg, #f44336 0%, #ef5350 100%)"
    },
    {
      icon: <LightbulbIcon sx={{ fontSize: 60 }} />,
      title: "Expert Guidance",
      description: "Receive personalized tips and strategies to improve your interview performance.",
      color: "#4caf50",
      gradient: "linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)"
    }
  ];

  return (
    <Container maxWidth="xl" sx={{ mt: 5 }}>
      <Box sx={{ textAlign: "center", mb: 6 }}>
        <Typography
          variant="h3"
          sx={{
            fontSize: { xs: "2rem", md: "3rem" },
            fontWeight: "bold",
            color: "#2c3e50",
            mb: 2,
          }}
        >
          Welcome to Interview Practice
        </Typography>
        <Typography
          variant="h6"
          sx={{
            fontSize: { xs: "1rem", md: "1.25rem" },
            color: "#7f8c8d",
            maxWidth: "800px",
            mx: "auto",
          }}
        >
          Practice your interview skills with AI-powered questions and get instant
          feedback on your answers.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              minHeight: { xs: "auto", md: 300 },
              height: "100%",
              display: "flex",
              flexDirection: "column",
              p: { xs: 1.5, md: 3 },
              borderRadius: 2,
              boxShadow: 3,
              transition: "transform 0.3s ease-in-out",
              "&:hover": {
                transform: "translateY(-5px)",
              },
            }}
          >
            <CardContent sx={{ flexGrow: 1 }}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Box
                  sx={{
                    width: { xs: 80, md: 100 },
                    height: { xs: 80, md: 100 },
                    borderRadius: "50%",
                    bgcolor: "primary.light",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 2,
                  }}
                >
                  <DescriptionIcon sx={{ fontSize: { xs: 40, md: 60 } }} />
                </Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontSize: { xs: "1.25rem", md: "1.5rem" },
                    fontWeight: "bold",
                    textAlign: "center",
                    mb: 1,
                  }}
                >
                  Upload Resume
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: { xs: "0.875rem", md: "1rem" },
                    color: "text.secondary",
                    textAlign: "center",
                  }}
                >
                  Upload your resume to get personalized interview questions based
                  on your experience.
                </Typography>
              </Box>
            </CardContent>
            <CardActions sx={{ justifyContent: "center", p: 2 }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                sx={{
                  width: { xs: "100%", md: "auto" },
                  py: 1,
                  px: 3,
                }}
                onClick={() => navigate("/applicant")}
              >
                Start Interview
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card
            sx={{
              minHeight: { xs: "auto", md: 300 },
              height: "100%",
              display: "flex",
              flexDirection: "column",
              p: { xs: 1.5, md: 3 },
              borderRadius: 2,
              boxShadow: 3,
              transition: "transform 0.3s ease-in-out",
              "&:hover": {
                transform: "translateY(-5px)",
              },
            }}
          >
            <CardContent sx={{ flexGrow: 1 }}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Box
                  sx={{
                    width: { xs: 80, md: 100 },
                    height: { xs: 80, md: 100 },
                    borderRadius: "50%",
                    bgcolor: "secondary.light",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 2,
                  }}
                >
                  <Mic sx={{ fontSize: { xs: 40, md: 60 } }} />
                </Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontSize: { xs: "1.25rem", md: "1.5rem" },
                    fontWeight: "bold",
                    textAlign: "center",
                    mb: 1,
                  }}
                >
                  Practice Speaking
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: { xs: "0.875rem", md: "1rem" },
                    color: "text.secondary",
                    textAlign: "center",
                  }}
                >
                  Record your answers and get instant feedback on your speaking
                  skills and content.
                </Typography>
              </Box>
            </CardContent>
            <CardActions sx={{ justifyContent: "center", p: 2 }}>
              <Button
                variant="contained"
                color="secondary"
                size="large"
                sx={{
                  width: { xs: "100%", md: "auto" },
                  py: 1,
                  px: 3,
                }}
                onClick={() => navigate("/applicant")}
              >
                Start Practice
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card
            sx={{
              minHeight: { xs: "auto", md: 300 },
              height: "100%",
              display: "flex",
              flexDirection: "column",
              p: { xs: 1.5, md: 3 },
              borderRadius: 2,
              boxShadow: 3,
              transition: "transform 0.3s ease-in-out",
              "&:hover": {
                transform: "translateY(-5px)",
              },
            }}
          >
            <CardContent sx={{ flexGrow: 1 }}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Box
                  sx={{
                    width: { xs: 80, md: 100 },
                    height: { xs: 80, md: 100 },
                    borderRadius: "50%",
                    bgcolor: "success.light",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 2,
                  }}
                >
                  <LightbulbIcon sx={{ fontSize: { xs: 40, md: 60 } }} />
                </Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontSize: { xs: "1.25rem", md: "1.5rem" },
                    fontWeight: "bold",
                    textAlign: "center",
                    mb: 1,
                  }}
                >
                  Get Feedback
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: { xs: "0.875rem", md: "1rem" },
                    color: "text.secondary",
                    textAlign: "center",
                  }}
                >
                  Receive detailed feedback on your answers and improve your
                  interview skills.
                </Typography>
              </Box>
            </CardContent>
            <CardActions sx={{ justifyContent: "center", p: 2 }}>
              <Button
                variant="contained"
                color="success"
                size="large"
                sx={{
                  width: { xs: "100%", md: "auto" },
                  py: 1,
                  px: 3,
                }}
                onClick={() => navigate("/applicant")}
              >
                View Results
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>

      <Box
        sx={{
          mt: 6,
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 2,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Button
          variant="outlined"
          color="primary"
          size="large"
          sx={{
            width: { xs: "100%", md: "auto" },
            py: 1,
            px: 3,
          }}
          onClick={() => navigate("/about")}
        >
          Learn More
        </Button>
        <Button
          variant="contained"
          color="primary"
          size="large"
          sx={{
            width: { xs: "100%", md: "auto" },
            py: 1,
            px: 3,
          }}
          onClick={() => navigate("/contact")}
        >
          Contact Us
        </Button>
      </Box>
    </Container>
  );
};

export default HomePage;