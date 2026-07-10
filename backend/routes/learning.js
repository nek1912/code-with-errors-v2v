const express = require('express');
const router = express.Router();
const LearningService = require('../services/LearningService');
const QuizService = require('../services/QuizService');
const supabase = require('../utils/supabase');

// GET /api/learning/dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'Missing userId' });

    // 1. Progress Stats
    const { data: progressData, error: progressError } = await supabase
      .from('user_progress')
      .select('progress, status')
      .eq('user_id', userId);

    let totalProgressPercent = 0;
    let completedCount = 0;
    if (progressData && progressData.length > 0) {
      let sum = 0;
      progressData.forEach(p => {
        sum += p.progress || 0;
        if (p.status === 'COMPLETED') completedCount++;
      });
      totalProgressPercent = Math.round(sum / progressData.length);
    }

    // 2. Certificates Count
    const { count: certCount } = await supabase
      .from('certificates')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // 3. Earned Badges
    const { data: earnedBadges } = await supabase
      .from('user_badges')
      .select('badges(id, name, description, icon)')
      .eq('user_id', userId);

    // 4. All Badges (to show locked/unlocked)
    const { data: allBadges } = await supabase
      .from('badges')
      .select('*');

    res.json({
      success: true,
      stats: {
        progress: totalProgressPercent,
        completedLessons: completedCount,
        certificates: certCount || 0
      },
      earnedBadges: earnedBadges ? earnedBadges.map(eb => eb.badges) : [],
      allBadges: allBadges || []
    });

  } catch (error) {
    console.error('Error fetching learning dashboard:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/learning/categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await LearningService.getCategories();
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/learning/lessons
router.get('/lessons', async (req, res) => {
  try {
    const { categoryId } = req.query;
    const lessons = await LearningService.getLessons(categoryId);
    res.json({ success: true, lessons });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/learning/lesson/:id
router.get('/lesson/:id', async (req, res) => {
  try {
    const lesson = await LearningService.getLessonById(req.params.id);
    res.json({ success: true, lesson });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/learning/progress
router.post('/progress', async (req, res) => {
  try {
    const { userId, lessonId, progress } = req.body;
    if (!userId || !lessonId || progress === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await LearningService.updateProgress(userId, lessonId, progress);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/learning/quiz/:lessonId
router.get('/quiz/:lessonId', async (req, res) => {
  try {
    const quiz = await QuizService.getQuizByLesson(req.params.lessonId);
    if (!quiz) {
      return res.status(404).json({ error: 'No quiz found for this lesson' });
    }
    res.json({ success: true, quiz });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/learning/quiz/submit
router.post('/quiz/submit', async (req, res) => {
  try {
    const { userId, quizId, lessonId, answers } = req.body;
    if (!userId || !quizId || !lessonId || !answers) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await QuizService.submitQuiz(userId, quizId, lessonId, answers);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/learning/certificate/:lessonId
router.get('/certificate/:lessonId', async (req, res) => {
  try {
    const { userId } = req.query;
    const { lessonId } = req.params;
    
    if (!userId || !lessonId) {
      return res.status(400).json({ error: 'Missing userId or lessonId' });
    }

    const { data: cert, error } = await supabase
      .from('certificates')
      .select('certificate_url')
      .eq('user_id', userId)
      .eq('lesson_id', lessonId)
      .single();

    if (error || !cert) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    res.json({ success: true, url: cert.certificate_url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
