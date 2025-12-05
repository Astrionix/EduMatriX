'use server'

import Groq from "groq-sdk"

export async function generateQuiz(topic: string, count: number, difficulty: string) {
    // Use the provided key or fallback to env var
    const apiKey = process.env.GROQ_API_KEY

    const groq = new Groq({ apiKey });

    const prompt = `Generate a quiz with ${count} multiple-choice questions about "${topic}" at a "${difficulty}" difficulty level.
  Return the response ONLY as a valid JSON array of objects.
  Each object should have:
  - "id": number (1 to ${count})
  - "question": string
  - "options": array of 4 strings
  - "correctAnswer": string (must be one of the options)
  - "explanation": string (brief explanation of the correct answer)
  
  Do not include any markdown formatting like \`\`\`json. Just the raw JSON string.`

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
            model: "llama-3.3-70b-versatile",
        });

        const text = completion.choices[0]?.message?.content || ""

        console.log("Groq Raw Response:", text) // Debugging

        // robust JSON extraction
        const jsonMatch = text.match(/\[[\s\S]*\]/)
        if (!jsonMatch) {
            throw new Error("No JSON array found in response")
        }

        const cleanText = jsonMatch[0]
        return JSON.parse(cleanText)
    } catch (error: any) {
        console.error("Error generating quiz:", error)
        throw new Error(`Failed to generate quiz: ${error.message}`)
    }
}
