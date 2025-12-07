const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Manually parse .env.local
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, ...val] = line.split('=');
    if (key && val) env[key.trim()] = val.join('=').trim();
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

console.log("Using URL:", supabaseUrl ? "Found" : "Missing");
console.log("Using Key:", supabaseKey ? "Found" : "Missing");

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data, error } = await supabase
        .from('timetables')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

    if (error) {
        console.error("Error:", error);
    } else {
        console.log("Latest Timetable:");
        if (data && data.length > 0) {
            console.log("ID:", data[0].id);
            console.log("Structured Data Present:", !!data[0].structured_data);
            if (data[0].structured_data) {
                console.log("Snippet:", JSON.stringify(data[0].structured_data).substring(0, 100));
            }
        } else {
            console.log("No timetables found.");
        }
    }
}

check();
