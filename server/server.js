require("dotenv").config();
const express = require("express");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { OpenAI } = require("openai");
const { spawn } = require("child_process");

const app = express(); 
const corsOptions = {
  origin: [
    'https://interview-app-tan.vercel.app',
    'https://interview-app-83467631s-projects.vercel.app',
    'http://localhost:5000' 
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());


app.get("/", (req, res) => {
  res.send("🎉 Backend is running and ready!");
});


const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const RESPONSE_FILE = "responses.json";

// ایجاد `response.json` در صورت عدم وجود
if (!fs.existsSync(RESPONSE_FILE)) {
  fs.writeFileSync(RESPONSE_FILE, JSON.stringify([]));
}

const upload = multer({ dest: "uploads/" });

// اضافه کردن یک Map برای ذخیره سوالات قبلی
const previousQuestions = new Map();

// تنظیمات جدید برای multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // ایجاد یک دایرکتوری موقت
    const tempDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }
    cb(null, tempDir);
  },
  filename: function (req, file, cb) {
    // استفاده از timestamp برای نام فایل
    cb(null, `temp_${Date.now()}.webm`);
  }
});

const audioUpload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "audio/webm" || file.mimetype === "audio/webm;codecs=opus") {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only webm audio is allowed."), false);
    }
  }
});

// ✅ **آپلود رزومه و استخراج متن**
app.post("/upload-resume", upload.single("resume"), async (req, res) => {
  console.log("✅ Received Resume Upload Request");

  if (!req.file) {
    console.error("❌ No file uploaded.");
    return res.status(400).json({ success: false, message: "No file uploaded." });
  }

  try {
    const pdfData = await pdfParse(fs.readFileSync(req.file.path));
    console.log("✅ Processing Resume...");

    // استخراج ویژگی‌های رزومه با GPT
    const featuresResponse = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: `Extract key features from the resume and return them in the following JSON format:
          {
            "skills": ["skill1", "skill2", ...],
            "experience": [
              {
                "title": "job title",
                "duration": "duration",
                "technologies": ["tech1", "tech2", ...]
              }
            ],
            "education": ["education1", "education2", ...],
            "certifications": ["cert1", "cert2", ...]
          }`
        },
        {
          role: "user",
          content: pdfData.text
        }
      ],
      response_format: { type: "json_object" }
    });

    const features = JSON.parse(featuresResponse.choices[0].message.content);
    console.log("✅ Extracted Features:", features);

    return res.json({ 
      success: true, 
      text: pdfData.text,
      features: features
    });
  } catch (error) {
    console.error("❌ Error processing PDF:", error);
    return res.status(500).json({ success: false, message: "Error processing PDF" });
  }
});

// ✅ **تولید سوالات بر اساس متن رزومه**
app.post("/generate-questions", async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ success: false, message: "No resume text provided." });
  }

  try {
    console.log("✅ Generating questions based on resume...");

    const questionsResponse = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: "Generate 5 specific and technical interview questions based on the following resume text. Questions should start from the easiest." },
        { role: "user", content: text },
      ],
      max_tokens: 200,
    });

    console.log("🔹 OpenAI Raw Response:", questionsResponse);

    const questions = questionsResponse.choices[0].message.content
      .split("\n")
      .map(q => q.replace(/^\d+\.\s*/, "").trim())
      .filter(q => q.length > 0 && q.includes("?"));

    if (!questions || questions.length === 0) {
      console.error("❌ No questions generated.");
      return res.status(500).json({ success: false, message: "No questions generated." });
    }

    console.log("✅ Generated Questions:", questions);
    return res.json({ success: true, questions });
  } catch (error) {
    console.error("❌ Error generating questions:", error);
    return res.status(500).json({ success: false, message: "Error generating questions" });
  }
});

