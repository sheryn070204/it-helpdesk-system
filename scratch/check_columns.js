import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) env[key.trim()] = value.trim();
});

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkColumns() {
  // Try to select columns one by one to see which ones fail
  const cols = ['id', 'user_id', 'ticket_id', 'type', 'message', 'is_read', 'created_at'];
  for (const col of cols) {
    const { error } = await supabase.from('notifications').select(col).limit(1);
    if (error) {
      console.log(`Column '${col}': FAILED (${error.message})`);
    } else {
      console.log(`Column '${col}': OK`);
    }
  }
}

checkColumns();
