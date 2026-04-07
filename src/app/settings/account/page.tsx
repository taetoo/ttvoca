'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, User, Lock, CheckCircle2, AlertCircle } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { User as SupabaseUser } from '@supabase/supabase-js'

interface Profile {
  id: string
  nickname: string
  created_at: string
  updated_at: string
}

export default function AccountPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  
  // Nickname states
  const [nickname, setNickname] = useState('')
  const [isEditingNickname, setIsEditingNickname] = useState(false)
  const [isUpdatingNickname, setIsUpdatingNickname] = useState(false)
  
  // Password states
  const [currentPassword, setCurrentPassword] = useState('')
  const [isPasswordVerified, setIsPasswordVerified] = useState(false)
  const [isVerifyingPassword, setIsVerifyingPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setUser(session.user)
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        if (profileError) {
          console.error("Account Profile Fetch Error:", profileError)
        } else if (profileData) {
          setProfile(profileData as Profile)
          setNickname(profileData.nickname)
        }
      } else {
        router.push('/login')
      }
      setLoading(false)
    }
    fetchUserData()
  }, [supabase, router])

  const handleUpdateNickname = async () => {
    if (!nickname || nickname.length < 2) {
      alert('별명은 2글자 이상이어야 합니다.')
      return
    }
    if (nickname.length > 10) {
      alert('별명은 10글자 이내이어야 합니다.')
      return
    }

    setIsUpdatingNickname(true)
    const { error } = await supabase
      .from('profiles')
      .update({ nickname })
      .eq('id', user?.id)

    if (error) {
      alert('별명 수정 실패: ' + error.message)
    } else if (profile) {
      setProfile({ ...profile, nickname })
      setIsEditingNickname(false)
      alert('별명이 성공적으로 변경되었습니다.')
    }
    setIsUpdatingNickname(false)
  }

  const handleVerifyPassword = async () => {
    if (!currentPassword) {
      alert('현재 비밀번호를 입력해주세요.')
      return
    }

    setIsVerifyingPassword(true)
    if (!user?.email) return

    const { error } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword
    })

    if (error) {
      alert('비밀번호가 일치하지 않습니다. 다시 확인해 주세요.')
    } else {
      setIsPasswordVerified(true)
    }
    setIsVerifyingPassword(false)
  }

  const handleUpdatePassword = async () => {
    if (!password || password.length < 8) {
      alert('비밀번호는 8자리 이상이어야 합니다.')
      return
    }
    if (password !== passwordConfirm) {
      alert('비밀번호 확인이 일치하지 않습니다.')
      return
    }

    setIsUpdatingPassword(true)
    const { error } = await supabase.auth.updateUser({
      password: password
    })

    if (error) {
      alert('비밀번호 변경 실패: ' + error.message)
    } else {
      alert('비밀번호가 성공적으로 변경되었습니다.')
      setPassword('')
      setPasswordConfirm('')
    }
    setIsUpdatingPassword(false)
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-background font-sans">
        <div className="w-12 h-12 border-4 border-border-base border-t-primary rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-background px-6 pt-[calc(1.5rem+env(safe-area-inset-top))] pb-[calc(4rem+env(safe-area-inset-bottom))] font-sans text-foreground transition-colors">
      {/* Back Button */}
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-text-secondary font-black mb-8 hover:text-foreground transition-all w-fit bg-surface border-2 border-foreground px-4 py-2 rounded-xl shadow-[3px_3px_0px_0px_#1E1E1E] dark:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
      >
        <ArrowLeft size={18} strokeWidth={3} />
        뒤로 가기
      </button>

      <h1 className="text-4xl font-black mb-12 tracking-tighter uppercase">계정 설정</h1>

      <div className="space-y-10">
        {/* Email Display (Read-only) */}
        <section className="bg-surface p-8 rounded-[2rem] border-4 border-foreground shadow-[8px_8px_0px_0px_#1E1E1E] dark:shadow-none">
          <div className="flex items-center gap-2 mb-4 text-text-secondary opacity-50">
            <User size={18} strokeWidth={3} />
            <span className="text-xs font-black tracking-widest uppercase">이메일 (변경 불가)</span>
          </div>
          <p className="text-2xl font-black px-1 tracking-tight">{user?.email}</p>
        </section>

        {/* Nickname Section */}
        <section className="bg-surface p-8 rounded-[2rem] border-4 border-foreground shadow-[8px_8px_0px_0px_#1E1E1E] dark:shadow-none transition-all">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="text-memorized" size={24} strokeWidth={3} />
              <h2 className="text-2xl font-black uppercase tracking-tight">별명 관리</h2>
            </div>
            {!isEditingNickname && (
              <button 
                onClick={() => setIsEditingNickname(true)}
                className="text-foreground font-black text-xs bg-primary border-2 border-foreground px-5 py-2.5 rounded-xl shadow-[3px_3px_0px_0px_#1E1E1E] dark:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
              >
                변경
              </button>
            )}
          </div>
          
          <div className="space-y-6">
            {isEditingNickname ? (
              <>
                <div>
                  <p className="text-xs font-black text-text-secondary uppercase tracking-widest mb-3 ml-1 opacity-50">새 별명 (2~10자)</p>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value.slice(0, 10))}
                    maxLength={10}
                    className="w-full px-5 py-4 bg-white dark:bg-gray-800 border-4 border-foreground rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all font-black text-xl tracking-tight"
                    placeholder="새 별명을 입력하세요"
                  />
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setNickname(profile?.nickname || '')
                      setIsEditingNickname(false)
                    }}
                    className="flex-1 py-4 bg-background border-2 border-foreground text-text-secondary rounded-2xl font-black text-sm uppercase tracking-widest hover:text-foreground transition-all"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleUpdateNickname}
                    disabled={isUpdatingNickname || nickname === profile?.nickname}
                    className="flex-[2] py-4 bg-primary text-foreground border-4 border-foreground rounded-2xl font-black text-lg shadow-[4px_4px_0px_0px_#1E1E1E] dark:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none disabled:opacity-50 disabled:grayscale transition-all uppercase tracking-tight"
                  >
                    {isUpdatingNickname ? '저장 중...' : '저장하기'}
                  </button>
                </div>
              </>
            ) : (
              <div className="bg-background p-6 rounded-2xl border-2 border-dashed border-foreground/20">
                <p className="text-xs font-black text-text-secondary uppercase tracking-widest mb-2 opacity-40">현재 별명</p>
                <p className="text-2xl font-black tracking-tight">{profile?.nickname}</p>
              </div>
            )}
          </div>
        </section>

        {/* Password Section */}
        <section className="bg-surface p-8 rounded-[2rem] border-4 border-foreground shadow-[8px_8px_0px_0px_#1E1E1E] dark:shadow-none transition-all">
          <div className="flex items-center gap-3 mb-8">
            <Lock className={isPasswordVerified ? 'text-memorized' : 'text-secondary'} size={24} strokeWidth={3} />
            <h2 className="text-2xl font-black uppercase tracking-tight">보안 설정</h2>
          </div>

          <div className="space-y-6">
            {!isPasswordVerified ? (
              <>
                <div>
                  <p className="text-xs font-black text-text-secondary uppercase tracking-widest mb-3 ml-1 opacity-50">현재 비밀번호 확인</p>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-5 py-4 bg-white dark:bg-gray-800 border-4 border-foreground rounded-2xl focus:outline-none focus:ring-4 focus:ring-secondary/20 transition-all font-black text-xl"
                    placeholder="••••••••"
                  />
                </div>
                <button
                  onClick={handleVerifyPassword}
                  disabled={isVerifyingPassword || !currentPassword}
                  className="w-full py-5 bg-secondary text-white border-4 border-foreground rounded-2xl font-black text-lg shadow-[4px_4px_0px_0px_#1E1E1E] dark:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 transition-all uppercase tracking-tight"
                >
                  {isVerifyingPassword ? '확인 중...' : '비밀번호 확인'}
                </button>
              </>
            ) : (
              <>
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="bg-memorized/10 p-5 rounded-2xl border-2 border-memorized flex items-center gap-4 mb-8">
                    <CheckCircle2 size={24} className="text-memorized shrink-0" strokeWidth={3} />
                    <p className="text-sm font-black text-foreground tracking-tight">비밀번호가 확인되었습니다. 새 비밀번호를 입력해주세요.</p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <p className="text-xs font-black text-text-secondary uppercase tracking-widest mb-3 ml-1 opacity-50">새 비밀번호 (8자 이상)</p>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-5 py-4 bg-white dark:bg-gray-800 border-4 border-foreground rounded-2xl focus:outline-none focus:ring-4 focus:ring-memorized/20 transition-all font-black text-xl"
                        placeholder="••••••••"
                        autoFocus
                      />
                    </div>
                    
                    <div>
                      <p className="text-xs font-black text-text-secondary uppercase tracking-widest mb-3 ml-1 opacity-50">새 비밀번호 확인</p>
                      <input
                        type="password"
                        value={passwordConfirm}
                        onChange={(e) => setPasswordConfirm(e.target.value)}
                        className="w-full px-5 py-4 bg-white dark:bg-gray-800 border-4 border-foreground rounded-2xl focus:outline-none focus:ring-4 focus:ring-memorized/20 transition-all font-black text-xl"
                        placeholder="••••••••"
                      />
                    </div>

                    <button
                      onClick={handleUpdatePassword}
                      disabled={isUpdatingPassword || !password || password !== passwordConfirm}
                      className="w-full py-5 bg-memorized text-white border-4 border-foreground rounded-2xl font-black text-lg shadow-[4px_4px_0px_0px_#1E1E1E] dark:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 transition-all uppercase tracking-tight"
                    >
                      {isUpdatingPassword ? '변경 중...' : '비밀번호 변경'}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      </div>

      {/* Security Info */}
      <div className="mt-12 flex items-start gap-4 p-6 bg-primary/10 rounded-[2rem] border-4 border-foreground shadow-[6px_6px_0px_0px_#CEF67022]">
        <AlertCircle className="text-foreground shrink-0 mt-0.5" size={20} strokeWidth={3} />
        <p className="text-sm font-black text-foreground leading-snug tracking-tight">
          보안 알림: 계정 안전을 위해 주기적으로 비밀번호를 변경해 주세요. 변경사항은 다음 로그인부터 즉시 적용됩니다.
        </p>
      </div>
    </div>
  )
}