// ✅ **ذخیره فایل صوتی و تبدیل به متن**
app.post("/save-audio", audioUpload.single("audio"), async (req, res) => {
  if (!req.file) {
    console.error("❌ No audio file uploaded");
    return res.status(400).json({ success: false, message: "No audio file uploaded." });
  }

  try {
    console.log("✅ Processing audio file:", req.file.path);
    
    // تبدیل صدا به متن
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(req.file.path),
      model: "whisper-1",
      language: "en",
    });

    console.log("✅ Transcription completed:", transcription.text);

    // حذف فایل موقت بعد از تبدیل
    fs.unlink(req.file.path, (err) => {
      if (err) {
        console.error("❌ Error deleting temp file:", err);
      } else {
        console.log("✅ Temp file deleted successfully");
      }
    });

    if (!transcription.text) {
      console.error("❌ No text extracted from audio");
      return res.status(400).json({ 
        success: false, 
        message: "No text could be extracted from the audio" 
      });
    }

    try {
      // تحلیل پاسخ با OpenAI
      const analysisPrompt = `
      Question: "${req.body.question}"
      Answer: "${transcription.text}"

      Analyze the answer based on the following criteria:
      1. Relevance to the question
      2. Technical accuracy
      3. Depth of knowledge
      4. Practical experience demonstration
      5. Communication clarity

      Return the analysis in this exact JSON format:
      {
        "score": <number between 0 and 1>,
        "explanation": "<detailed explanation>",
        "strengths": ["<point 1>", "<point 2>", ...],
        "weaknesses": ["<point 1>", "<point 2>", ...],
        "suggestion": "<suggestion for improvement>"
      }`;

      console.log("✅ Sending analysis request to OpenAI");
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: [
          {
            role: "system",
            content: "You are an expert technical interviewer. Analyze interview answers objectively and provide detailed feedback."
          },
          {
            role: "user",
            content: analysisPrompt
          }
        ],
        response_format: { type: "json_object" }
      });

      console.log("✅ Received analysis from OpenAI");
      
      const analysis = JSON.parse(completion.choices[0].message.content);

      // تصمیم‌گیری بر اساس امتیاز
      let decision;
      if (analysis.score >= 0.9) {
        decision = "Next question from resume";
      } else if (analysis.score >= 0.7) {
        decision = "Answer was good but could be more detailed";
      } else if (analysis.score >= 0.5) {
        decision = "Ask a simpler question in the same topic";
      } else {
        decision = "Change topic after two consecutive weak answers";
      }

      // ذخیره در responses.json
      let responses = [];
      if (fs.existsSync(RESPONSE_FILE)) {
        responses = JSON.parse(fs.readFileSync(RESPONSE_FILE));
      }

      const responseData = {
        question: {
          text: req.body.question,
          category: 'basic'
        },
        answer: transcription.text,
        score: analysis.score,
        explanation: analysis.explanation,
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses,
        suggestion: analysis.suggestion,
        decision,
        timestamp: new Date().toISOString()
      };

      responses.push(responseData);
      fs.writeFileSync(RESPONSE_FILE, JSON.stringify(responses, null, 2));

      console.log("✅ Response saved successfully");

      res.json({ 
        success: true, 
        text: transcription.text,
        analysis: responseData
      });

    } catch (analysisError) {
      console.error("❌ Error analyzing response:", analysisError);
      res.status(500).json({ 
        success: false, 
        message: "Error analyzing response",
        text: transcription.text 
      });
    }

  } catch (error) {
    console.error("❌ Error processing audio:", error);
    // حذف فایل موقت در صورت خطا
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, () => {});
    }
    res.status(500).json({ 
      success: false, 
      message: "Error processing audio",
      error: error.message 
    });
  }
});

// تابع کمکی برای تبدیل متن به صدا
async function generateSpeech(text) {
  try {
    const mp3 = await openai.audio.speech.create({
      model: "tts-1", // یا "tts-1-hd" برای کیفیت بالاتر
      voice: "alloy", // می‌تونه "echo", "fable", "onyx", "nova", یا "shimmer" هم باشه
      input: text,
    });

    // تبدیل response به Buffer
    const buffer = Buffer.from(await mp3.arrayBuffer());
    
    // ذخیره فایل صوتی با نام یونیک
    const fileName = `speech_${Date.now()}.mp3`;
    const filePath = path.join(__dirname, 'public', 'audio', fileName);
    
    // اطمینان از وجود دایرکتوری
    if (!fs.existsSync(path.join(__dirname, 'public', 'audio'))) {
      fs.mkdirSync(path.join(__dirname, 'public', 'audio'), { recursive: true });
    }
    
    fs.writeFileSync(filePath, buffer);
    
    return `/audio/${fileName}`; // مسیر نسبی برای دسترسی از طریق URL
  } catch (error) {
    console.error('❌ Error generating speech:', error);
    throw error;
  }
}

