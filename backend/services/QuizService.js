const supabase = require('../utils/supabase');
const LearningService = require('./LearningService');
const BadgeService = require('./BadgeService');
const CertificateService = require('./CertificateService');

class QuizService {
  static async getQuizByLesson(lessonId) {
    // Get the quiz
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select('*')
      .eq('lesson_id', lessonId)
      .single();

    if (quizError || !quiz) return null; // No quiz for this lesson

    // Get the questions
    const { data: questions, error: questionsError } = await supabase
      .from('quiz_questions')
      .select('id, question, option_a, option_b, option_c, option_d') // Intentionally excluding correct_option
      .eq('quiz_id', quiz.id);

    if (questionsError) throw questionsError;

    return {
      ...quiz,
      questions
    };
  }

  static async submitQuiz(userId, quizId, lessonId, answers) {
    // answers is an array of { questionId, selectedOption }

    // 1. Fetch questions with correct answers
    const { data: questions, error: questionsError } = await supabase
      .from('quiz_questions')
      .select('id, correct_option')
      .eq('quiz_id', quizId);

    if (questionsError) throw questionsError;

    // 2. Fetch quiz passing marks
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select('passing_marks')
      .eq('id', quizId)
      .single();

    if (quizError) throw quizError;

    // 3. Calculate score
    let correctCount = 0;
    const totalQuestions = questions.length;

    const correctAnswersMap = {};
    questions.forEach(q => {
      correctAnswersMap[q.id] = q.correct_option;
    });

    answers.forEach(ans => {
      if (correctAnswersMap[ans.questionId] === ans.selectedOption) {
        correctCount++;
      }
    });

    const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const passed = score >= quiz.passing_marks;

    // 4. Save result
    const { error: resultError } = await supabase
      .from('user_quiz_results')
      .insert({
        user_id: userId,
        quiz_id: quizId,
        score: score,
        passed: passed
      });

    if (resultError) throw resultError;

    // 5. Side effects if passed
    let certificateUrl = null;
    if (passed) {
      // Mark lesson as completed
      await LearningService.updateProgress(userId, lessonId, 100);
      
      // Check and award badges
      await BadgeService.checkAndAwardBadges(userId);

      // Generate Certificate
      const certResult = await CertificateService.generateCertificate(userId, lessonId);
      certificateUrl = certResult.url;
    }

    return {
      success: true,
      score,
      passed,
      certificateUrl
    };
  }
}

module.exports = QuizService;
