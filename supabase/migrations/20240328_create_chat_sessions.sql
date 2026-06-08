-- 1. 创建 chat_sessions 表
CREATE TABLE chat_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  preview TEXT,
  is_pinned BOOLEAN DEFAULT FALSE,
  type TEXT DEFAULT 'chat',
  messages JSONB DEFAULT '[]'::jsonb,
  active_models JSONB DEFAULT '[]'::jsonb,
  chat_mode TEXT DEFAULT 'fast',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 开启 RLS
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

-- 3. 创建 RLS 策略
CREATE POLICY "Users can view their own chat sessions" 
ON chat_sessions FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chat sessions" 
ON chat_sessions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat sessions" 
ON chat_sessions FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chat sessions" 
ON chat_sessions FOR DELETE 
USING (auth.uid() = user_id);

-- 4. 自动更新 updated_at 的触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_chat_sessions_updated_at
BEFORE UPDATE ON chat_sessions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