// اضافه کردن middleware برای سرو فایل‌های استاتیک
app.use('/audio', express.static(path.join(__dirname, 'public', 'audio')));

// مطمئن شوید که دایرکتوری audio وجود دارد
const audioDir = path.join(__dirname, 'public', 'audio');
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}

// تغییر endpoint تولید سوالات برای اضافه کردن صدا
app.post('/generate-basic-questions', async (req, res) => {
  try {
    const { topic } = req.body;
    
    if (!topic) {
      return res.status(400).json({
        success: false,
        message: "Topic field is required"
      });
    }

    // دریافت سوالات قبلی برای این topic
    const existingQuestions = previousQuestions.get(topic) || [];

    const prompt = `Generate 10 simple and basic interview questions about ${topic}.
    Requirements:
    - Questions should be very basic and straightforward
    - Focus on fundamental concepts
    - Make questions short and easy to understand
    - No complex scenarios or advanced topics
    - Avoid any questions similar to these previous questions: ${JSON.stringify(existingQuestions)}
    - Each question should be unique and different from others
    - Questions should cover different aspects of the topic
    
    Return the response in this exact format:
    {
      "questions": [
        {
          "text": "Question text here",
          "difficulty": "basic",
          "category": "basic"
        }
      ]
    }`;

    const completion = await openai.chat.completions.create({
      messages: [{ 
        role: "system", 
        content: "You are an interviewer. Generate unique and simple questions that are easy to understand and answer. Avoid repetition." 
      }, { 
        role: "user", 
        content: prompt 
      }],
      model: "gpt-4-turbo",
      max_tokens: 1000,
    });

    const response = JSON.parse(completion.choices[0].message.content);
    
    if (!response.questions || response.questions.length === 0) {
      throw new Error("No questions generated");
    }

    // فیلتر کردن سوالات تکراری
    const uniqueQuestions = filterDuplicateQuestions(response.questions, existingQuestions);

    // اگر تعداد سوالات منحصر به فرد کمتر از 10 بود، سوالات جدید تولید کن
    if (uniqueQuestions.length < 10) {
      const additionalQuestions = await generateAdditionalQuestions(
        topic,
        uniqueQuestions,
        existingQuestions
      );
      uniqueQuestions.push(...additionalQuestions);
    }

    // ذخیره سوالات جدید در حافظه
    const updatedQuestions = [...existingQuestions, ...uniqueQuestions];
    previousQuestions.set(topic, updatedQuestions);

    console.log(`✅ Generated ${uniqueQuestions.length} unique basic questions for topic: ${topic}`);

    // اضافه کردن صدا برای هر سوال
    const questionsWithAudio = await Promise.all(
      uniqueQuestions.slice(0, 10).map(async (question) => {
        try {
          const audioPath = await generateSpeech(question.text);
          return {
            ...question,
            audioUrl: audioPath
          };
        } catch (error) {
          console.error(`❌ Error generating audio for question: ${question.text}`, error);
          return question;
        }
      })
    );

    res.json({
      success: true,
      questions: questionsWithAudio,
      topic: topic
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate questions'
    });
  }
});

// تابع کمکی برای فیلتر کردن سوالات تکراری
function filterDuplicateQuestions(newQuestions, existingQuestions) {
  const uniqueQuestions = [];
  const seenTexts = new Set(existingQuestions.map(q => q.text.toLowerCase()));

  for (const question of newQuestions) {
    const normalizedText = question.text.toLowerCase();
    if (!seenTexts.has(normalizedText)) {
      uniqueQuestions.push(question);
      seenTexts.add(normalizedText);
    }
  }

  return uniqueQuestions;
}

// تابع کمکی برای تولید سوالات اضافی
async function generateAdditionalQuestions(topic, currentQuestions, existingQuestions) {
  const neededCount = 10 - currentQuestions.length;
  
  const prompt = `Generate ${neededCount} more unique and simple interview questions about ${topic}.
  Requirements:
  - Questions must be completely different from these existing questions: ${JSON.stringify([...currentQuestions, ...existingQuestions])}
  - Keep questions basic and straightforward
  - Focus on different aspects of the topic
  
  Return the response in this exact format:
  {
    "questions": [
      {
        "text": "Question text here",
        "difficulty": "basic",
        "category": "basic"
      }
    ]
  }`;

  const completion = await openai.chat.completions.create({
    messages: [{ 
      role: "system", 
      content: "Generate additional unique questions, avoiding any repetition with existing questions." 
    }, { 
      role: "user", 
      content: prompt 
    }],
    model: "gpt-4-turbo",
    max_tokens: 500,
  });

  const response = JSON.parse(completion.choices[0].message.content);
  return filterDuplicateQuestions(response.questions, [...currentQuestions, ...existingQuestions]);
}

