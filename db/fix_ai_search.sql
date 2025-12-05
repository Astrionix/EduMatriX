-- 1. Enable vector extension (if not already enabled)
create extension if not exists vector;

-- 2. Create embeddings table (if not exists)
create table if not exists public.embeddings (
  id uuid primary key default gen_random_uuid(),
  material_id uuid references public.materials(id) on delete cascade,
  content text,
  embedding vector(768), -- Gemini embedding dimension
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create index for faster similarity search
create index if not exists embeddings_embedding_idx on public.embeddings using ivfflat (embedding vector_cosine_ops)
with (lists = 100);

-- 4. CRITICAL: Create the match_documents function
-- This is what the API calls. If this is missing, you get the "neural network" error.
create or replace function match_documents (
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    embeddings.id,
    embeddings.content,
    embeddings.metadata,
    1 - (embeddings.embedding <=> query_embedding) as similarity
  from embeddings
  where 1 - (embeddings.embedding <=> query_embedding) > match_threshold
  order by embeddings.embedding <=> query_embedding
  limit match_count;
end;
$$;
