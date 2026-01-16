import { useState, memo } from 'react'
import { Sparkles, Send, Loader2 } from 'lucide-react'
import './AIAssistant.css'

interface AIAssistantProps {
  onGenerate: (prompt: string) => Promise<void>
  loading: boolean
}

export default memo(function AIAssistant({ onGenerate, loading }: AIAssistantProps) {
  const [prompt, setPrompt] = useState('')
  const [expanded, setExpanded] = useState(false)

  const handleSubmit = async () => {
    if (!prompt.trim() || loading) return
    await onGenerate(prompt.trim())
    setPrompt('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const suggestions = [
    '小房子',
    '小汽车', 
    '机器人',
    '城堡',
    '小狗'
  ]

  return (
    <div className={`ai-assistant ${expanded ? 'expanded' : ''}`}>
      <div className="ai-header" onClick={() => setExpanded(!expanded)}>
        <Sparkles size={18} className="ai-icon" />
        <span>AI 助手</span>
      </div>
      
      {expanded && (
        <div className="ai-content">
          <div className="ai-suggestions">
            {suggestions.map((s) => (
              <button
                key={s}
                className="suggestion-btn"
                onClick={() => setPrompt(s)}
                disabled={loading}
              >
                {s}
              </button>
            ))}
          </div>
          
          <div className="ai-input-wrapper">
            <input
              type="text"
              className="ai-input"
              placeholder="想搭建什么？"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <button 
              className="ai-submit"
              onClick={handleSubmit}
              disabled={!prompt.trim() || loading}
            >
              {loading ? (
                <Loader2 size={18} className="spin" />
              ) : (
                <Send size={18} />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
})
