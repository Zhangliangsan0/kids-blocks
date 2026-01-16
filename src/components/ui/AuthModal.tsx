import { useState, useCallback, memo } from 'react'
import { 
  X, 
  Mail, 
  Lock, 
  Blocks,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import './AuthModal.css'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export default memo(function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const { signIn, signUp } = useAuth()

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    try {
      if (isLogin) {
        const { error } = await signIn(email, password)
        if (error) {
          setError(error.message)
        } else {
          onClose()
        }
      } else {
        const { error } = await signUp(email, password)
        if (error) {
          setError(error.message)
        } else {
          setMessage('注册成功！请查收验证邮件后登录。')
        }
      }
    } catch {
      setError('操作失败，请重试')
    } finally {
      setLoading(false)
    }
  }, [isLogin, email, password, signIn, signUp, onClose])

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={20} strokeWidth={2.5} />
        </button>
        
        <div className="modal-header">
          <div className="modal-logo">
            <Blocks size={36} strokeWidth={2.5} />
          </div>
          <h2>{isLogin ? '欢迎回来！' : '加入我们！'}</h2>
          <p className="modal-subtitle">
            {isLogin ? '登录保存你的创作' : '创建账号开始搭建'}
          </p>
        </div>

        <div className="auth-tabs">
          <button 
            className={`tab ${isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(true)}
          >
            登录
          </button>
          <button 
            className={`tab ${!isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(false)}
          >
            注册
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>
              <Mail size={16} strokeWidth={2.5} />
              <span>邮箱</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="请输入邮箱"
              required
            />
          </div>
          
          <div className="form-group">
            <label>
              <Lock size={16} strokeWidth={2.5} />
              <span>密码</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
              required
              minLength={6}
            />
          </div>

          {error && (
            <div className="error-message">
              <AlertCircle size={18} strokeWidth={2.5} />
              <span>{error}</span>
            </div>
          )}
          {message && (
            <div className="success-message">
              <CheckCircle size={18} strokeWidth={2.5} />
              <span>{message}</span>
            </div>
          )}

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={20} strokeWidth={2.5} className="spinning" />
                <span>处理中...</span>
              </>
            ) : (
              <span>{isLogin ? '登录' : '注册'}</span>
            )}
          </button>
        </form>
      </div>
    </div>
  )
})
