# Supabase プロジェクト作成ガイド

## 1. Supabaseプロジェクトの作成

1. https://supabase.com にアクセスしてログイン
2. "New Project" をクリック
3. プロジェクト情報を入力:
   - **Project name**: meeting-facilitator (任意)
   - **Database Password**: 強力なパスワードを設定（必ずメモ）
   - **Region**: Northeast Asia (Tokyo)
   - **Pricing Plan**: Free（開発用）
4. "Create new project" をクリック
5. プロジェクトの作成完了まで1-2分待機

## 2. API認証情報の取得

プロジェクトが作成されたら:

1. 左サイドバーの **Settings** (歯車アイコン) をクリック
2. **API** セクションを選択
3. 以下の情報をコピーしてメモ:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJxxx...` (publicとマークされているもの)
   - **service_role key**: `eyJxxx...` (secretとマークされているもの) ⚠️重要: このキーは公開しないこと

## 3. データベーススキーマの作成

1. 左サイドバーの **SQL Editor** をクリック
2. "New Query" をクリック
3. 以下のSQLスクリプトを実行してください（仕様書のSQLをそのまま使用）

SQLスクリプトは `DATABASE_SCHEMA.sql` ファイルに保存されています。

実行手順:
1. `DATABASE_SCHEMA.sql` の内容をコピー
2. Supabaseの SQL Editor に貼り付け
3. 右上の "Run" ボタンをクリック
4. エラーがなければ完了

## 4. Realtime の有効化確認

SQL実行後、以下を確認:

1. 左サイドバーの **Database** → **Replication** をクリック
2. 以下のテーブルが Source に追加されていることを確認:
   - meetings
   - agendas
   - sales_metrics
   - sales_status
   - dev_projects
   - announcements
   - free_topics
   - debates
   - presence

すべてのテーブルがリストに表示されていれば、Realtimeが有効です。

## 5. 環境変数の設定

プロジェクトに戻り、`.env.local` ファイルに以下を記入:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxx

# Claude API
CLAUDE_API_KEY=sk-ant-api03-xxxxx

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

⚠️ **重要**: `.env.local` ファイルは Git にコミットしないでください。

## 次のステップ

環境変数を設定したら、開発に戻れます。
