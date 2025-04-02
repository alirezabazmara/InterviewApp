import { Divider } from "@mui/material";
import React from "react";
import { Container, Box, Typography, Button, Grid, Card, CardContent } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Business, Assignment, Assessment } from "@mui/icons-material";

const CompanyPage = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md" sx={{ textAlign: "center", mt: 5 }}>
      {/* Header Section */}
      <Box>
        <Typography variant="h3" gutterBottom sx={{ fontWeight: "bold", color: "#2c3e50" }}>
          For Companies
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" gutterBottom>
          Streamline your hiring process with AI-powered interviews.
        </Typography>
        <Divider sx={{ my: 3, bgcolor: "#d1d1d1", height: 2, opacity: 0.6 }} />
      </Box>

      {/* Features Section */}
      <Grid container spacing={4} sx={{ mt: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", p: 2 }}>
            <Business sx={{ fontSize: 60, color: "#3f51b5" }} />
            <Typography variant="h6" sx={{ mt: 2, fontWeight: "bold" }}>
              Manage Interviews
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Schedule and manage interviews with ease.
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", p: 2 }}>
            <Assignment sx={{ fontSize: 60, color: "#f44336" }} />
            <Typography variant="h6" sx={{ mt: 2, fontWeight: "bold" }}>
              Evaluate Candidates
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Review candidate responses and provide feedback.
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", p: 2 }}>
            <Assessment sx={{ fontSize: 60, color: "#4caf50" }} />
            <Typography variant="h6" sx={{ mt: 2, fontWeight: "bold" }}>
              Generate Reports
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Get detailed reports on candidate performance.
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Call to Action Section */}
      <Box sx={{ mt: 6 }}>
        <Typography variant="h5" sx={{ fontWeight: "bold", color: "#2c3e50" }}>
          Ready to Streamline Your Hiring?
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" sx={{ mt: 1 }}>
          Sign up and start managing interviews today!
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          sx={{ mt: 3, px: 5, py: 1.5, fontSize: "1.1rem" }}
          onClick={() => navigate("/company")}
        >
          Get Started
        </Button>
      </Box>
    </Container>
  );
};

export default CompanyPage;