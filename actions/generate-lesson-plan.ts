'use server'

import { Groq } from "groq-sdk"

export async function generateLessonPlan(topic: string, duration: string, level: string) {
    const apiKey = process.env.GROQ_API_KEY
    const groq = new Groq({ apiKey });

    const prompt = `Generate a detailed lesson plan for a ${duration} minute class on "${topic}" for ${level} level students.
    Return the response ONLY as a valid JSON object with the following structure:
    {
        "title": "Lesson Title",
        "objectives": ["Objective 1", "Objective 2"],
        "materials": ["Material 1", "Material 2"],
        "sections": [
            { "time": "5 mins", "activity": "Introduction", "details": "..." },
            { "time": "20 mins", "activity": "Main Lecture", "details": "..." }
        ],
        "assessment": "How to assess learning"
    }
    IMPORTANT: Return ONLY the JSON. No markdown, no backticks, no intro text.`;

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are an expert academic curriculum designer. You output strictly valid JSON."
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.5,
        });

        const content = completion.choices[0]?.message?.content || "{}";
        console.log("Groq Raw Response:", content);

        const jsonString = content.replace(/```json/g, '').replace(/```/g, '').trim();

        try {
            return JSON.parse(jsonString);
        } catch (parseError) {
            console.error("JSON Parse Error:", parseError);
            throw new Error("Invalid JSON format");
        }
    } catch (error) {
        console.error("Error generating lesson plan:", error);

        // Fallback Mock Data so the UI doesn't break
        return {
            title: `Lesson Plan: ${topic}`,
            objectives: ["Understand core concepts", "Apply knowledge to problems"],
            materials: ["Whiteboard", "Projector", "Handouts"],
            sections: [
                { time: "10 mins", activity: "Introduction", details: "Overview of the topic" },
                { time: `${parseInt(duration) - 20} mins`, activity: "Core Instruction", details: "Deep dive into " + topic },
                { time: "10 mins", activity: "Q&A", details: "Review and questions" }
            ],
            assessment: "Formative assessment through class discussion."
        };
    }
}