// endpoint جداگانه برای تبدیل متن به صدا
app.post('/text-to-speech', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({
        success: false,
        message: "Text is required"
      });
    }

    const audioPath = await generateSpeech(text);

    res.json({
      success: true,
      audioUrl: audioPath
    });
  } catch (error) {
    console.error('❌ Error generating speech:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate speech'
    });
  }
});

// endpoint برای دریافت نتایج
app.get('/get-results', (req, res) => {
  try {
    if (fs.existsSync(RESPONSE_FILE)) {
      const results = JSON.parse(fs.readFileSync(RESPONSE_FILE));
      res.json({
        success: true,
        results
      });
    } else {
      res.json({
        success: false,
        message: 'No results found'
      });
    }
  } catch (error) {
    console.error('Error reading results:', error);
    res.status(500).json({
      success: false,
      message: 'Error reading results'
    });
  }
});

// اضافه کردن endpoint جدید برای پاک کردن responses
app.post('/clear-responses', (req, res) => {
  try {
    // پاک کردن محتوای فایل با آرایه خالی
    fs.writeFileSync(RESPONSE_FILE, JSON.stringify([]));
    
    console.log("✅ Responses cleared successfully");
    res.json({ 
      success: true, 
      message: "Responses cleared" 
    });
  } catch (error) {
    console.error("❌ Error clearing responses:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error clearing responses" 
    });
  }
});

// endpoint برای بررسی وضعیت responses
app.get('/check-responses', (req, res) => {
  try {
    const responses = JSON.parse(fs.readFileSync(RESPONSE_FILE));
    res.json({
      success: true,
      count: responses.length,
      lastResponse: responses[responses.length - 1] || null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error reading responses",
      error: error.message
    });
  }
});

