const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// 1. Env Setup
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, ...val] = line.split('=');
    if (key && val) env[key.trim()] = val.join('=').trim();
});

const genAI = new GoogleGenerativeAI(env.NEXT_PUBLIC_GEMINI_API_KEY);
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

// 2. Main Test Function
async function testExtraction() {
    console.log("Starting Manual AI Test...");

    // Get the latest timetable usage
    const { data: tts, error } = await supabase.from('timetables').select('*').order('created_at', { ascending: false }).limit(1);

    if (error) {
        console.error("Supabase Error:", error);
        return;
    }

    if (!tts || tts.length === 0) {
        console.log("No timetables found to test.");
        return;
    }
    const tt = tts[0];

    try {
        console.log(`Attempting to use model: gemini-pro`);

        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const prompt = "Say hello. This is a connectivity test.";

        console.log("Sending text prompt to Gemini...");
        const result = await model.generateContent(prompt);

        const text = result.response.text();
        console.log("Gemini Response Recieved!");
        console.log("Response:", text);

    } catch (error) {
        console.error("Test Failed:", error);
    }
}

testExtraction();
