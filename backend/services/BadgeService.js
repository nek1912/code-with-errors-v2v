const supabase = require('../utils/supabase');

class BadgeService {
  static async checkAndAwardBadges(userId) {
    // 1. Count completed lessons
    const { count: completedCount, error: countError } = await supabase
      .from('user_progress')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'COMPLETED');

    if (countError) throw countError;

    // 2. Check highest quiz score
    const { data: bestQuiz, error: quizError } = await supabase
      .from('user_quiz_results')
      .select('score')
      .eq('user_id', userId)
      .order('score', { ascending: false })
      .limit(1);

    if (quizError) throw quizError;
    const highestScore = bestQuiz && bestQuiz.length > 0 ? bestQuiz[0].score : 0;

    // 3. Fetch all available badges
    const { data: allBadges, error: badgesError } = await supabase
      .from('badges')
      .select('*');

    if (badgesError) throw badgesError;

    // 4. Evaluate rules
    const earnedBadgeIds = [];

    for (const badge of allBadges) {
      let earned = false;
      if (badge.rule_type === 'LESSONS_COMPLETED' && completedCount >= badge.required_points) {
        earned = true;
      } else if (badge.rule_type === 'QUIZ_SCORE' && highestScore >= badge.required_points) {
        earned = true;
      }

      if (earned) {
        earnedBadgeIds.push(badge.id);
      }
    }

    if (earnedBadgeIds.length > 0) {
      // Upsert badges to user_badges (ignoring errors on conflict)
      const insertData = earnedBadgeIds.map(id => ({
        user_id: userId,
        badge_id: id
      }));

      // In Supabase, upsert based on unique constraint (user_id, badge_id)
      const { error: insertError } = await supabase
        .from('user_badges')
        .upsert(insertData, { onConflict: 'user_id, badge_id' });
        
      if (insertError) console.error('Error awarding badges:', insertError);
    }
    
    return { success: true, earnedCount: earnedBadgeIds.length };
  }
}

module.exports = BadgeService;
