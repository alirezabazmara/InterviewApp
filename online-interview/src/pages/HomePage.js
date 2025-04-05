import React, { useState, useEffect } from "react";
import { Container, Box, Typography, Button, Grid, Card, CardContent, useTheme } from "@mui/material";
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
      icon: <DescriptionIcon sx={{ fontSize: { xs: 40, md: 60 } }} />,
      title: "Resume Analysis",
      description: "Our AI analyzes your resume to understand your experience, skills, and expertise.",
      color: "#3f51b5",
      gradient: "linear-gradient(135deg, #3f51b5 0%, #5c6bc0 100%)"
    },
    {
      icon: <Mic sx={{ fontSize: { xs: 40, md: 60 } }} />,
      title: "Smart Practice",
      description: "Practice with AI-powered questions that adapt to your responses.",
      color: "#f44336",
      gradient: "linear-gradient(135deg, #f44336 0%, #ef5350 100%)"
    },
    {
      icon: <LightbulbIcon sx={{ fontSize: { xs: 40, md: 60 } }} />,
      title: "Expert Guidance",
      description: "Receive personalized tips and strategies to improve your interview performance.",
      color: "#4caf50",
      gradient: "linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)"
    }
  ];

  return (
    <Box sx={{ 
      minHeight: "100vh",
      background: "#ffffff",
      py: { xs: 2, md: 4 },
      position: "relative",
      overflow: "hidden",
      "&::before": {
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "radial-gradient(circle at 50% 50%, rgba(63, 81, 181, 0.05) 0%, transparent 50%)",
        pointerEvents: "none"
      }
    }}>
      <Container maxWidth="lg" sx={{ height: "100%" }}>
        <Box sx={{ 
          display: "flex", 
          flexDirection: "column",
          height: "100%",
          justifyContent: "space-between"
        }}>
          {/* Header Section */}
          <Box sx={{ 
            textAlign: "center", 
            mb: { xs: 3, md: 4 },
            position: "relative",
            "&::after": {
              content: '""',
              position: "absolute",
              bottom: -10,
              left: "50%",
              transform: "translateX(-50%)",
              width: "100px",
              height: "4px",
              background: "linear-gradient(90deg, transparent, #3f51b5, transparent)",
              borderRadius: "2px"
            }
          }}>
            <Typography 
              variant="h2" 
              gutterBottom 
              sx={{ 
                fontSize: { xs: "2rem", md: "3.75rem" },
                fontWeight: 800,
                background: "linear-gradient(45deg, #3f51b5 30%, #5c6bc0 90%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                mb: 1,
                opacity: mounted ? 1 : 0,
                transform: mounted ? "translateY(0)" : "translateY(20px)",
                transition: "all 1s cubic-bezier(0.4, 0, 0.2, 1)"
              }}
            >
              AI-Powered Interview Platform
            </Typography>
          </Box>

          {/* Features Section */}
          <Grid container spacing={3} sx={{ mb: { xs: 3, md: 4 } }}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card 
                  sx={{ 
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    p: { xs: 2, md: 3 },
                    transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                    transform: hovered === index ? "rotateY(10deg) translateY(-10px)" : "none",
                    boxShadow: hovered === index ? "0 20px 40px rgba(0,0,0,0.1)" : "0 10px 20px rgba(0,0,0,0.05)",
                    background: "rgba(255, 255, 255, 0.9)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(63, 81, 181, 0.1)",
                    position: "relative",
                    overflow: "hidden",
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? "translateY(0)" : `translateY(20px)`,
                    transition: `all 0.8s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.2}s`,
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: feature.gradient,
                      opacity: hovered === index ? 0.05 : 0,
                      transition: "opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                      zIndex: 0
                    },
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: "4px",
                      background: feature.gradient,
                      opacity: hovered === index ? 1 : 0,
                      transition: "opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
                    }
                  }}
                  onMouseEnter={() => setHovered(index)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <Box sx={{ 
                    position: "relative",
                    zIndex: 1,
                    mb: 2,
                    transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                    transform: hovered === index ? "scale(1.1) rotate(5deg)" : "scale(1)",
                    color: feature.color
                  }}>
                    {feature.icon}
                  </Box>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      fontSize: { xs: "1.25rem", md: "1.5rem" },
                      fontWeight: 700,
                      mb: 1,
                      textAlign: "center",
                      position: "relative",
                      zIndex: 1,
                      background: feature.gradient,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent"
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography 
                    variant="body1" 
                    color="textSecondary" 
                    sx={{ 
                      fontSize: { xs: "0.875rem", md: "1rem" },
                      textAlign: "center",
                      lineHeight: 1.4,
                      position: "relative",
                      zIndex: 1,
                      opacity: hovered === index ? 1 : 0,
                      transform: hovered === index ? "translateY(0)" : "translateY(20px)",
                      transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                      height: hovered === index ? "auto" : "0",
                      overflow: "hidden"
                    }}
                  >
                    {feature.description}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Call to Action Section */}
          <Box 
            sx={{ 
              textAlign: "center",
              background: "rgba(255, 255, 255, 0.9)",
              backdropFilter: "blur(10px)",
              borderRadius: "20px",
              p: { xs: 2, md: 4 },
              boxShadow: "0 20px 40px rgba(0,0,0,0.05)",
              border: "1px solid rgba(63, 81, 181, 0.1)",
              position: "relative",
              overflow: "hidden",
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateY(0)" : "translateY(20px)",
              transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.6s",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "linear-gradient(45deg, rgba(63, 81, 181, 0.05) 0%, rgba(33, 150, 243, 0.05) 100%)",
                opacity: 0,
                transition: "opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                zIndex: 0
              },
              "&:hover::before": {
                opacity: 1
              }
            }}
          >
            <Typography 
              variant="h4" 
              sx={{ 
                fontSize: { xs: "1.5rem", md: "2.125rem" },
                fontWeight: 700,
                mb: 1,
                position: "relative",
                zIndex: 1,
                background: "linear-gradient(45deg, #3f51b5 30%, #5c6bc0 90%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}
            >
              Ready to Start?
            </Typography>
            <Typography 
              variant="h6" 
              color="textSecondary" 
              sx={{ 
                fontSize: { xs: "1rem", md: "1.25rem" },
                mb: 3,
                position: "relative",
                zIndex: 1
              }}
            >
              Upload your resume and start practicing today!
            </Typography>
            <Box 
              display="flex" 
              justifyContent="center" 
              alignItems="center" 
              sx={{ 
                gap: { xs: 2, md: 3 },
                flexDirection: { xs: "column", md: "row" },
                flexWrap: "wrap",
                position: "relative",
                zIndex: 1
              }}
            >
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowForward />}
                startIcon={<AutoAwesome />}
                sx={{ 
                  width: { xs: "100%", md: "auto" },
                  px: { xs: 3, md: 6 }, 
                  py: 1.5,
                  fontSize: { xs: "1rem", md: "1.1rem" },
                  borderRadius: "50px",
                  background: "linear-gradient(45deg, #3f51b5 30%, #5c6bc0 90%)",
                  boxShadow: "0 3px 5px 2px rgba(63, 81, 181, .3)",
                  transition: "all 0.3s ease-in-out",
                  "&:hover": {
                    background: "linear-gradient(45deg, #5c6bc0 30%, #3f51b5 90%)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 5px 15px rgba(63, 81, 181, .4)"
                  }
                }}
                onClick={() => navigate("/applicant")}
              >
                For Applicants
              </Button>
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowForward />}
                startIcon={<AutoAwesome />}
                sx={{ 
                  width: { xs: "100%", md: "auto" },
                  px: { xs: 3, md: 6 }, 
                  py: 1.5,
                  fontSize: { xs: "1rem", md: "1.1rem" },
                  borderRadius: "50px",
                  background: "linear-gradient(45deg, #f44336 30%, #ef5350 90%)",
                  boxShadow: "0 3px 5px 2px rgba(244, 67, 54, .3)",
                  transition: "all 0.3s ease-in-out",
                  "&:hover": {
                    background: "linear-gradient(45deg, #ef5350 30%, #f44336 90%)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 5px 15px rgba(244, 67, 54, .4)"
                  }
                }}
                onClick={() => navigate("/company")}
              >
                For Companies
              </Button>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default HomePage;