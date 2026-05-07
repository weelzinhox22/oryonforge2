-- 20260507_notifications_and_broadcast.sql

-- 1. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'like', 'comment', 'ranking_loss', 'broadcast', 'group_invite'
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    link TEXT, -- Link to follow when clicked
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 2. Push Subscriptions Table (for Web Push)
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    subscription_json JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 3. Automatic Triggers for Notifications

-- Function to notify when someone likes an activity
CREATE OR REPLACE FUNCTION notify_activity_like()
RETURNS TRIGGER AS $$
DECLARE
    post_owner_id UUID;
    liker_name TEXT;
BEGIN
    -- Get the owner of the activity
    SELECT user_id INTO post_owner_id FROM activity_logs WHERE id = NEW.activity_log_id;
    
    -- Get the name of the person who liked
    SELECT username INTO liker_name FROM profiles WHERE id = NEW.user_id;

    -- Don't notify if liking own post
    IF post_owner_id != NEW.user_id THEN
        INSERT INTO notifications (user_id, type, title, content, link, metadata)
        VALUES (
            post_owner_id,
            'like',
            'Novo Kudos! 🔥',
            liker_name || ' curtiu seu treino.',
            '/dashboard', -- Could be link to specific feed item
            jsonb_build_object('activity_id', NEW.activity_log_id, 'liker_id', NEW.user_id)
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_activity_like ON activity_likes;
CREATE TRIGGER on_activity_like
AFTER INSERT ON activity_likes
FOR EACH ROW EXECUTE FUNCTION notify_activity_like();

-- Function to notify when someone comments
CREATE OR REPLACE FUNCTION notify_activity_comment()
RETURNS TRIGGER AS $$
DECLARE
    post_owner_id UUID;
    commenter_name TEXT;
BEGIN
    SELECT user_id INTO post_owner_id FROM activity_logs WHERE id = NEW.activity_log_id;
    SELECT username INTO commenter_name FROM profiles WHERE id = NEW.user_id;

    IF post_owner_id != NEW.user_id THEN
        INSERT INTO notifications (user_id, type, title, content, link, metadata)
        VALUES (
            post_owner_id,
            'comment',
            'Novo incentivo! 💬',
            commenter_name || ' comentou no seu treino.',
            '/dashboard',
            jsonb_build_object('activity_id', NEW.activity_log_id, 'comment_id', NEW.id)
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_activity_comment ON activity_comments;
CREATE TRIGGER on_activity_comment
AFTER INSERT ON activity_comments
FOR EACH ROW EXECUTE FUNCTION notify_activity_comment();

-- 4. Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can see their own notifications" ON notifications;
CREATE POLICY "Users can see their own notifications"
ON notifications FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
CREATE POLICY "Users can update their own notifications"
ON notifications FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own push subscriptions" ON push_subscriptions;
CREATE POLICY "Users can manage their own push subscriptions"
ON push_subscriptions FOR ALL
USING (auth.uid() = user_id);

-- 5. RPC for Admin Broadcasts
CREATE OR REPLACE FUNCTION send_admin_broadcast(msg_title TEXT, msg_content TEXT, target_link TEXT DEFAULT NULL)
RETURNS VOID AS $$
BEGIN
    INSERT INTO notifications (user_id, type, title, content, link)
    SELECT id, 'broadcast', msg_title, msg_content, target_link
    FROM profiles;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
