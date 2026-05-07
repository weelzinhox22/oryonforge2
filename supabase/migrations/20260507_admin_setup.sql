-- 20260507_admin_setup.sql

-- 1. Add Role Column to Profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- 2. Set weelzinhox22@gmail.com as admin (Assuming they already have an account)
-- We use a subquery to find the profile by email if it exists
DO $$
BEGIN
    UPDATE profiles 
    SET role = 'admin' 
    WHERE id IN (
        SELECT id FROM auth.users WHERE email = 'weelzinhox22@gmail.com'
    );
END $$;

-- 3. Create a helper function to check if a user is an admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Secure the send_admin_broadcast function
CREATE OR REPLACE FUNCTION send_admin_broadcast(msg_title TEXT, msg_content TEXT, target_link TEXT DEFAULT NULL)
RETURNS VOID AS $$
BEGIN
    IF NOT is_admin() THEN
        RAISE EXCEPTION 'Acesso negado: Apenas administradores podem enviar broadcasts.';
    END IF;

    INSERT INTO notifications (user_id, type, title, content, link)
    SELECT id, 'broadcast', msg_title, msg_content, target_link
    FROM profiles;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
