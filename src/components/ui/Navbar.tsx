import { memo } from 'react'
import { 
  Undo2, 
  Redo2, 
  Trash2, 
  Save, 
  LogIn, 
  LogOut,
  User,
  Blocks,
  FilePlus,
  Copy,
  FileText
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import './Navbar.css'

interface NavbarProps {
  currentWorkName?: string
  hasUnsavedChanges?: boolean
  onNew?: () => void
  onSave?: () => void
  onSaveAs?: () => void
  onUndo?: () => void
  onRedo?: () => void
  onClear?: () => void
  onLoginClick?: () => void
}

export default memo(function Navbar({ 
  currentWorkName,
  hasUnsavedChanges,
  onNew,
  onSave, 
  onSaveAs,
  onUndo, 
  onRedo, 
  onClear, 
  onLoginClick 
}: NavbarProps) {
  const { user, signOut } = useAuth()

  const handleSignOut = () => {
    if (hasUnsavedChanges) {
      if (!confirm('你有未保存的内容，确定要退出吗？')) {
        return
      }
    }
    signOut()
  }

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <div className="logo">
          <div className="logo-icon">
            <Blocks size={32} strokeWidth={2.5} />
          </div>
          <span className="logo-text">积木乐园</span>
        </div>
        
        {/* 当前作品名称 */}
        {currentWorkName && (
          <div className="current-work">
            <FileText size={16} strokeWidth={2.5} />
            <span className="work-name">{currentWorkName}</span>
          </div>
        )}
      </div>
      
      <div className="navbar-center">
        <div className="action-buttons">
          <button className="action-btn" onClick={onNew} data-tooltip="新建作品">
            <FilePlus size={20} strokeWidth={2.5} />
            <span className="btn-text">新建</span>
          </button>
          <button className="action-btn" onClick={onUndo} data-tooltip="撤销">
            <Undo2 size={20} strokeWidth={2.5} />
            <span className="btn-text">撤销</span>
          </button>
          <button className="action-btn" onClick={onRedo} data-tooltip="重做">
            <Redo2 size={20} strokeWidth={2.5} />
            <span className="btn-text">重做</span>
          </button>
          <button className="action-btn danger" onClick={onClear} data-tooltip="清空场景">
            <Trash2 size={20} strokeWidth={2.5} />
            <span className="btn-text">清空</span>
          </button>
          <div className="btn-divider" />
          <button className="action-btn cta" onClick={onSave} data-tooltip={currentWorkName ? "保存更新" : "保存作品"}>
            <Save size={20} strokeWidth={2.5} />
            <span className="btn-text">保存</span>
          </button>
          {currentWorkName && (
            <button className="action-btn" onClick={onSaveAs} data-tooltip="另存为新作品">
              <Copy size={20} strokeWidth={2.5} />
              <span className="btn-text">另存为</span>
            </button>
          )}
        </div>
      </div>
      
      <div className="navbar-right">
        {user ? (
          <div className="user-info">
            <div className="user-badge">
              <User size={18} strokeWidth={2.5} />
              <span className="user-name">{user.email?.split('@')[0]}</span>
            </div>
            <button className="logout-btn" onClick={handleSignOut}>
              <LogOut size={18} strokeWidth={2.5} />
              <span>退出</span>
            </button>
          </div>
        ) : (
          <button className="login-btn" onClick={onLoginClick}>
            <LogIn size={20} strokeWidth={2.5} />
            <span>登录</span>
          </button>
        )}
      </div>
    </nav>
  )
})
