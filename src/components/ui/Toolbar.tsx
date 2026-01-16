import { memo } from 'react'
import { 
  Box, 
  RectangleHorizontal, 
  Circle, 
  Triangle, 
  Sparkles,
  Square
} from 'lucide-react'
import type { BlockType } from '../../types'
import './Toolbar.css'

interface BlockOption {
  type: BlockType
  name: string
  icon: React.ReactNode
  color: string
}

const blockOptions: BlockOption[] = [
  { type: 'cube', name: '方块', icon: <Box size={28} strokeWidth={2.5} />, color: '#EF4444' },
  { type: 'rectangle', name: '长条', icon: <RectangleHorizontal size={28} strokeWidth={2.5} />, color: '#F97316' },
  { type: 'cylinder', name: '圆柱', icon: <Circle size={28} strokeWidth={2.5} />, color: '#22C55E' },
  { type: 'triangle', name: '三角', icon: <Triangle size={28} strokeWidth={2.5} />, color: '#3B82F6' },
  { type: 'arch', name: '拱门', icon: <Sparkles size={28} strokeWidth={2.5} />, color: '#A855F7' },
  { type: 'plate', name: '平板', icon: <Square size={28} strokeWidth={2.5} />, color: '#06B6D4' },
]

interface ToolbarProps {
  selectedBlock: BlockType
  onSelectBlock: (type: BlockType) => void
}

export default memo(function Toolbar({ selectedBlock, onSelectBlock }: ToolbarProps) {
  return (
    <div className="toolbar clay-panel">
      <div className="panel-header">
        <Box size={22} strokeWidth={2.5} />
        <span>积木</span>
      </div>
      <div className="block-list">
        {blockOptions.map((block) => (
          <button
            key={block.type}
            className={`block-item ${selectedBlock === block.type ? 'active' : ''}`}
            onClick={() => onSelectBlock(block.type)}
            data-tooltip={block.name}
            style={{ '--block-color': block.color } as React.CSSProperties}
          >
            <div className="block-icon">
              {block.icon}
            </div>
            <span className="block-name">{block.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
})
