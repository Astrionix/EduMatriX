import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateEmbedding } from '@/lib/ai';
// @ts-ignore
import pdf from 'pdf-parse/lib/pdf-parse.js';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;
        const materialId = formData.get('materialId') as string;

        if (!file || !materialId) {
            return NextResponse.json({ error: 'Missing file or materialId' }, { status: 400 });
        }

        const supabase = await createClient();

        // 1. Extract text from PDF
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const data = await pdf(buffer);
        const text = data.text;

        // 2. Chunk text (Simple chunking for now)
        const chunkSize = 1000;
        const chunks = [];
        for (let i = 0; i < text.length; i += chunkSize) {
            chunks.push(text.slice(i, i + chunkSize));
        }

        // 3. Generate embeddings and store in DB
        for (const chunk of chunks) {
            const embedding = await generateEmbedding(chunk);

            const { error } = await supabase.from('embeddings').insert({
                material_id: materialId,
                content: chunk,
                embedding: embedding
            });

            if (error) {
                console.error('Error storing embedding:', error);
                // Continue processing other chunks even if one fails
            }
        }

        return NextResponse.json({ success: true, chunksProcessed: chunks.length });

    } catch (error: any) {
        console.error('Error processing document:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
