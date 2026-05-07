-- Hardening Achievements RLS
DROP POLICY IF EXISTS "Achievements are viewable by all" ON achievements;
CREATE POLICY "Achievements are viewable by all" ON achievements FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can view their own achievements" ON user_achievements;
CREATE POLICY "Users can view their own achievements" ON user_achievements FOR SELECT TO authenticated USING (auth.uid() = user_id);
