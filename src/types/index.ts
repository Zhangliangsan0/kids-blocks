export type BlockType = 'cube' | 'rectangle' | 'cylinder' | 'triangle' | 'arch' | 'plate'

export interface BlockData {
  id: string
  type: BlockType
  position: [number, number, number]
  rotation: number // Y轴旋转角度 (0, 90, 180, 270)
  color: string
}

export interface Work {
  id: string
  user_id: string
  title: string
  blocks: BlockData[]
  is_public: boolean
  created_at: string
  updated_at: string
}
