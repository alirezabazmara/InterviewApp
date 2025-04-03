import React, { useState, useEffect, useCallback, useRef } from "react";
import { Container, Box, Button, Typography, Card, CardContent, Paper, TextField, IconButton } from "@mui/material";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ListAltIcon from '@mui/icons-material/ListAlt';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import QuestionWithAudio from '../components/QuestionWithAudio';
import InterviewResults from '../components/InterviewResults';
import ResumeFeatures from '../components/ResumeFeatures';
import LoadingButton from '@mui/lab/LoadingButton';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CircularProgress from '@mui/material/CircularProgress';
import ResumeScore from '../components/ResumeScore';

const API_BASE_URL = import.meta?.env?.VITE_API_URL || "http://localhost:5000";
const ApplicantPage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [interviewTopic, setInterviewTopic] = useState("");
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioURL, setAudioURL] = useState(null);
  const [isBasicQuestionsCompleted, setIsBasicQuestionsCompleted] = useState(false);
  const [audio, setAudio] = useState(null);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [playedQuestions, setPlayedQuestions] = useState(new Set());
  const [showResults, setShowResults] = useState(false);
  const [interviewResults, setInterviewResults] = useState([]);
  const [audioChunks, setAudioChunks] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [interviewPhase, setInterviewPhase] = useState('topic');
  const [resumeText, setResumeText] = useState('');
  const [resumeFeatures, setResumeFeatures] = useState(null);
  const [resumeQuestions, setResumeQuestions] = useState([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionMessage, setTransitionMessage] = useState('');
  const fileInputRef = useRef(null);
  const [isQuestionPlaying, setIsQuestionPlaying] = useState(false);
  const [resumeScore, setResumeScore] = useState(null);

  const speakQuestion = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 1;
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Sorry, your browser doesn't support speech synthesis.");
    }
  };

  const sendAudioToServer = async (audioBlob) => {
    const formData = new FormData();
    formData.append("audio", audioBlob, `response_${Date.now()}.webm`);
    formData.append("question", questions[currentQuestionIndex]?.text || '');

    try {
      const response = await fetch(`${API_BASE_URL}/save-audio`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      if (!data.success) {
        console.error("❌ Error saving audio:", data.message);
      } else {
        console.log("✅ Audio saved successfully:", data.filePath);
        // تحلیل پاسخ از data.analysis دریافت می‌شود
        if (data.analysis) {
          console.log("✅ Analysis result:", data.analysis);
          // ذخیره نتایج تحلیل در state
          setInterviewResults(prev => [...prev, data.analysis]);
        }
      }
    } catch (error) {
      console.error("❌ Error uploading audio:", error);
    }
  };

  // تابع برای پاک کردن پاسخ‌های قبلی
  const clearPreviousResponses = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/clear-responses`, {
        method: "POST",
      });
      const data = await response.json();
      if (!data.success) {
        console.error("Failed to clear previous responses");
      }
    } catch (error) {
      console.error("Error clearing responses:", error);
    }
  };

  const uploadResume = async () => {
    if (!selectedFile || !interviewTopic.trim()) {
      alert("Please select a file and enter an interview topic.");
      return;
    }

    setIsUploading(true);
    try {
      await clearPreviousResponses();

      // آپلود و پردازش رزومه
      const formData = new FormData();
      formData.append("resume", selectedFile);

	  const resumeResponse = await fetch(`${API_BASE_URL}/upload-resume`, {
	    method: "POST",
	    body: formData,
	  });


      const resumeData = await resumeResponse.json();
      if (!resumeData.success) {
        throw new Error("Failed to process resume");
      }

      // ذخیره متن رزومه و ویژگی‌ها
      console.log("📝 Received Resume Features:", resumeData.features);
      setResumeText(resumeData.text);
      setResumeFeatures(resumeData.features);

      // محاسبه امتیاز رزومه
      const scoreResponse = await fetch(`${API_BASE_URL}/calculate-resume-score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
      	features: resumeData.features,
      	topic: interviewTopic,
        }),
      });
      
      const scoreData = await scoreResponse.json();
      if (scoreData.success) {
        setResumeScore(scoreData);
      }

      // دریافت سوالات topic
	  const basicQuestionsResponse = await fetch(`${API_BASE_URL}/generate-basic-questions`, {
	    method: "POST",
	    headers: { "Content-Type": "application/json" },
	    body: JSON.stringify({ topic: interviewTopic }),
	  });

      const basicData = await basicQuestionsResponse.json();
      if (!basicData.success) {
        throw new Error("Failed to generate topic questions");
      }

      setQuestions(basicData.questions);
      setCurrentQuestionIndex(0);
      setIsInterviewStarted(true);
      setInterviewPhase('topic');

    } catch (error) {
      console.error("Error uploading resume:", error);
      alert("An error occurred while preparing the interview.");
    } finally {
      setIsUploading(false);
    }
  };

  const startResumePhase = async () => {
    try {
	  const response = await fetch(`${API_BASE_URL}/generate-resume-questions`, {
	    method: "POST",
	    headers: { "Content-Type": "application/json" },
	    body: JSON.stringify({
	  	features: resumeFeatures,
	  	topic: interviewTopic,
	    }),
	  });

      const data = await response.json();
      if (data.success) {
        setResumeQuestions(data.questions);
        setQuestions(data.questions);
        setCurrentQuestionIndex(0);
        setInterviewPhase('resume');
      }
    } catch (error) {
      console.error("Error generating resume questions:", error);
    }
  };

  const handleAnswerSubmit = async (answer) => {
    // ... existing answer submission logic ...

    // After basic questions are completed, process resume
    if (currentQuestionIndex === questions.length - 1 && !isBasicQuestionsCompleted) {
      setIsBasicQuestionsCompleted(true);
      
      // Now process the resume and get resume-based questions
      const formData = new FormData();
      formData.append("resume", selectedFile);
      formData.append("topic", interviewTopic);

      try {
		const response = await fetch(`${API_BASE_URL}/upload-resume`, {
		  method: "POST",
		  body: formData,
		});

        const data = await response.json();
        if (data.success) {
		  const resumeQuestionsResponse = await fetch(`${API_BASE_URL}/generate-questions`, {
		    method: "POST",
		    headers: {
		  	"Content-Type": "application/json",
		    },
		    body: JSON.stringify({
		  	features: resumeFeatures,
		  	topic: interviewTopic,
		    }),
		  });

          const questionData = await resumeQuestionsResponse.json();
          if (questionData.success) {
            setQuestions(questionData.questions);
            setCurrentQuestionIndex(0);
          }
        }
      } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while processing resume.");
      }
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
          sampleRate: 44100,
          latency: 0,
          googEchoCancellation: true,
          googAutoGainControl: true,
          googNoiseSuppression: true,
          googHighpassFilter: true
        } 
      });
      
      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 128000
      });
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setAudioChunks(chunks => [...chunks, event.data]);
        }
      };

      recorder.start(1000); // جمع‌آوری داده‌ها در هر ثانیه
      setMediaRecorder(recorder);
      setIsRecording(true);
      console.log("✅ Recording started with enhanced settings");
    } catch (error) {
      console.error("❌ Error starting recording:", error);
    }
  };

  const stopRecording = async () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      
      // ذخیره آخرین chunks
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          const allChunks = [...audioChunks, event.data];
          const audioBlob = new Blob(allChunks, { type: 'audio/webm;codecs=opus' });
          sendAudioToServer(audioBlob);
          setAudioChunks([]); // پاک کردن chunks
        }
      };

      // توقف و پاک کردن stream
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
  };

  const playQuestionAudio = useCallback(async (question) => {
    try {
      if (playedQuestions.has(currentQuestionIndex)) {
        return;
      }

      if (isAudioLoading || !question?.audioUrl) return;
      
      // توقف ضبط صدا قبل از پخش
      if (isRecording) {
        await stopRecording();
      }

      // توقف پخش صداهای قبلی
      if (audio) {
        await audio.pause();
        audio.currentTime = 0;
      }

      setIsAudioLoading(true);
      setIsQuestionPlaying(true);

      const newAudio = new Audio(`${API_BASE_URL}${question.audioUrl}`);
      
      // تنظیمات صدا برای کاهش اکو
      newAudio.volume = 0.8;
      
      newAudio.onended = () => {
        setIsQuestionPlaying(false);
        // افزایش تاخیر قبل از شروع ضبط
        setTimeout(() => {
          startRecording();
        }, 1000);
      };

      await new Promise((resolve) => {
        newAudio.addEventListener('canplaythrough', resolve, { once: true });
        newAudio.addEventListener('error', resolve, { once: true });
      });

      setAudio(newAudio);
      await newAudio.play();
      
      setPlayedQuestions(prev => new Set(prev).add(currentQuestionIndex));

    } catch (error) {
      console.log("Audio error:", error);
      setIsQuestionPlaying(false);
    } finally {
      setIsAudioLoading(false);
    }
  }, [audio, isAudioLoading, currentQuestionIndex, playedQuestions, startRecording, isRecording, stopRecording]);

  useEffect(() => {
    if (isInterviewStarted && questions.length > 0 && questions[currentQuestionIndex]) {
      playQuestionAudio(questions[currentQuestionIndex]);
    }
  }, [isInterviewStarted, questions, currentQuestionIndex, playQuestionAudio]);

  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, [audio]);

  const handleNextQuestion = async () => {
    await stopRecording();  // منتظر می‌مانیم تا ضبط صدا تمام شود
    
    if (audio) {
      try {
        await audio.pause();
        audio.currentTime = 0;
      } catch (error) {
        console.log("Error pausing audio:", error);
      }
    }
    
    // منتظر می‌مانیم تا پاسخ ذخیره شود
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setAudioURL(null);
    } else if (interviewPhase === 'topic') {
      await transitionToResumePhase();
    }
  };

  useEffect(() => {
    if (questions.length > 0) {
      setPlayedQuestions(new Set());
      setCurrentQuestionIndex(0);
    }
  }, [questions]);

	const fetchResults = async () => {
	  try {
		const response = await fetch(`${API_BASE_URL}/get-results`);
		const data = await response.json();
		if (data.success) {
		  setInterviewResults(data.results);
		  setShowResults(true);
		}
	  } catch (error) {
		console.error("Error fetching results:", error);
	  }
	};

  // Custom file input handler
  const handleFileSelect = () => {
    fileInputRef.current.click();
  };

  // همچنین می‌تونیم در دکمه "Start New Interview" هم این تابع رو صدا بزنیم
  const handleStartNewInterview = async () => {
    if (window.confirm('Are you sure you want to restart the interview? All progress will be lost.')) {
      await clearPreviousResponses();
      setIsInterviewStarted(false);
      setQuestions([]);
      setCurrentQuestionIndex(0);
      setSelectedFile(null);
      setInterviewTopic('');
      setInterviewResults([]); // پاک کردن نتایج قبلی از state
    }
  };

  // تابع جدید برای انتقال به فاز رزومه
  const transitionToResumePhase = async () => {
    try {
      setIsTransitioning(true);
      const transitionMsg = "Now, let's move on and ask a few questions about your resume and work experience.";
      setTransitionMessage(transitionMsg);

      const response = await fetch(`${API_BASE_URL}/generate-resume-questions`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({ 
          features: resumeFeatures,
          topic: interviewTopic
        }),
      });

      const data = await response.json();
      console.log("📝 Server Response:", data);

      if (!data.success) {
        throw new Error(data.message || "Failed to generate resume questions");
      }

      // پخش پیام صوتی انتقال
      try {
		const transitionAudio = await fetch(`${API_BASE_URL}/text-to-speech`, {
		  method: "POST",
		  headers: { "Content-Type": "application/json" },
		  body: JSON.stringify({ text: transitionMsg }),
		});

        const audioData = await transitionAudio.json();
        
        if (audioData.success) {
          const audio = new Audio(`${API_BASE_URL}${audioData.audioUrl}`);
          
          await new Promise((resolve) => {
            audio.onended = resolve;
            audio.onerror = resolve;
            audio.play().catch(resolve);
          });
        }
      } catch (error) {
        console.error("Audio playback error:", error);
        // ادامه اجرا حتی در صورت خطای صدا
		//تست
      }

      // تنظیم سوالات جدید
      setQuestions(data.questions);
      setCurrentQuestionIndex(0);
      setInterviewPhase('resume');

    } catch (error) {
      console.error("Error in transitionToResumePhase:", error);
      alert(error.message || "Error transitioning to resume questions. Please try again.");
    } finally {
      setIsTransitioning(false);
      setTransitionMessage('');
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 5 }}>
      <Box sx={{ display: 'flex', gap: 3 }}>
        {/* Left panel for ResumeFeatures and ResumeScore */}
        <Box sx={{ 
          width: '320px', 
          flexShrink: 0,
          display: { xs: 'none', md: 'block' } // Hide on mobile, show on desktop
        }}>
          <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
            {resumeScore && <ResumeScore {...resumeScore} />}
            <ResumeFeatures features={resumeFeatures} />
          </Paper>
        </Box>

        {/* Main content */}
        <Box sx={{ flex: 1 }}>
          <Paper elevation={3} sx={{ padding: 4, borderRadius: 3 }}>
            <Typography variant="h3" gutterBottom sx={{ fontWeight: "bold", color: "#2c3e50" }}>
              Practice Your Interview
            </Typography>
        
            {!isInterviewStarted ? (
              <>
                <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                  Upload your resume and get AI-generated interview questions.
                </Typography>

                <Card sx={{ mt: 3, p: 3, borderRadius: 2, border: "2px solid #d1d1d1" }}>
                  <CardContent>
                    <Box sx={{ mb: 3 }}>
                      <TextField
                        fullWidth
                        label="Interview Topic"
                        placeholder="e.g., System Design, Frontend Development, DevOps"
                        value={interviewTopic}
                        onChange={(e) => setInterviewTopic(e.target.value)}
                        disabled={isUploading}
                        sx={{ mb: 2 }}
                      />

                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={(e) => setSelectedFile(e.target.files[0])}
                        style={{ display: 'none' }}
                        accept=".pdf,.doc,.docx"
                        disabled={isUploading}
                      />
                      
                      <Button
                        variant="outlined"
                        onClick={handleFileSelect}
                        startIcon={<CloudUploadIcon />}
                        fullWidth
                        disabled={isUploading}
                        sx={{
                          py: 1.5,
                          border: '1px dashed',
                          '&:hover': {
                            border: '1px dashed',
                            bgcolor: 'rgba(0,0,0,0.04)'
                          }
                        }}
                      >
                        {selectedFile ? selectedFile.name : 'Upload Resume'}
                      </Button>
                      
                      {selectedFile && (
                        <Typography variant="caption" color="primary" sx={{ mt: 1, display: 'block' }}>
                          ✓ Resume selected
                        </Typography>
                      )}
                    </Box>

                    <Box mt={2}>
                      <LoadingButton
                        variant="contained"
                        color="primary"
                        onClick={uploadResume}
                        loading={isUploading}
                        loadingPosition="start"
                        startIcon={<PlayArrowIcon />}
                        disabled={!interviewTopic.trim() || !selectedFile || isUploading}
                        fullWidth
                        sx={{
                          py: 1.5,
                          bgcolor: 'primary.main',
                          '&:hover': {
                            bgcolor: 'primary.dark',
                          },
                          '&.Mui-disabled': {
                            bgcolor: 'rgba(0,0,0,0.12)',
                          }
                        }}
                      >
                        {isUploading ? 'Preparing Interview...' : 'Start Interview'}
                      </LoadingButton>
                    </Box>

                    {isUploading && (
                      <Box sx={{ 
                        mt: 3, 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        gap: 2 
                      }}>
                        <CircularProgress size={40} />
                        <Typography variant="body2" color="textSecondary">
                          Please wait while we analyze your resume and prepare your questions...
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              <Box sx={{ mt: 3 }}>
                {questions.length > 0 && (
                  <Box mt={4}>
                    {isTransitioning ? (
                      <Box sx={{ 
                        my: 4, 
                        p: 3, 
                        bgcolor: 'primary.light', 
                        borderRadius: 2,
                        color: 'white',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 2
                      }}>
                        <Typography variant="h6">
                          {transitionMessage}
                        </Typography>
                        <CircularProgress color="inherit" size={24} />
                      </Box>
                    ) : questions.length > 0 ? (
                      <>
                        <Typography 
                          variant="subtitle1" 
                          color="primary" 
                          sx={{ mb: 2 }}
                        >
                          {interviewPhase === 'topic' 
                            ? `Topic-based Questions: ${interviewTopic}`
                            : 'Resume-based Technical Questions'}
                        </Typography>

                        <Typography variant="h6" gutterBottom>
                          Question {currentQuestionIndex + 1} of {questions.length}
                        </Typography>
                        
                        <Box position="relative" minHeight="60px" mb={2}>
                          <Typography variant="body1">
                            {questions[currentQuestionIndex]?.text}
                          </Typography>
                          {isAudioLoading && (
                            <Typography 
                              variant="caption" 
                              color="textSecondary"
                              sx={{
                                position: 'absolute',
                                bottom: -20,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                fontSize: '0.75rem'
                              }}
                            >
                              Loading audio...
                            </Typography>
                          )}
                          {isRecording && (
                            <Typography 
                              variant="caption" 
                              color="error"
                              sx={{
                                position: 'absolute',
                                bottom: -20,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                fontSize: '0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                              }}
                            >
                              <span style={{ 
                                display: 'inline-block', 
                                width: 8, 
                                height: 8, 
                                backgroundColor: 'red', 
                                borderRadius: '50%',
                                animation: 'pulse 1s infinite'
                              }} />
                              Recording your answer...
                            </Typography>
                          )}
                        </Box>

                        <Box mt={3}>
                          {currentQuestionIndex < questions.length - 1 || interviewPhase === 'topic' ? (
                            <Button 
                              variant="contained" 
                              color="primary" 
                              onClick={handleNextQuestion}
                              disabled={isQuestionPlaying || isAudioLoading}
                            >
                              Next Question
                            </Button>
                          ) : (
                            <Button 
                              variant="contained" 
                              color="success"
                              onClick={async () => {
                                await stopRecording();
                                fetchResults();
                              }}
                              disabled={isQuestionPlaying || isAudioLoading}
                            >
                              Finish Interview
                            </Button>
                          )}
                        </Box>
                      </>
                    ) : (
                      <Typography>Loading questions...</Typography>
                    )}
                  </Box>
                )}
              </Box>
            )}

            {isInterviewStarted && !showResults && (
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleStartNewInterview}
                sx={{ mt: 2 }}
              >
                Start New Interview
              </Button>
            )}
          </Paper>

          <InterviewResults 
            open={showResults}
            onClose={() => setShowResults(false)}
            results={interviewResults}
          />
        </Box>
      </Box>
    </Container>
  );
};

export default ApplicantPage;
