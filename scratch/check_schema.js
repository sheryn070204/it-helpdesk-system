import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

// Manually parse .env.local because dotenv might not find it
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

async function checkSchema() {
  const { data, error } = await supabase.from('notifications').select('*').limit(1);
  if (error) {
    console.error('Error fetching notifications:', error);
  } else {
    console.log('Columns in notifications:', Object.keys(data[0] || {}));
  }
}

checkSchema();
