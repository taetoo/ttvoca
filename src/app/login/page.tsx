'use client'

import { useState, useMemo } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { LogIn, UserPlus } from 'lucide-react'

export default function LoginPage() {
  const [isLoginMode, setIsLoginMode] = useState(true)
  
  const [email, setEmail] = useState('')
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

  const passwordConfirmError = useMemo(() => {
    if (!passwordConfirm) return ''
    return password === passwordConfirm ? '' : '비밀번호 확인이 일치하지 않습니다.'
  }, [password, passwordConfirm])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 가입 모드일 때 에러가 남아 있거나 빈 값이면 전송 차단
    if (!isLoginMode) {
      if (emailError || passwordError || passwordConfirmError || inviteCodeError) return
      if (!email || !password || !passwordConfirm || !inviteCode) {
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
      // 2. 회원가입 모드
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password
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
      }
    }
    
    setLoading(false)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#C2FF26] dark:bg-gray-950 px-6 font-sans transition-colors">
      <div className="w-full max-w-sm bg-white dark:bg-gray-900 px-8 py-10 rounded-[2rem] shadow-2xl border border-white/50 dark:border-gray-800 transition-colors">
        <div className="flex flex-col items-center mb-10">
          <img 
            src="/logo.png" 
            alt="TTVOCA Logo" 
            className="w-40 sm:w-48 h-auto object-contain mb-4 select-none drop-shadow-sm" 
          />
          <p className="text-[#DD7553] dark:text-[#DD7553] opacity-80 font-bold text-center text-[10px] sm:text-[11px] uppercase tracking-[0.25em] break-keep">
            Fast words, High scores
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLoginMode && (
            <div>
              <input
                type="password"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="관리자 초대 코드"
                className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border rounded-xl focus:outline-none focus:ring-2 transition-all text-gray-900 dark:text-gray-100 font-medium ${inviteCodeError ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 dark:border-gray-700 focus:ring-[#DD7553]'}`}
                required
              />
              {inviteCodeError && <p className="text-red-500 text-xs mt-1.5 ml-2 font-bold">{inviteCodeError}</p>}
            </div>
          )}

          <div>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일"
              className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border rounded-xl focus:outline-none focus:ring-2 transition-all text-gray-900 dark:text-gray-100 font-medium ${!isLoginMode && emailError ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 dark:border-gray-700 focus:ring-[#DD7553]'}`}
              required
            />
            {!isLoginMode && emailError && <p className="text-red-500 text-xs mt-1.5 ml-2 font-bold">{emailError}</p>}
          </div>
          
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호"
              className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border rounded-xl focus:outline-none focus:ring-2 transition-all text-gray-900 dark:text-gray-100 font-medium ${!isLoginMode && passwordError ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 dark:border-gray-700 focus:ring-[#DD7553]'}`}
              required
            />
            {!isLoginMode && passwordError && <p className="text-red-500 text-xs mt-1.5 ml-2 font-bold break-keep">{passwordError}</p>}
          </div>

          {!isLoginMode && (
            <div>
              <input
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="비밀번호 확인"
                className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border rounded-xl focus:outline-none focus:ring-2 transition-all text-gray-900 dark:text-gray-100 font-medium ${passwordConfirmError ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 dark:border-gray-700 focus:ring-[#DD7553]'}`}
                required
              />
              {passwordConfirmError && <p className="text-red-500 text-xs mt-1.5 ml-2 font-bold">{passwordConfirmError}</p>}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || (!isLoginMode && (!!emailError || !!passwordError || !!passwordConfirmError || !!inviteCodeError))}
            className="w-full py-4 bg-[#DD7553] text-white rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-[#E54833] active:bg-[#CC3C28] transition-colors disabled:opacity-50 mt-4 shadow-md"
          >
            {loading ? '처리 중...' : isLoginMode ? (
              <>
                <LogIn size={20} />
                로그인
              </>
            ) : (
              <>
                <UserPlus size={20} />
                가입하기
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-gray-100 dark:border-gray-800 pt-6 transition-colors">
          <button
            type="button"
            onClick={() => setIsLoginMode(!isLoginMode)}
            className="text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-[#DD7553] dark:hover:text-[#DD7553] transition-colors"
          >
            {isLoginMode ? '초대 코드가 있으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}
          </button>
        </div>
      </div>
    </div>
  )
}
