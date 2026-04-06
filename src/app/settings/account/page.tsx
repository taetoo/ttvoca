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
      <div className="flex flex-col min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950 font-sans">
        <div className="w-12 h-12 border-4 border-gray-100 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950 px-6 pt-12 pb-24 font-sans text-gray-900 dark:text-gray-100 transition-colors">
      {/* Back Button */}
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-500 dark:text-gray-400 font-bold mb-8 hover:text-indigo-500 transition-colors w-fit"
      >
        <ArrowLeft size={20} />
        뒤로 가기
      </button>

      <h1 className="text-3xl font-extrabold mb-10">계정 관리</h1>

      <div className="space-y-8">
        {/* Email Display (Read-only) */}
        <section className="bg-white dark:bg-gray-900 p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-4 text-gray-400">
            <User size={18} />
            <span className="text-xs font-bold tracking-widest uppercase">계정 이메일 (변경 불가)</span>
          </div>
          <p className="text-lg font-bold px-1">{user?.email}</p>
        </section>

        {/* Nickname Section */}
        <section className="bg-white dark:bg-gray-900 p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 transition-all">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="text-emerald-500" size={22} />
              <h2 className="text-xl font-bold">별명 관리</h2>
            </div>
            {!isEditingNickname && (
              <button 
                onClick={() => setIsEditingNickname(true)}
                className="text-indigo-500 font-bold text-sm bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 rounded-xl hover:bg-indigo-100 transition-colors"
              >
                변경
              </button>
            )}
          </div>
          
          <div className="space-y-4">
            {isEditingNickname ? (
              <>
                <div>
                  <p className="text-xs font-bold text-gray-400 mb-2 ml-1">새 별명 (2~10자)</p>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value.slice(0, 10))}
                    maxLength={10}
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold text-lg"
                    placeholder="새 별명을 입력하세요"
                  />
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setNickname(profile?.nickname || '')
                      setIsEditingNickname(false)
                    }}
                    className="flex-1 py-4 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-2xl font-bold text-lg hover:bg-gray-200 transition-all"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleUpdateNickname}
                    disabled={isUpdatingNickname || nickname === profile?.nickname}
                    className="flex-[2] py-4 bg-emerald-500 text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-emerald-600 disabled:opacity-50 disabled:grayscale transition-all"
                  >
                    {isUpdatingNickname ? '저장 중...' : '저장하기'}
                  </button>
                </div>
              </>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                <p className="text-xs font-bold text-gray-400 mb-1">현재 사용 중인 별명</p>
                <p className="text-xl font-black">{profile?.nickname}</p>
              </div>
            )}
          </div>
        </section>

        {/* Password Section */}
        <section className="bg-white dark:bg-gray-900 p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 transition-all">
          <div className="flex items-center gap-2 mb-6">
            <Lock className={isPasswordVerified ? 'text-emerald-500' : 'text-indigo-500'} size={22} />
            <h2 className="text-xl font-bold">비밀번호 변경</h2>
          </div>

          <div className="space-y-4">
            {!isPasswordVerified ? (
              <>
                <div>
                  <p className="text-xs font-bold text-gray-400 mb-2 ml-1">현재 비밀번호 확인</p>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold"
                    placeholder="현재 비밀번호를 입력해주세요"
                  />
                </div>
                <button
                  onClick={handleVerifyPassword}
                  disabled={isVerifyingPassword || !currentPassword}
                  className="w-full py-4 bg-indigo-500 text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-indigo-600 disabled:opacity-50 transition-all"
                >
                  {isVerifyingPassword ? '확인 중...' : '비밀번호 확인'}
                </button>
              </>
            ) : (
              <>
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-3 mb-6">
                    <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />
                    <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">비밀번호가 확인되었습니다. 새 비밀번호를 입력해 주세요.</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-bold text-gray-400 mb-2 ml-1">새 비밀번호 (8자 이상)</p>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border border-emerald-200 dark:border-emerald-900/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold"
                        placeholder="••••••••"
                        autoFocus
                      />
                    </div>
                    
                    <div>
                      <p className="text-xs font-bold text-gray-400 mb-2 ml-1">새 비밀번호 확인</p>
                      <input
                        type="password"
                        value={passwordConfirm}
                        onChange={(e) => setPasswordConfirm(e.target.value)}
                        className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border border-emerald-200 dark:border-emerald-900/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold"
                        placeholder="••••••••"
                      />
                    </div>

                    <button
                      onClick={handleUpdatePassword}
                      disabled={isUpdatingPassword || !password || password !== passwordConfirm}
                      className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-emerald-600 disabled:opacity-50 transition-all"
                    >
                      {isUpdatingPassword ? '변경 중...' : '새 비밀번호로 업데이트'}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      </div>

      {/* Security Info */}
      <div className="mt-12 flex items-start gap-3 p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
        <AlertCircle className="text-indigo-500 shrink-0 mt-0.5" size={18} />
        <p className="text-xs font-medium text-indigo-700 dark:text-indigo-300 leading-relaxed">
          보안을 위해 주기적인 비밀번호 변경을 권장합니다. 비밀번호 변경 시 즉시 반영되며, 다음 로그인부터 새 비밀번호가 적용됩니다.
        </p>
      </div>
    </div>
  )
}
