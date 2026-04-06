'use client'

import { useState, useMemo } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { LogIn, UserPlus } from 'lucide-react'

export default function LoginPage() {
  const [isLoginMode, setIsLoginMode] = useState(true)
  const [isVerificationSent, setIsVerificationSent] = useState(false)
  
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
        // 가입 완료 후 인증 메일 확인 안내 화면으로 전환
        setIsVerificationSent(true)
        // 폼 초기화는 안내 화면 이후에 진행됨
        setPassword('')
        setPasswordConfirm('')
        setInviteCode('')
        setNickname('')
      }
    }
    
    setLoading(false)
  }

  // 이메일 서비스 링크 도우미
  const getEmailLink = (emailAddr: string) => {
    const domain = emailAddr.split('@')[1]?.toLowerCase()
    if (!domain) return 'https://mail.google.com'
    
    if (domain.includes('gmail')) return 'https://mail.google.com'
    if (domain.includes('naver')) return 'https://mail.naver.com'
    if (domain.includes('daum') || domain.includes('hanmail') || domain.includes('kakao')) return 'https://mail.kakao.com'
    if (domain.includes('outlook') || domain.includes('hotmail')) return 'https://outlook.live.com'
    if (domain.includes('nate')) return 'https://mail3.nate.com'
    
    return `https://${domain}`
  }

  // 인증 안내 화면 렌더링
  if (isVerificationSent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#C2FF26] dark:bg-gray-950 px-6 font-sans">
        <div className="w-full max-w-sm bg-white dark:bg-gray-900 px-8 py-10 rounded-[2rem] shadow-2xl border border-white/50 dark:border-gray-800 text-center">
          <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <UserPlus className="text-[#DD7553] w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 mb-2">인증 메일 발송 완료!</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 leading-relaxed">
            <span className="font-bold text-[#DD7553]">{email}</span> 주소로<br /> 인증 메일을 보냈습니다. 메일함의 링크를 클릭하여 가입을 완료해 주세요.
          </p>
          
          <div className="space-y-3">
            <a 
              href={getEmailLink(email)} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full py-4 bg-[#DD7553] text-white rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-[#E54833] transition-all shadow-md"
            >
              메일함으로 이동하기
            </a>
            <button
              onClick={() => {
                setIsVerificationSent(false)
                setIsLoginMode(true)
              }}
              className="w-full py-4 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
            >
              로그인 화면으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    )
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

          {!isLoginMode && (
            <div>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value.slice(0, 10))}
                  placeholder="별명 (10자 이내)"
                  className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border rounded-xl focus:outline-none focus:ring-2 transition-all text-gray-900 dark:text-gray-100 font-medium ${nicknameError ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 dark:border-gray-700 focus:ring-[#DD7553]'}`}
                  required
                  maxLength={10}
                />
              {nicknameError && <p className="text-red-500 text-xs mt-1.5 ml-2 font-bold">{nicknameError}</p>}
            </div>
          )}
          
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
