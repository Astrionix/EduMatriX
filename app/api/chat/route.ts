import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { createClient } from '@supabase/supabase-js';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
    try {
        const { messages, subjectId } = await req.json();
        console.log("Nova Chat Request (Groq) received");

        // Fetch Materials Context
        let materialsContext = "";
        try {
            let query = supabase
                .from('materials')
                .select('title, description, subjects(name)')
                .limit(10); // Limit to 10 recent materials for context window

            if (subjectId) {
                query = query.eq('subject_id', subjectId);
            }

            const { data: materials, error } = await query;

            if (materials && materials.length > 0) {
                materialsContext = "Here are some relevant study materials available in the portal:\n";
                materials.forEach((m: any) => {
                    materialsContext += `- [${m.subjects?.name}] ${m.title}: ${m.description || "No description"}\n`;
                });
                materialsContext += "\nIf the user asks about these topics, use this information to help answer.\n";
            }
        } catch (dbError) {
            console.error("Error fetching materials for context:", dbError);
        }

        const systemPrompt = `You are Nova, an advanced AI study companion for MCA students. 
Format your answers strictly as follows:
1. Provide exactly 10 concise, numbered points explaining the concept.
2. End with a brief 'Summary' section.
Keep the tone educational and encouraging.

${materialsContext}
`;

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: systemPrompt
                },
                ...messages
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            max_tokens: 1024,
        });

        const reply = completion.choices[0]?.message?.content || "I apologize, but I couldn't generate a response.";

        return NextResponse.json({ reply });
    } catch (error: any) {
        console.error("Error in chat API (Groq):", error);
        if (error.response) {
            console.error("Groq API Error Response:", JSON.stringify(error.response.data, null, 2));
        }
        return NextResponse.json(
            { error: error.message || "Failed to process your request." },
            { status: 500 }
        );
    }
}
