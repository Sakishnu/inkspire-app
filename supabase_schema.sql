-- Create the blogs table
CREATE TABLE IF NOT EXISTS blogs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  content TEXT NOT NULL,
  "authorId" TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'published', 'scheduled')),
  "scheduledDate" TIMESTAMPTZ,
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  "coverImage" TEXT,
  "readingTime" INTEGER DEFAULT 1,
  "seoTitle" TEXT,
  "seoDescription" TEXT,
  views INTEGER DEFAULT 0,
  likes TEXT[] DEFAULT '{}',
  "createdDate" TIMESTAMPTZ DEFAULT NOW(),
  "publishedDate" TIMESTAMPTZ,
  featured BOOLEAN DEFAULT FALSE
);

-- Create the comments table
CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  "blogId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  content TEXT NOT NULL,
  "parentId" TEXT,
  likes TEXT[] DEFAULT '{}',
  "createdDate" TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (select/read all)
CREATE POLICY "Allow public read access on blogs" 
ON blogs FOR SELECT 
USING (true);

CREATE POLICY "Allow public read access on comments" 
ON comments FOR SELECT 
USING (true);

-- Create policies for authenticated access (insert/update/delete)
-- Note: Since we are using custom auth in this demo client-side, 
-- we allow all clients to read/write, but in production, you should restrict this.
CREATE POLICY "Allow all client-side inserts on blogs" 
ON blogs FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow all client-side updates on blogs" 
ON blogs FOR UPDATE 
USING (true);

CREATE POLICY "Allow all client-side deletes on blogs" 
ON blogs FOR DELETE 
USING (true);

CREATE POLICY "Allow all client-side inserts on comments" 
ON comments FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow all client-side updates on comments" 
ON comments FOR UPDATE 
USING (true);

CREATE POLICY "Allow all client-side deletes on comments" 
ON comments FOR DELETE 
USING (true);
