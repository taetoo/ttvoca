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
    <div className="flex flex-col items-center justify-center min-h-screen bg-bg-base transition-colors px-6 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      <div className="w-full max-w-sm bg-bg-surface p-10 rounded-xl border border-border-color shadow-sm transition-all">
        <div className="flex flex-col items-center mb-10">
          <h1 className="text-4xl font-black text-accent-neon-text tracking-tighter mb-2 drop-shadow-sm">TTVOCA</h1>
          <p className="text-text-secondary font-black text-center text-[10px] uppercase tracking-[0.3em] opacity-60">
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
                className={`w-full px-4 py-4 bg-bg-base border rounded-xl focus:outline-none focus:ring-2 transition-all text-text-primary font-bold text-lg ${inviteCodeError ? 'border-accent-terra focus:ring-accent-terra/20' : 'border-border-color focus:ring-accent-neon/20'}`}
                required
              />
              {inviteCodeError && <p className="text-accent-terra text-[10px] mt-2 ml-1 font-black uppercase tracking-tight">{inviteCodeError}</p>}
            </div>
          )}

          <div>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일"
              className={`w-full px-4 py-4 bg-bg-base border rounded-xl focus:outline-none focus:ring-2 transition-all text-text-primary font-bold text-lg ${!isLoginMode && emailError ? 'border-accent-terra focus:ring-accent-terra/20' : 'border-border-color focus:ring-accent-neon/20'}`}
              required
            />
            {!isLoginMode && emailError && <p className="text-accent-terra text-[10px] mt-2 ml-1 font-black uppercase tracking-tight">{emailError}</p>}
          </div>

          {!isLoginMode && (
            <div>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value.slice(0, 10))}
                  placeholder="별명 (10자 이내)"
                  className={`w-full px-4 py-4 bg-bg-base border rounded-xl focus:outline-none focus:ring-2 transition-all text-text-primary font-bold text-lg ${nicknameError ? 'border-accent-terra focus:ring-accent-terra/20' : 'border-border-color focus:ring-accent-neon/20'}`}
                  required
                  maxLength={10}
                />
              {nicknameError && <p className="text-accent-terra text-[10px] mt-2 ml-1 font-black uppercase tracking-tight">{nicknameError}</p>}
            </div>
          )}
          
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호"
              className={`w-full px-4 py-4 bg-bg-base border rounded-xl focus:outline-none focus:ring-2 transition-all text-text-primary font-bold text-lg ${!isLoginMode && passwordError ? 'border-accent-terra focus:ring-accent-terra/20' : 'border-border-color focus:ring-accent-neon/20'}`}
              required
            />
            {!isLoginMode && passwordError && <p className="text-accent-terra text-[10px] mt-2 ml-1 font-black leading-snug break-keep uppercase tracking-tight">{passwordError}</p>}
          </div>

          {!isLoginMode && (
            <div>
              <input
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="비밀번호 확인"
                className={`w-full px-4 py-4 bg-bg-base border rounded-xl focus:outline-none focus:ring-2 transition-all text-text-primary font-bold text-lg ${passwordConfirmError ? 'border-accent-terra focus:ring-accent-terra/20' : 'border-border-color focus:ring-accent-neon/20'}`}
                required
              />
              {passwordConfirmError && <p className="text-accent-terra text-[10px] mt-2 ml-1 font-black uppercase tracking-tight">{passwordConfirmError}</p>}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || (!isLoginMode && (!!emailError || !!passwordError || !!passwordConfirmError || !!inviteCodeError))}
            className="w-full py-5 bg-accent-neon text-black rounded-xl font-black text-lg flex justify-center items-center gap-2 hover:brightness-105 active:scale-95 transition-all shadow-sm disabled:opacity-50 mt-8"
          >
            {loading ? '처리 중...' : isLoginMode ? (
              <>
                <LogIn size={20} strokeWidth={2.5} />
                로그인
              </>
            ) : (
              <>
                <UserPlus size={20} strokeWidth={2.5} />
                회원가입
              </>
            )}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-border-color/50 text-center">
          <button
            type="button"
            onClick={() => setIsLoginMode(!isLoginMode)}
            className="text-[10px] font-black text-text-secondary hover:text-text-primary uppercase tracking-widest transition-colors"
          >
            {isLoginMode ? '계정이 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}
          </button>
        </div>
      </div>
    </div>
  )
}
