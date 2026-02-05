# Supabase 認証設定ガイド

## アカウント作成が「処理中...」で止まる問題の解決方法

この問題は、Supabaseのメール確認設定が原因です。内部利用の場合、メール確認を無効化することをお勧めします。

## 設定手順

### 1. Supabase ダッシュボードにアクセス

1. [Supabase Dashboard](https://supabase.com/dashboard) にログイン
2. プロジェクトを選択

### 2. メール確認を無効化（推奨: 内部利用の場合）

1. 左サイドバーの **Authentication** → **Providers** をクリック
2. **Email** プロバイダーをクリック
3. **Enable email confirmations** のトグルを **OFF** に設定
4. **Save** をクリック

これで、ユーザーはメール確認なしでアカウントを作成できます。

### 3. メールテンプレートの設定（メール確認を有効にする場合）

メール確認を有効にする場合は、メールサービスを設定する必要があります：

1. 左サイドバーの **Authentication** → **Email Templates** をクリック
2. **Confirm signup** テンプレートを確認
3. 必要に応じてカスタマイズ

### 4. リダイレクトURL設定

1. 左サイドバーの **Authentication** → **URL Configuration** をクリック
2. **Site URL** に本番環境のURL（例: `https://your-app.vercel.app`）を設定
3. **Redirect URLs** に以下を追加：
   - `http://localhost:3000/*`（開発環境）
   - `https://your-app.vercel.app/*`（本番環境）

## 開発環境でのテスト

メール確認を無効化した場合：

1. ログインページで「アカウントをお持ちでない方はこちら」をクリック
2. 名前、メールアドレス、パスワードを入力
3. 「アカウント作成」をクリック
4. 自動的にログインされてホームページに遷移

## トラブルシューティング

### 問題: アカウント作成後もログインできない

**原因**: メール確認が有効になっている可能性

**解決策**:
1. Supabaseダッシュボードで **Authentication** → **Users** を確認
2. 作成されたユーザーの **Email Confirmed** が `false` の場合、メール確認が必要
3. 上記の手順でメール確認を無効化するか、以下のSQLで手動確認：

```sql
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'user@example.com';
```

### 問題: 「処理中...」のまま止まる

**原因**: ネットワークエラーまたはSupabase設定エラー

**解決策**:
1. ブラウザの開発者ツール（F12）でConsoleを確認
2. エラーメッセージを確認
3. Supabase URLとAnon Keyが正しく設定されているか確認

### 問題: 「Invalid redirect URL」エラー

**原因**: リダイレクトURLが許可リストに含まれていない

**解決策**:
1. Supabaseダッシュボードで **Authentication** → **URL Configuration**
2. **Redirect URLs** に現在のURLを追加

## 本番環境での推奨設定

本番環境では、以下の設定を推奨します：

1. ✅ メール確認を有効化（セキュリティのため）
2. ✅ メールサービス（SendGrid、AWS SESなど）を設定
3. ✅ 適切なリダイレクトURLを設定
4. ✅ パスワードポリシーを設定（Authentication → Policies）

## 参考リンク

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls)
