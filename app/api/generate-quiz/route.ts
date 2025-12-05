import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
    try {
        const { topic, difficulty = "Medium", count = 5 } = await req.json();

        // Validate count
        const numQuestions = Math.min(Math.max(1, count), 15);

        const prompt = `Generate a multiple-choice quiz about "${topic}" with ${numQuestions} questions.
        Difficulty Level: ${difficulty}.
        Return ONLY a valid JSON array of objects. Each object must have:
        - "question": string
        - "options": array of 4 strings
        - "correctAnswer": integer (0-3 index of the correct option)
        - "explanation": string (brief explanation of why it's correct)
        
        Example format:
        [
            {
                "question": "What is 2+2?",
                "options": ["3", "4", "5", "6"],
                "correctAnswer": 1,
                "explanation": "2 plus 2 equals 4."
            }
        ]
        Do not include markdown formatting like \`\`\`json. Just the raw JSON.`;

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are a quiz generator. You output strictly valid JSON arrays."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.5,
        });

        const content = completion.choices[0]?.message?.content || "[]";
        // Clean up markdown if present
        const jsonString = content.replace(/```json/g, '').replace(/```/g, '').trim();

        const quiz = JSON.parse(jsonString);

        return NextResponse.json({ quiz });
    } catch (error: any) {
        console.error("Error generating quiz:", error);
        return NextResponse.json(
            { error: "Failed to generate quiz." },
            { status: 500 }
        );
    }
}
