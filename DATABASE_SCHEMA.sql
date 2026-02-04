-- 会議マスター
CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  participants TEXT[],
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 議題
CREATE TABLE agendas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  agenda_number INT NOT NULL,
  title TEXT NOT NULL,
  detail TEXT,
  content TEXT,
  action_items TEXT,
  sort_order INT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 営業媒体マスター
CREATE TABLE sales_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  color TEXT DEFAULT '#3498DB',
  metrics_type TEXT DEFAULT 'leads' CHECK (metrics_type IN ('leads', 'attack')),
  is_active BOOLEAN DEFAULT true,
  sort_order INT
);

-- 営業数値
CREATE TABLE sales_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  channel_id UUID REFERENCES sales_channels(id) ON DELETE CASCADE,
  year_month TEXT NOT NULL, -- 'YYYY-MM' format
  leads_count INT DEFAULT 0,
  appointments_count INT DEFAULT 0,
  contracts_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(meeting_id, channel_id)
);

-- 営業状況
CREATE TABLE sales_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  status_text TEXT,
  next_action TEXT,
  next_action_date DATE,
  sort_order INT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 開発案件
CREATE TABLE dev_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  project_type TEXT NOT NULL CHECK (project_type IN ('client', 'internal')),
  project_name TEXT NOT NULL,
  signal TEXT DEFAULT '順調' CHECK (signal IN ('インシデント', '順調', '要調整')),
  temperature TEXT DEFAULT '良好' CHECK (temperature IN ('普通', '良好')),
  status_text TEXT,
  sort_order INT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- アナウンス
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Free議題
CREATE TABLE free_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  content TEXT,
  sort_order INT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ディベート
CREATE TABLE debates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  theme TEXT,
  pro_side TEXT,
  con_side TEXT,
  duration_minutes INT DEFAULT 5,
  memo TEXT,
  timer_state JSONB DEFAULT '{"status": "stopped", "remaining": 300}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ディベートテーマ履歴
CREATE TABLE debate_themes_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  theme TEXT NOT NULL,
  category TEXT,
  used_at TIMESTAMPTZ DEFAULT NOW()
);

-- プレゼンス（誰がどこを編集中か）
CREATE TABLE presence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  current_section TEXT,
  current_field TEXT,
  last_seen TIMESTAMPTZ DEFAULT NOW()
);

-- 会議報告書
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  content TEXT,
  generated_at TIMESTAMPTZ DEFAULT NOW()
);

-- updated_atを自動更新するトリガー
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 各テーブルにトリガーを設定
CREATE TRIGGER update_meetings_updated_at BEFORE UPDATE ON meetings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_agendas_updated_at BEFORE UPDATE ON agendas FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_sales_metrics_updated_at BEFORE UPDATE ON sales_metrics FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_sales_status_updated_at BEFORE UPDATE ON sales_status FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_dev_projects_updated_at BEFORE UPDATE ON dev_projects FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON announcements FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_free_topics_updated_at BEFORE UPDATE ON free_topics FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_debates_updated_at BEFORE UPDATE ON debates FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS (Row Level Security) ポリシー
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE dev_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE free_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE debates ENABLE ROW LEVEL SECURITY;
ALTER TABLE presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- 全員がアクセス可能なポリシー（社内ツールのため）
CREATE POLICY "Allow all" ON meetings FOR ALL USING (true);
CREATE POLICY "Allow all" ON agendas FOR ALL USING (true);
CREATE POLICY "Allow all" ON sales_channels FOR ALL USING (true);
CREATE POLICY "Allow all" ON sales_metrics FOR ALL USING (true);
CREATE POLICY "Allow all" ON sales_status FOR ALL USING (true);
CREATE POLICY "Allow all" ON dev_projects FOR ALL USING (true);
CREATE POLICY "Allow all" ON announcements FOR ALL USING (true);
CREATE POLICY "Allow all" ON free_topics FOR ALL USING (true);
CREATE POLICY "Allow all" ON debates FOR ALL USING (true);
CREATE POLICY "Allow all" ON presence FOR ALL USING (true);
CREATE POLICY "Allow all" ON reports FOR ALL USING (true);

-- 初期データ: 営業媒体
INSERT INTO sales_channels (name, color, metrics_type, sort_order) VALUES
  ('アイミツ', '#9B59B6', 'leads', 1),
  ('ReadyCrew', '#E67E22', 'leads', 2),
  ('発注ナビ', '#F1C40F', 'leads', 3),
  ('直営', '#3498DB', 'attack', 4),
  ('MY', '#1ABC9C', 'attack', 5);

-- Realtime有効化
ALTER PUBLICATION supabase_realtime ADD TABLE meetings;
ALTER PUBLICATION supabase_realtime ADD TABLE agendas;
ALTER PUBLICATION supabase_realtime ADD TABLE sales_metrics;
ALTER PUBLICATION supabase_realtime ADD TABLE sales_status;
ALTER PUBLICATION supabase_realtime ADD TABLE dev_projects;
ALTER PUBLICATION supabase_realtime ADD TABLE announcements;
ALTER PUBLICATION supabase_realtime ADD TABLE free_topics;
ALTER PUBLICATION supabase_realtime ADD TABLE debates;
ALTER PUBLICATION supabase_realtime ADD TABLE presence;

-- 月次集計ビュー
CREATE VIEW sales_monthly_summary AS
SELECT
  TO_CHAR(m.meeting_date, 'YYYY-MM') as year_month,
  sc.name as channel_name,
  sc.color as channel_color,
  SUM(sm.leads_count) as total_leads,
  SUM(sm.appointments_count) as total_appointments,
  SUM(sm.contracts_count) as total_contracts,
  CASE
    WHEN SUM(sm.leads_count) > 0
    THEN ROUND(SUM(sm.appointments_count)::numeric / SUM(sm.leads_count) * 100, 1)
    ELSE 0
  END as appointment_rate,
  CASE
    WHEN SUM(sm.appointments_count) > 0
    THEN ROUND(SUM(sm.contracts_count)::numeric / SUM(sm.appointments_count) * 100, 1)
    ELSE 0
  END as contract_rate
FROM sales_metrics sm
JOIN meetings m ON sm.meeting_id = m.id
JOIN sales_channels sc ON sm.channel_id = sc.id
GROUP BY TO_CHAR(m.meeting_date, 'YYYY-MM'), sc.name, sc.color
ORDER BY year_month DESC, sc.sort_order;
