import { useEffect, useState, useCallback, memo } from 'react'
import { 
  BarChart3, 
  Box, 
  FolderOpen, 
  Lock, 
  Loader2, 
  Sparkles,
  Image,
  Trash2,
  RefreshCw
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { getUserWorks, deleteWork } from '../../lib/works'
import type { Work } from '../../types'
import './StatsPanel.css'

interface StatsPanelProps {
  blockCount: number
  onLoadWork?: (work: Work) => void
}

export default memo(function StatsPanel({ blockCount, onLoadWork }: StatsPanelProps) {
  const { user } = useAuth()
  const [works, setWorks] = useState<Work[]>([])
  const [loading, setLoading] = useState(false)

  const loadWorks = useCallback(async () => {
    if (!user) {
      setWorks([])
      return
    }
    setLoading(true)
    const { data } = await getUserWorks()
    setWorks(data)
    setLoading(false)
  }, [user])

  useEffect(() => {
    let cancelled = false
    
    const fetchWorks = async () => {
      if (!user) {
        setWorks([])
        return
      }
      setLoading(true)
      const { data } = await getUserWorks()
      if (!cancelled) {
        setWorks(data)
        setLoading(false)
      }
    }
    
    fetchWorks()
    
    return () => {
      cancelled = true
    }
  }, [user])

  const handleDelete = useCallback(async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('确定要删除这个作品吗？')) {
      await deleteWork(id)
      loadWorks()
    }
  }, [loadWorks])

  return (
    <div className="stats-panel clay-panel">
      <div className="panel-header">
        <BarChart3 size={22} strokeWidth={2.5} />
        <span>统计</span>
      </div>
      <div className="stats-content">
        <div className="stat-item">
          <div className="stat-icon-wrap">
            <Box size={20} strokeWidth={2.5} />
          </div>
          <span className="stat-label">积木数量</span>
          <span className="stat-value">{blockCount}</span>
        </div>
      </div>
      
      <div className="section-divider" />
      
      <div className="panel-header">
        <FolderOpen size={22} strokeWidth={2.5} />
        <span>我的作品</span>
        {user && (
          <button className="refresh-btn" onClick={loadWorks} disabled={loading}>
            <RefreshCw size={16} strokeWidth={2.5} className={loading ? 'spinning' : ''} />
          </button>
        )}
      </div>
      <div className="works-list">
        {!user ? (
          <div className="work-item empty">
            <div className="empty-icon">
              <Lock size={28} strokeWidth={2.5} />
            </div>
            <span>登录后查看</span>
          </div>
        ) : loading ? (
          <div className="work-item empty">
            <div className="empty-icon spinning">
              <Loader2 size={28} strokeWidth={2.5} />
            </div>
            <span>加载中...</span>
          </div>
        ) : works.length === 0 ? (
          <div className="work-item empty">
            <div className="empty-icon">
              <Sparkles size={28} strokeWidth={2.5} />
            </div>
            <span>还没有作品</span>
          </div>
        ) : (
          works.map((work) => (
            <div 
              key={work.id} 
              className="work-item clickable"
              onClick={() => onLoadWork?.(work)}
            >
              <div className="work-icon-wrap">
                <Image size={18} strokeWidth={2.5} />
              </div>
              <div className="work-info">
                <span className="work-title">{work.title}</span>
                <span className="work-blocks">{work.blocks.length} 块积木</span>
              </div>
              <button 
                className="work-delete"
                onClick={(e) => handleDelete(work.id, e)}
              >
                <Trash2 size={16} strokeWidth={2.5} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
})