app.post("/generate-resume-questions", async (req, res) => {
  const { features, topic } = req.body;

  if (!features || !topic) {
    return res.status(400).json({ 
      success: false, 
      message: "Features and topic are required" 
    });
  }

  try {
    // ساخت متن رزومه از ویژگی‌ها
    const resumeText = `
      Skills: ${features.skills.join(', ')}
      Experience: ${features.experience.map(exp => 
        `${exp.title} (${exp.duration}): ${exp.technologies.join(', ')}`
      ).join('\n')}
    `;

    const prompt = `Based on the following resume features and topic, generate exactly 7 technical interview questions. 
    The questions should be specific to the candidate's skills mentioned in the resume.
    Format each question as a JSON object with 'text' and 'type' fields.
    Each questions should be concise
    The type should be 'technical'.

    Resume features:
    ${resumeText}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert technical interviewer. Generate exactly 7 specific, relevant interview questions based on the candidate's resume skills. Return the questions as a JSON array."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    // تبدیل پاسخ به آرایه JSON
    const questions = completion.choices[0].message.content
      .split('\n')
      .filter(q => q.trim().length > 0 && q.includes('?'))
      .map(q => ({
        text: q.replace(/^\d+\.\s*/, '').trim().replace(/^"text":\s*"/, '').replace(/"$/, ''), 
        type: 'technical',
        category: 'resume-based'
      }));

    // اضافه کردن صدا برای هر سوال
    const questionsWithAudio = await Promise.all(
      questions.map(async (question) => {
        try {
          const audioPath = await generateSpeech(question.text);
          return {
            ...question,
            audioUrl: audioPath
          };
        } catch (error) {
          console.error(`Error generating audio for question: ${question.text}`, error);
          return question;
        }
      })
    );

    res.json({ 
      success: true, 
      questions: questionsWithAudio 
    });
  } catch (error) {
    console.error("Error generating resume questions:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error generating resume questions" 
    });
  }
});

// اضافه کردن endpoint جدید برای محاسبه امتیاز رزومه
app.post("/calculate-resume-score", async (req, res) => {
  const { features, topic } = req.body;

  if (!features || !topic) {
    return res.status(400).json({ 
      success: false, 
      message: "Features and topic are required" 
    });
  }

  try {
    // محاسبه امتیاز بر اساس فرمول
    let totalScore = 0;
    let scoreBreakdown = {
      experience: 0,
      skills: 0,
      projects: 0,
      complexity: 0
    };

    // تابع کمکی برای محاسبه سال‌های تجربه
    const calculateExperienceYears = (experience) => {
      let totalYears = 0;
      
      // فیلتر کردن تجربه‌های مرتبط با topic
      const relevantExperience = experience.filter(exp => {
        const titleLower = exp.title.toLowerCase();
        const technologiesLower = exp.technologies.map(tech => tech.toLowerCase());
        const topicLower = topic.toLowerCase();

        // بررسی عنوان شغل
        if (titleLower.includes(topicLower) || topicLower.includes(titleLower)) {
          return true;
        }

        // بررسی تکنولوژی‌ها
        const hasRelevantTech = technologiesLower.some(tech => 
          tech.includes(topicLower) || topicLower.includes(tech)
        );

        // بررسی ارتباط در عنوان شغل
        const titleWords = titleLower.split(/\s+/);
        const hasRelevantTitleWord = titleWords.some(word => 
          topicLower.includes(word) || word.includes(topicLower)
        );

        return hasRelevantTech || hasRelevantTitleWord;
      });

      // محاسبه مجموع سال‌های تجربه مرتبط
      relevantExperience.forEach(exp => {
        const dates = exp.duration.split(/[–-]/).map(d => d.trim());
        if (dates.length === 2) {
          // استخراج سال از تاریخ
          const startYear = parseInt(dates[0].split(/[/.]/)[1]);
          let endYear;
          
          if (dates[1].toLowerCase() === 'current') {
            endYear = new Date().getFullYear();
          } else {
            endYear = parseInt(dates[1].split(/[/.]/)[1]);
          }

          // محاسبه سال‌ها
          if (!isNaN(startYear) && !isNaN(endYear)) {
            const years = endYear - startYear;
            // اگر در همان سال شروع و پایان داشته، نیم سال حساب می‌کنیم
            if (years === 0) {
              totalYears += 0.5;
            } else {
              totalYears += years;
            }
          }
        }
      });
      
      return Math.round(totalYears);
    };

    // محاسبه امتیاز تجربه (35 امتیاز)
    const experienceYears = calculateExperienceYears(features.experience);
    console.log("Calculated relevant experience years:", experienceYears);

    // فرمول امتیازدهی تجربه
    if (experienceYears >= 15) {
      scoreBreakdown.experience = 35;
    } else if (experienceYears >= 10) {
      scoreBreakdown.experience = 28;
    } else if (experienceYears >= 8) {
      scoreBreakdown.experience = 20;
    } else if (experienceYears >= 5) {
      scoreBreakdown.experience = 16;
    } else if (experienceYears >= 3) {
      scoreBreakdown.experience = 8;
    } else {
      scoreBreakdown.experience = 3;
    }

    // تابع کمکی برای بررسی ارتباط مهارت با topic
    const isSkillRelevant = (skill) => {
      const skillLower = skill.toLowerCase();
      const topicLower = topic.toLowerCase();
      
      // بررسی ارتباط مستقیم
      if (skillLower.includes(topicLower) || topicLower.includes(skillLower)) {
        return true;
      }

      // بررسی کلمات مشابه
      const skillWords = skillLower.split(/\s+/);
      const topicWords = topicLower.split(/\s+/);
      
      // بررسی ارتباط کلمات
      const hasRelevantWord = skillWords.some(word => 
        topicWords.some(topicWord => 
          word.includes(topicWord) || topicWord.includes(word)
        )
      );

      // بررسی ارتباط در عبارات چند کلمه‌ای
      const hasRelevantPhrase = skillLower.split(/[()]/).some(phrase => 
        phrase.trim().toLowerCase().includes(topicLower) || 
        topicLower.includes(phrase.trim().toLowerCase())
      );

      return hasRelevantWord || hasRelevantPhrase;
    };

    // محاسبه امتیاز مهارت‌ها (30 امتیاز)
    const relevantSkills = features.skills.filter(isSkillRelevant);
    console.log("Relevant skills:", relevantSkills);
    scoreBreakdown.skills = Math.min(relevantSkills.length * 6, 30);

    // تابع کمکی برای بررسی ارتباط پروژه با topic
    const isProjectRelevant = (exp) => {
      const titleLower = exp.title.toLowerCase();
      const technologiesLower = exp.technologies.map(tech => tech.toLowerCase());
      const topicLower = topic.toLowerCase();

      // بررسی عنوان شغل
      if (titleLower.includes(topicLower) || topicLower.includes(titleLower)) {
        return true;
      }

      // بررسی تکنولوژی‌ها
      const hasRelevantTech = technologiesLower.some(tech => 
        tech.includes(topicLower) || topicLower.includes(tech)
      );

      // بررسی ارتباط در عنوان شغل
      const titleWords = titleLower.split(/\s+/);
      const hasRelevantTitleWord = titleWords.some(word => 
        topicLower.includes(word) || word.includes(topicLower)
      );

      return hasRelevantTech || hasRelevantTitleWord;
    };

    // محاسبه امتیاز پروژه‌ها (25 امتیاز)
    const relevantProjects = features.experience.filter(isProjectRelevant);
    console.log("Relevant projects:", relevantProjects);
    scoreBreakdown.projects = Math.min(relevantProjects.length * 5, 25);

    // محاسبه امتیاز پیچیدگی پروژه‌ها (10 امتیاز)
    const complexProjects = features.experience.filter(exp => {
      const titleLower = exp.title.toLowerCase();
      
      // بررسی عنوان‌های مدیریتی و ارشد
      const isManagementTitle = 
        titleLower.includes('senior') || 
        titleLower.includes('lead') ||
        titleLower.includes('architect') ||
        titleLower.includes('manager') ||
        titleLower.includes('supervisor') ||
        titleLower.includes('director') ||
        titleLower.includes('head') ||
        titleLower.includes('chief');

      // بررسی تعداد تکنولوژی‌ها
      const hasManyTechnologies = exp.technologies.length >= 5;

      // بررسی پیچیدگی بر اساس تعداد مهارت‌های مرتبط
      const relevantSkillsCount = exp.technologies.filter(tech => 
        features.skills.some(skill => 
          skill.toLowerCase().includes(tech.toLowerCase()) || 
          tech.toLowerCase().includes(skill.toLowerCase())
        )
      ).length;

      const hasComplexSkills = relevantSkillsCount >= 3;

      return isManagementTitle || hasManyTechnologies || hasComplexSkills;
    });

    console.log("Complex projects:", complexProjects);
    scoreBreakdown.complexity = Math.min(complexProjects.length * 4, 10);

    // محاسبه امتیاز نهایی
    totalScore = Object.values(scoreBreakdown).reduce((a, b) => a + b, 0);

    // تعیین سطح
    let level;
    if (totalScore >= 71) {
      level = "Senior";
    } else if (totalScore >= 41) {
      level = "Mid-level";
    } else {
      level = "Junior";
    }

    res.json({
      success: true,
      score: totalScore,
      level,
      details: {
        experienceYears,
        relevantSkills,
        relevantProjects: relevantProjects.length,
        complexProjects: complexProjects.length
      }
    });

  } catch (error) {
    console.error("Error calculating resume score:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error calculating resume score" 
    });
  }
});

// پاکسازی فایل‌های موقت در هنگام راه‌اندازی سرور
const cleanupTempFiles = () => {
  const tempDir = path.join(__dirname, 'temp');
  if (fs.existsSync(tempDir)) {
    fs.readdir(tempDir, (err, files) => {
      if (err) return;
      for (const file of files) {
        fs.unlink(path.join(tempDir, file), err => {
          if (err) console.error("Error deleting temp file:", err);
        });
      }
    });
  }
};

// اجرای پاکسازی در شروع سرور
cleanupTempFiles();

// پاکسازی دوره‌ای هر 5 دقیقه
setInterval(cleanupTempFiles, 5 * 60 * 1000);

// ✅ **اجرای سرور**
const PORT = process.env.PORT || 5000;
console.log('🟡 process.env.PORT:', process.env.PORT);
console.log('🟢 Final PORT used by server:', PORT);
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}...`));
