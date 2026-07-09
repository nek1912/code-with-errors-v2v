const express = require('express');
const supabase = require('../utils/supabase');

const router = express.Router();

// POST /api/admin/category
router.post('/category', async (req, res) => {
  try {
    const { title, description, icon, color } = req.body;
    const { data, error } = await supabase.from('learning_categories').insert({ title, description, icon, color }).select().single();
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/lesson
router.post('/lesson', async (req, res) => {
  try {
    const { categoryId, title, description, content, thumbnail, duration, difficulty } = req.body;
    const { data, error } = await supabase.from('lessons').insert({
      category_id: categoryId, title, description, content, thumbnail, duration, difficulty
    }).select().single();
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/quiz
router.post('/quiz', async (req, res) => {
  try {
    const { lessonId, title, passingMarks } = req.body;
    const { data, error } = await supabase.from('quizzes').insert({
      lesson_id: lessonId, title, passing_marks: passingMarks || 70
    }).select().single();
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/question
router.post('/question', async (req, res) => {
  try {
    const { quizId, question, optionA, optionB, optionC, optionD, correctOption } = req.body;
    const { data, error } = await supabase.from('quiz_questions').insert({
      quiz_id: quizId,
      question,
      option_a: optionA,
      option_b: optionB,
      option_c: optionC,
      option_d: optionD,
      correct_option: correctOption
    }).select().single();
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
