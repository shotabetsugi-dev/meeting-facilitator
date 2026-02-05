'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/')
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    console.log('Starting signup...')

    const { error: signUpError, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
        },
        emailRedirectTo: `${window.location.origin}/`,
      },
    })

    console.log('Signup response:', { data, error: signUpError })

    if (signUpError) {
      console.error('Signup error:', signUpError)
      setError(signUpError.message)
      setLoading(false)
      return
    }

    // Check if email confirmation is required
    if (data.user && !data.session) {
      setError('確認メールを送信しました。メールを確認してアカウントを有効化してください。')
      setLoading(false)
      return
    }

    // Auto login after signup
    if (data.user && data.session) {
      console.log('Signup successful, redirecting...')
      router.push('/')
    } else {
      setError('アカウントは作成されましたが、ログインに失敗しました。ログインページからログインしてください。')
      setLoading(false)
      setIsSignUp(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <div className="w-full max-w-md px-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">
            <span className="bg-gradient-to-r from-[var(--gradient-start)] via-[var(--gradient-middle)] to-[var(--gradient-end)] bg-clip-text text-transparent">
              Lays-Lop
            </span>
            <span className="text-[var(--accent-blue)]"> Internal meeting</span>
          </h1>
          <p className="text-[var(--foreground)]/60">会議ファシリテーター</p>
        </div>

        <Card>
          <form onSubmit={isSignUp ? handleSignUp : handleLogin} className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-[var(--foreground)] mb-4">
                {isSignUp ? 'アカウント作成' : 'ログイン'}
              </h2>
            </div>

            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                  名前
                </label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="山田太郎"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                メールアドレス
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@company.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                パスワード
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? '処理中...' : isSignUp ? 'アカウント作成' : 'ログイン'}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  setError('')
                }}
                className="text-sm text-[var(--accent-blue)] hover:underline"
              >
                {isSignUp
                  ? 'すでにアカウントをお持ちの方はこちら'
                  : 'アカウントをお持ちでない方はこちら'}
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
