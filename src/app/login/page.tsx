'use client'

import { useState, useMemo } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { LogIn, UserPlus } from 'lucide-react'

export default function LoginPage() {
  const [isLoginMode, setIsLoginMode] = useState(true)
  
  const [email, setEmail] = useState('')
  const [nickname, setNickname] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // 실시간 유효성 검사 메시지 도출
  const inviteCodeError = useMemo(() => {
    if (!inviteCode) return ''
    const correctInviteCode = process.env.NEXT_PUBLIC_INVITE_CODE
    return inviteCode === correctInviteCode ? '' : '초대 코드가 올바르지 않습니다.'
  }, [inviteCode])

  const emailError = useMemo(() => {
    if (!email) return ''
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email) ? '' : '올바른 이메일 형식이 아닙니다.'
  }, [email])

  const passwordError = useMemo(() => {
    if (!password) return ''
    // 소문자, 숫자, 특수문자 포함 8~20자리
    const passwordRegex = /^(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+={}\[\]:;"'<>,.?/\\|`~-]).{8,20}$/
    if (password.length < 8 || password.length > 20) return '비밀번호는 8자리 이상 20자리 이하이어야 합니다.'
    return passwordRegex.test(password) 
      ? '' 
      : '비밀번호는 소문자, 숫자, 특수문자를 모두 포함해야 합니다.'
  }, [password])

  const nicknameError = useMemo(() => {
    if (!nickname) return ''
    if (nickname.length < 2) return '별명은 2자리 이상이어야 합니다.'
    if (nickname.length > 10) return '별명은 10자리 이내이어야 합니다.'
    return ''
  }, [nickname])

  const passwordConfirmError = useMemo(() => {
    if (!passwordConfirm) return ''
    return password === passwordConfirm ? '' : '비밀번호 확인이 일치하지 않습니다.'
  }, [password, passwordConfirm])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 가입 모드일 때 에러가 남아 있거나 빈 값이면 전송 차단
    if (!isLoginMode) {
      if (emailError || passwordError || passwordConfirmError || inviteCodeError || nicknameError) return
      if (!email || !password || !passwordConfirm || !inviteCode || !nickname) {
        alert('모든 필드를 올바르게 입력해주세요.')
        return
      }
    }
    
    setLoading(true)

    if (isLoginMode) {
      // 1. 로그인 모드
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        alert('로그인 실패: 이메일 또는 비밀번호를 확인해주세요.')
      } else {
        router.push('/settings')
      }
    } else {
      // 2. 회원가입 모드 (트리거가 프로필을 생성하도록 metadata 포함)
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nickname: nickname
          }
        }
      })
      
      if (signUpError) {
        alert('회원가입 실패: ' + signUpError.message)
      } else {
        alert('가입이 완료되었습니다! 동일한 계정으로 로그인해주세요.')
        // 로그인 상태로 폼 변경 및 초기화
        setIsLoginMode(true)
        setPassword('')
        setPasswordConfirm('')
        setInviteCode('')
        setNickname('')
      }
    }
    
    setLoading(false)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-primary transition-colors px-6 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      <div className="w-full max-w-sm bg-surface p-10 rounded-[2.5rem] border-4 border-foreground shadow-[16px_16px_0px_0px_#1E1E1E] dark:shadow-none transition-all">
        <div className="flex flex-col items-center mb-12">
          <img 
            src="/logo.png" 
            alt="TTVOCA Logo" 
            className="w-48 h-auto object-contain mb-4 select-none drop-shadow-sm transition-transform hover:scale-105 active:scale-95" 
          />
          <p className="text-secondary font-black text-center text-[11px] uppercase tracking-[0.3em] opacity-90">
            Fast words, High scores
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLoginMode && (
            <div>
              <input
                type="password"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="관리자 초대 코드"
                className={`w-full px-4 py-4 bg-white dark:bg-gray-800 border-2 rounded-2xl focus:outline-none focus:ring-4 transition-all text-foreground font-black text-lg ${inviteCodeError ? 'border-unknown focus:ring-unknown/20' : 'border-foreground focus:ring-primary/20'}`}
                required
              />
              {inviteCodeError && <p className="text-unknown text-xs mt-2 ml-2 font-black uppercase tracking-tight">{inviteCodeError}</p>}
            </div>
          )}

          <div>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일"
              className={`w-full px-4 py-4 bg-white dark:bg-gray-800 border-2 rounded-2xl focus:outline-none focus:ring-4 transition-all text-foreground font-black text-lg ${!isLoginMode && emailError ? 'border-unknown focus:ring-unknown/20' : 'border-foreground focus:ring-primary/20'}`}
              required
            />
            {!isLoginMode && emailError && <p className="text-unknown text-xs mt-2 ml-2 font-black uppercase tracking-tight">{emailError}</p>}
          </div>

          {!isLoginMode && (
            <div>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value.slice(0, 10))}
                  placeholder="별명 (10자 이내)"
                  className={`w-full px-4 py-4 bg-white dark:bg-gray-800 border-2 rounded-2xl focus:outline-none focus:ring-4 transition-all text-foreground font-black text-lg ${nicknameError ? 'border-unknown focus:ring-unknown/20' : 'border-foreground focus:ring-primary/20'}`}
                  required
                  maxLength={10}
                />
              {nicknameError && <p className="text-unknown text-xs mt-2 ml-2 font-black uppercase tracking-tight">{nicknameError}</p>}
            </div>
          )}
          
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호"
              className={`w-full px-4 py-4 bg-white dark:bg-gray-800 border-2 rounded-2xl focus:outline-none focus:ring-4 transition-all text-foreground font-black text-lg ${!isLoginMode && passwordError ? 'border-unknown focus:ring-unknown/20' : 'border-foreground focus:ring-primary/20'}`}
              required
            />
            {!isLoginMode && passwordError && <p className="text-unknown text-xs mt-2 ml-2 font-black leading-snug break-keep uppercase tracking-tight">{passwordError}</p>}
          </div>

          {!isLoginMode && (
            <div>
              <input
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="비밀번호 확인"
                className={`w-full px-4 py-4 bg-white dark:bg-gray-800 border-2 rounded-2xl focus:outline-none focus:ring-4 transition-all text-foreground font-black text-lg ${passwordConfirmError ? 'border-unknown focus:ring-unknown/20' : 'border-foreground focus:ring-primary/20'}`}
                required
              />
              {passwordConfirmError && <p className="text-unknown text-xs mt-2 ml-2 font-black uppercase tracking-tight">{passwordConfirmError}</p>}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || (!isLoginMode && (!!emailError || !!passwordError || !!passwordConfirmError || !!inviteCodeError))}
            className="w-full py-5 bg-primary text-foreground border-4 border-foreground rounded-2xl font-black text-xl flex justify-center items-center gap-3 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none shadow-[6px_6px_0px_0px_#1E1E1E] dark:shadow-none transition-all disabled:opacity-50 mt-8"
          >
            {loading ? '처리 중...' : isLoginMode ? (
              <>
                <LogIn size={24} strokeWidth={3} />
                LOGIN
              </>
            ) : (
              <>
                <UserPlus size={24} strokeWidth={3} />
                SIGN UP
              </>
            )}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t-4 border-foreground/10 text-center">
          <button
            type="button"
            onClick={() => setIsLoginMode(!isLoginMode)}
            className="text-xs font-black text-text-secondary hover:text-secondary uppercase tracking-widest transition-colors"
          >
            {isLoginMode ? 'Need an account? Sign up' : 'Already have an account? Login'}
          </button>
        </div>
      </div>
    </div>
  )
}
