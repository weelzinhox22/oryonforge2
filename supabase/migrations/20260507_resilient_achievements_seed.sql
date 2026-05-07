-- Ensure achievements table exists and has initial data
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM achievements WHERE title = 'Primeiro Passo') THEN
        INSERT INTO achievements (title, description, icon_url, category, requirement_type, requirement_value) VALUES
        ('Primeiro Passo', 'Conclua seu primeiro treino.', '/icons/badge_first_step.png', 'individual', 'workouts', 1);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM achievements WHERE title = 'Guerreiro de Elite') THEN
        INSERT INTO achievements (title, description, icon_url, category, requirement_type, requirement_value) VALUES
        ('Guerreiro de Elite', 'Atinja 100 pontos totais.', '/icons/badge_elite.png', 'individual', 'points', 100);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM achievements WHERE title = 'Fogo Eterno') THEN
        INSERT INTO achievements (title, description, icon_url, category, requirement_type, requirement_value) VALUES
        ('Fogo Eterno', 'Mantenha um streak de 7 dias.', '/icons/badge_streak_7.png', 'individual', 'streak', 7);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM achievements WHERE title = 'Campeão da Unidade') THEN
        INSERT INTO achievements (title, description, icon_url, category, requirement_type, requirement_value) VALUES
        ('Campeão da Unidade', 'Fique em 1º lugar no ranking do grupo.', '/icons/badge_group_first.png', 'group', 'rank', 1);
    END IF;

    -- Additional Group Achievements
    IF NOT EXISTS (SELECT 1 FROM achievements WHERE title = 'Veterano da Unidade') THEN
        INSERT INTO achievements (title, description, icon_url, category, requirement_type, requirement_value) VALUES
        ('Veterano da Unidade', 'Participe de um grupo por mais de 30 dias.', '/icons/badge_veteran.png', 'group', 'days', 30);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM achievements WHERE title = 'Líder de Esquadrão') THEN
        INSERT INTO achievements (title, description, icon_url, category, requirement_type, requirement_value) VALUES
        ('Líder de Esquadrão', 'Chegue ao Top 3 no ranking do grupo.', '/icons/badge_top3.png', 'group', 'rank', 3);
    END IF;
END $$;
