import { memo } from 'react'
import { Palette, Check } from 'lucide-react'
import './ColorPanel.css'

interface ColorOption {
  name: string
  value: string
}

const colorOptions: ColorOption[] = [
  { name: '红色', value: '#EF4444' },
  { name: '橙色', value: '#F97316' },
  { name: '黄色', value: '#FACC15' },
  { name: '绿色', value: '#22C55E' },
  { name: '青色', value: '#06B6D4' },
  { name: '蓝色', value: '#3B82F6' },
  { name: '紫色', value: '#A855F7' },
  { name: '粉色', value: '#EC4899' },
  { name: '棕色', value: '#A78B71' },
  { name: '白色', value: '#FFFFFF' },
]

interface ColorPanelProps {
  selectedColor: string
  onSelectColor: (color: string) => void
}

export default memo(function ColorPanel({ selectedColor, onSelectColor }: ColorPanelProps) {
  return (
    <div className="color-panel clay-panel">
      <div className="panel-header">
        <Palette size={22} strokeWidth={2.5} />
        <span>颜色</span>
      </div>
      <div className="color-grid">
        {colorOptions.map((color) => (
          <button
            key={color.value}
            className={`color-item ${selectedColor === color.value ? 'active' : ''}`}
            style={{ '--color-value': color.value } as React.CSSProperties}
            onClick={() => onSelectColor(color.value)}
            data-tooltip={color.name}
          >
            <div className="color-fill" style={{ backgroundColor: color.value }} />
            {selectedColor === color.value && (
              <span className="check-icon">
                <Check size={16} strokeWidth={3} />
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
})
