const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://enoimlsdlbxfpvnjgrer.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVub2ltbHNkbGJ4ZnB2bmpncmVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4MTk3MjcsImV4cCI6MjA4NjM5NTcyN30.Z-KThjM3V7Tz_s38W032KjE30N-0J0yYvQ9x5_s38W0'; // We will read key from lib/supabaseClient.ts

async function testSupabase() {
  const fs = require('fs');
  const clientCode = fs.readFileSync('src/lib/supabaseClient.ts', 'utf8');
  const urlMatch = clientCode.match(/supabaseUrl\s*=\*?\s*['"]([^'"]+)['"]/);
  const keyMatch = clientCode.match(/supabaseAnonKey\s*=\*?\s*['"]([^'"]+)['"]/);
  
  console.log('Testing Supabase query for album 1uVn8Fim7VI2ISA7B6tlsRc9msTEaqIYm...');
}
testSupabase();
