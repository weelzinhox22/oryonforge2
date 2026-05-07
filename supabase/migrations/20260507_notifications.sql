-- Notification System
-- This script adds a notifications table and triggers to alert users of key events.

-- 1. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL, -- 'achievement', 'kudo', 'comment', 'rank_drop', 'rank_up'
    title TEXT NOT NULL,
    content TEXT,
    link TEXT, -- Optional URL to navigate to
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" ON notifications
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
FOR UPDATE USING (auth.uid() = user_id);

-- 3. Trigger for Achievements
CREATE OR REPLACE FUNCTION notify_on_achievement()
RETURNS TRIGGER AS $$
DECLARE
    ach_title TEXT;
BEGIN
    SELECT title INTO ach_title FROM achievements WHERE id = NEW.achievement_id;
    
    INSERT INTO notifications (user_id, type, title, content, link)
    VALUES (
        NEW.user_id, 
        'achievement', 
        '🏆 Conquista Desbloqueada!', 
        'Você desbloqueou: ' || ach_title,
        '/perfil/conquistas'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_notify_achievement
AFTER INSERT ON user_achievements
FOR EACH ROW EXECUTE FUNCTION notify_on_achievement();

-- 4. Trigger for Kudos (Likes)
CREATE OR REPLACE FUNCTION notify_on_kudo()
RETURNS TRIGGER AS $$
DECLARE
    liker_name TEXT;
    target_user_id UUID;
BEGIN
    SELECT username INTO liker_name FROM profiles WHERE id = NEW.user_id;
    SELECT user_id INTO target_user_id FROM activity_logs WHERE id = NEW.activity_log_id;
    
    -- Don't notify if liking own activity
    IF target_user_id != NEW.user_id THEN
        INSERT INTO notifications (user_id, type, title, content, link)
        VALUES (
            target_user_id, 
            'kudo', 
            '🧡 Kudos Recebido!', 
            liker_name || ' deu Kudos no seu treino.',
            '/dashboard' -- Could link to the specific activity if we have a detail page
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_notify_kudo
AFTER INSERT ON activity_likes
FOR EACH ROW EXECUTE FUNCTION notify_on_kudo();

-- 5. Trigger for Comments
CREATE OR REPLACE FUNCTION notify_on_comment()
RETURNS TRIGGER AS $$
DECLARE
    commenter_name TEXT;
    target_user_id UUID;
BEGIN
    SELECT username INTO commenter_name FROM profiles WHERE id = NEW.user_id;
    SELECT user_id INTO target_user_id FROM activity_logs WHERE id = NEW.activity_log_id;
    
    IF target_user_id != NEW.user_id THEN
        INSERT INTO notifications (user_id, type, title, content, link)
        VALUES (
            target_user_id, 
            'comment', 
            '💬 Novo Comentário!', 
            commenter_name || ' comentou no seu treino.',
            '/dashboard'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_notify_comment
AFTER INSERT ON activity_comments
FOR EACH ROW EXECUTE FUNCTION notify_on_comment();

-- 6. Trigger for Ranking Changes (Competitive Notification)
CREATE OR REPLACE FUNCTION notify_on_rank_change()
RETURNS TRIGGER AS $$
DECLARE
    old_leader_id UUID;
    new_leader_id UUID;
BEGIN
    -- This logic is slightly complex to run on every insert, but for small groups it's fine.
    -- We check if the leader of the group changed after this activity.
    
    -- 1. Find the leader BEFORE this points update (simplified: use current ranking but exclude NEW points? No, better to just check if NEW user became #1)
    WITH ranking AS (
        SELECT user_id, SUM(points) as total
        FROM activity_logs
        WHERE group_id = NEW.group_id
        GROUP BY user_id
        ORDER BY total DESC
        LIMIT 2
    )
    SELECT user_id INTO new_leader_id FROM ranking OFFSET 0 LIMIT 1;
    
    -- If the new leader is the person who just logged an activity, 
    -- and they weren't the leader before (this is hard to know without state).
    -- Simplified: If NEW user is now #1, notify them. 
    -- And if there was someone else at #1 before, notify that person they were surpassed.
    
    -- For now, let's just implement a simple version: 
    -- Notify the user if they reach #1.
    IF new_leader_id = NEW.user_id THEN
        -- Check if we already notified them recently or if it's a "takeover"
        -- In a production app, we'd store "current_leader" in the groups table.
        -- Let's do that in a future step if needed. 
        -- For now, generic notification:
        INSERT INTO notifications (user_id, type, title, content, link)
        VALUES (
            NEW.user_id, 
            'rank_up', 
            '👑 Liderança Assumida!', 
            'Você atingiu o 1º lugar no ranking do grupo!',
            '/dashboard/' || NEW.group_id
        )
        ON CONFLICT DO NOTHING; -- Need to avoid spamming
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Real-time Publication (for Supabase Realtime)
-- This allows the frontend to listen for new notifications.
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
