import { useState, useCallback, useMemo } from 'react'
import Navbar from '../components/ui/Navbar'
import Toolbar from '../components/ui/Toolbar'
import ColorPanel from '../components/ui/ColorPanel'
import Scene3D from '../components/three/Scene3D'
import StatsPanel from '../components/ui/StatsPanel'
import AuthModal from '../components/ui/AuthModal'
import AIAssistant from '../components/ui/AIAssistant'
import { useAuth } from '../contexts/AuthContext'
import { saveWork, updateWork } from '../lib/works'
import { generateBlocks } from '../lib/ai'
import type { BlockType, BlockData, Work } from '../types'
import './BuilderPage.css'

const AI_API_KEY = import.meta.env.VITE_AI_API_KEY || ''

export default function BuilderPage() {
  const { user } = useAuth()
  
  const [selectedBlock, setSelectedBlock] = useState<BlockType>('cube')
  const [selectedColor, setSelectedColor] = useState('#EF4444')
  const [blocks, setBlocks] = useState<BlockData[]>([])
  const [history, setHistory] = useState<BlockData[][]>([[]])
  const [historyIndex, setHistoryIndex] = useState(0)
  
  // 当前编辑的作品（null 表示新作品）
  const [currentWork, setCurrentWork] = useState<Work | null>(null)
  
  // 是否有未保存的更改
  const hasUnsavedChanges = useMemo(() => {
    if (currentWork === null) {
      return blocks.length > 0
    }
    return JSON.stringify(blocks) !== JSON.stringify(currentWork.blocks)
  }, [blocks, currentWork])
  
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [saveTitle, setSaveTitle] = useState('')
  const [saving, setSaving] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)

  const generateId = () => Math.random().toString(36).substring(2, 11)

  const handleAddBlock = useCallback((position: [number, number, number]) => {
    setBlocks(prev => {
      const newBlock: BlockData = {
        id: generateId(),
        type: selectedBlock,
        position,
        color: selectedColor,
      }
      const newBlocks = [...prev, newBlock]
      
      setHistory(h => {
        const newHistory = h.slice(0, historyIndex + 1)
        newHistory.push(newBlocks)
        return newHistory
      })
      setHistoryIndex(i => i + 1)
      
      return newBlocks
    })
  }, [selectedBlock, selectedColor, historyIndex])

  const handleRemoveBlock = useCallback((id: string) => {
    setBlocks(prev => {
      const newBlocks = prev.filter(b => b.id !== id)
      
      setHistory(h => {
        const newHistory = h.slice(0, historyIndex + 1)
        newHistory.push(newBlocks)
        return newHistory
      })
      setHistoryIndex(i => i + 1)
      
      return newBlocks
    })
  }, [historyIndex])

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(i => i - 1)
      setBlocks(history[historyIndex - 1])
    }
  }, [historyIndex, history])

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(i => i + 1)
      setBlocks(history[historyIndex + 1])
    }
  }, [historyIndex, history])

  const handleClear = useCallback(() => {
    if (blocks.length === 0) return
    setBlocks([])
    setHistory(h => {
      const newHistory = h.slice(0, historyIndex + 1)
      newHistory.push([])
      return newHistory
    })
    setHistoryIndex(i => i + 1)
  }, [blocks.length, historyIndex])

  // 新建作品
  const handleNew = useCallback(() => {
    if (blocks.length > 0) {
      if (!confirm('新建作品将清空当前内容，确定吗？')) {
        return
      }
    }
    setBlocks([])
    setHistory([[]])
    setHistoryIndex(0)
    setCurrentWork(null)
  }, [blocks.length])

  // 保存按钮点击
  const handleSave = useCallback(async () => {
    if (!user) {
      setShowAuthModal(true)
      return
    }
    if (blocks.length === 0) {
      alert('请先搭建一些积木再保存！')
      return
    }
    
    // 如果是已有作品，直接更新
    if (currentWork) {
      setSaving(true)
      const { error } = await updateWork(currentWork.id, { blocks })
      setSaving(false)
      
      if (error) {
        alert('保存失败：' + error.message)
      } else {
        // 更新本地状态
        setCurrentWork({ ...currentWork, blocks })
        alert('保存成功！')
      }
    } else {
      // 新作品，弹窗输入名称
      setShowSaveModal(true)
    }
  }, [user, blocks, currentWork])

  // 另存为
  const handleSaveAs = useCallback(() => {
    if (!user) {
      setShowAuthModal(true)
      return
    }
    if (blocks.length === 0) {
      alert('请先搭建一些积木再保存！')
      return
    }
    setSaveTitle(currentWork ? currentWork.title + ' (副本)' : '')
    setShowSaveModal(true)
  }, [user, blocks, currentWork])

  // 确认保存新作品
  const handleConfirmSave = useCallback(async () => {
    if (!saveTitle.trim()) {
      alert('请输入作品名称')
      return
    }
    setSaving(true)
    const { data, error } = await saveWork(saveTitle, blocks)
    setSaving(false)
    
    if (error) {
      alert('保存失败：' + error.message)
    } else {
      alert('保存成功！🎉')
      setShowSaveModal(false)
      setSaveTitle('')
      // 设置为当前作品
      if (data) {
        setCurrentWork(data)
      }
    }
  }, [saveTitle, blocks])

  // 加载作品
  const handleLoadWork = useCallback((work: Work) => {
    if (blocks.length > 0) {
      if (!confirm('加载作品将覆盖当前内容，确定吗？')) {
        return
      }
    }
    setBlocks(work.blocks)
    setHistory([work.blocks])
    setHistoryIndex(0)
    setCurrentWork(work)
  }, [blocks.length])

  // AI 生成积木
  const handleAIGenerate = useCallback(async (prompt: string) => {
    if (!AI_API_KEY) {
      alert('AI 功能未配置，请设置 VITE_AI_API_KEY')
      return
    }
    
    setAiLoading(true)
    try {
      const aiBlocks = await generateBlocks(prompt, AI_API_KEY)
      const newBlocks: BlockData[] = aiBlocks.map(b => ({
        id: generateId(),
        type: b.type,
        color: b.color,
        position: b.position
      }))
      
      setBlocks(newBlocks)
      setHistory(h => {
        const newHistory = h.slice(0, historyIndex + 1)
        newHistory.push(newBlocks)
        return newHistory
      })
      setHistoryIndex(i => i + 1)
    } catch (error) {
      alert('AI 生成失败，请重试')
      console.error(error)
    } finally {
      setAiLoading(false)
    }
  }, [historyIndex])

  return (
    <div className="builder-page">
      <Navbar
        currentWorkName={currentWork?.title}
        hasUnsavedChanges={hasUnsavedChanges}
        onNew={handleNew}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onClear={handleClear}
        onSave={handleSave}
        onSaveAs={handleSaveAs}
        onLoginClick={() => setShowAuthModal(true)}
      />
      
      <main className="main-content">
        <div className="left-panel">
          <Toolbar
            selectedBlock={selectedBlock}
            onSelectBlock={setSelectedBlock}
          />
        </div>

        <div className="center-panel">
          <Scene3D
            blocks={blocks}
            selectedColor={selectedColor}
            selectedBlockType={selectedBlock}
            onAddBlock={handleAddBlock}
            onRemoveBlock={handleRemoveBlock}
          />
        </div>

        <div className="right-panel">
          <ColorPanel
            selectedColor={selectedColor}
            onSelectColor={setSelectedColor}
          />
          <AIAssistant
            onGenerate={handleAIGenerate}
            loading={aiLoading}
          />
          <StatsPanel 
            blockCount={blocks.length} 
            onLoadWork={handleLoadWork}
          />
        </div>
      </main>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      {showSaveModal && (
        <div className="modal-overlay" onClick={() => setShowSaveModal(false)}>
          <div className="save-modal" onClick={e => e.stopPropagation()}>
            <h3>💾 {currentWork ? '另存为新作品' : '保存作品'}</h3>
            <input
              type="text"
              value={saveTitle}
              onChange={e => setSaveTitle(e.target.value)}
              placeholder="给你的作品起个名字吧"
              autoFocus
            />
            <div className="save-modal-actions">
              <button className="cancel-btn" onClick={() => setShowSaveModal(false)}>
                取消
              </button>
              <button className="confirm-btn" onClick={handleConfirmSave} disabled={saving}>
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
