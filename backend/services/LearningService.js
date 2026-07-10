const supabase = require('../utils/supabase');

class LearningService {
  static async getCategories() {
    const { data, error } = await supabase
      .from('learning_categories')
      .select('*')
      .order('created_at', { ascending: true });
      
    if (error) throw error;
    return data;
  }

  static async getLessons(categoryId = null) {
    let query = supabase.from('lessons').select('*, learning_categories(title, color, icon)');
    
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }
    
    const { data, error } = await query.order('created_at', { ascending: true });
    
    if (error) throw error;
    return data;
  }

  static async getLessonById(id) {
    const { data, error } = await supabase
      .from('lessons')
      .select('*, learning_categories(title, color, icon)')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    return data;
  }

  static async updateProgress(userId, lessonId, progress) {
    let status = 'IN_PROGRESS';
    let completedAt = null;

    if (progress >= 100) {
      progress = 100;
      status = 'COMPLETED';
      completedAt = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('user_progress')
      .upsert({
        user_id: userId,
        lesson_id: lessonId,
        progress: progress,
        status: status,
        ...(completedAt && { completed_at: completedAt })
      }, { onConflict: 'user_id, lesson_id' })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

module.exports = LearningService;
