const { createClient } = require('@supabase/supabase-js');

const url = 'https://wopsjdcnteuslsnzwitg.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvcHNqZGNudGV1c2xzbnp3aXRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5OTA5NTksImV4cCI6MjA5MzU2Njk1OX0.BfvYl5Sie-_sMgkGtQgx5vOSp7JmzGhXiHpm33rIX7Q';

async function test() {
  const res = await fetch(url + '/rest/v1/', {
    method: 'POST',
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: "SELECT polname, qual, with_check FROM pg_policy WHERE polrelid = 'group_members'::regclass;"
    })
  });
  console.log(await res.text());
}
test();
