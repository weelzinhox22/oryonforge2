-- Add more seed achievements for variety
INSERT INTO achievements (title, description, icon_url, category, requirement_type, requirement_value) VALUES
('Veterano da Unidade', 'Participe de um grupo por mais de 30 dias.', '/icons/badge_veteran.png', 'group', 'days', 30),
('Líder de Esquadrão', 'Chegue ao Top 3 no ranking do grupo.', '/icons/badge_top3.png', 'group', 'rank', 3),
('Consistência Coletiva', 'Poste 5 fotos de treino no feed do grupo.', '/icons/badge_photos.png', 'group', 'photos', 5),
('Força Tarefa', 'Atinja 50 pontos neste grupo específico.', '/icons/badge_group_50.png', 'group', 'points', 50);
