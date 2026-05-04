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

async function checkAdmins() {
  const { data, error } = await supabase.from('profiles').select('id, full_name, role').eq('role', 'admin');
  if (error) {
    console.error('Error fetching admins:', error);
  } else {
    console.log('Admins:', data);
  }
}

checkAdmins();
