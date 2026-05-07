-- Achievements System
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  category TEXT DEFAULT 'individual', -- individual, group
  requirement_type TEXT, -- points, streak, workouts
  requirement_value INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements ON DELETE CASCADE,
  group_id UUID REFERENCES groups ON DELETE CASCADE, -- Optional, for group achievements
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id, group_id)
);

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Achievements are viewable by all" ON achievements FOR SELECT USING (true);
CREATE POLICY "Users can view their own achievements" ON user_achievements FOR SELECT USING (auth.uid() = user_id);

-- Seed some achievements
INSERT INTO achievements (title, description, icon_url, category, requirement_type, requirement_value) VALUES
('Primeiro Passo', 'Conclua seu primeiro treino.', '/icons/badge_first_step.png', 'individual', 'workouts', 1),
('Guerreiro de Elite', 'Atinja 100 pontos totais.', '/icons/badge_elite.png', 'individual', 'points', 100),
('Fogo Eterno', 'Mantenha um streak de 7 dias.', '/icons/badge_streak_7.png', 'individual', 'streak', 7),
('Campeão da Unidade', 'Fique em 1º lugar no ranking do grupo.', '/icons/badge_group_first.png', 'group', 'rank', 1);
