-- Add missing RLS policies for ai_insights and chat_messages tables

-- Enable RLS
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Allow all" ON ai_insights FOR ALL USING (true);
CREATE POLICY "Allow all" ON chat_messages FOR ALL USING (true);

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE ai_insights;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;

-- Add replica identity for realtime
ALTER TABLE ai_insights REPLICA IDENTITY FULL;
