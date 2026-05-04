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

async function checkTicketColumns() {
  const cols = ['id', 'title', 'description', 'priority', 'status', 'created_at', 'submitted_by', 'assigned_to', 'proof_url', 'resolution_notes'];
  for (const col of cols) {
    const { error } = await supabase.from('tickets').select(col).limit(1);
    if (error) {
      console.log(`Column '${col}': FAILED (${error.message})`);
    } else {
      console.log(`Column '${col}': OK`);
    }
  }
}

checkTicketColumns();
