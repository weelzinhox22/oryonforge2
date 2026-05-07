-- funny and diverse achievements
INSERT INTO achievements (title, description, icon_url, category, requirement_type, requirement_value) VALUES
('Madrugador Nato', 'Postou um treino antes das 05:00 da manhã.', '/icons/early_bird.png', 'individual', 'time_early', 1),
('Morcego da Academia', 'Postou um treino após as 23:00.', '/icons/night_owl.png', 'individual', 'time_late', 1),
('O Exterminador de Pizza', 'Queimou as calorias de ontem com um treino intenso.', '/icons/pizza_killer.png', 'individual', 'points', 20),
('Inimigo da Gravidade', 'Completou 10 treinos de calistenia ou peso corporal.', '/icons/gravity.png', 'individual', 'workouts', 10),
('GPS Quebrado', 'Registrou uma atividade de mais de 2 horas.', '/icons/gps.png', 'individual', 'duration', 120),
('Fiscal de Shape', 'Viu o feed do grupo 50 vezes.', '/icons/spy.png', 'group', 'views', 50),
('O Intrometido', 'Curtiu 10 fotos no feed da comunidade.', '/icons/like.png', 'group', 'interactions', 10),
('Fugitivo do Sofá', 'Manteve 3 dias de streak pela primeira vez.', '/icons/sofa.png', 'individual', 'streak', 3),
('Papagaio de Pirata', 'Apareceu em 3 fotos de outras pessoas (indiretamente).', '/icons/pirate.png', 'group', 'photos_indirect', 3);
