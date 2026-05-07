-- Update global ranking RPC to include avatar_url
DROP FUNCTION IF EXISTS get_global_ranking();
CREATE OR REPLACE FUNCTION get_global_ranking()
RETURNS TABLE (
  username TEXT,
  total_points BIGINT,
  activities_count BIGINT,
  level INTEGER,
  title TEXT,
  avatar_url TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.username,
    COALESCE(SUM(al.points), 0)::BIGINT as total_points,
    COUNT(al.id)::BIGINT as activities_count,
    p.level,
    p.title,
    p.avatar_url
  FROM profiles p
  LEFT JOIN activity_logs al ON p.id = al.user_id
  GROUP BY p.id, p.username, p.level, p.title, p.avatar_url
  HAVING COUNT(al.id) > 0 OR SUM(al.points) > 0
  ORDER BY total_points DESC, p.username ASC
  LIMIT 100;
END;
$$;
