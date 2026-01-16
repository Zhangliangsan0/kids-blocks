import { memo, useMemo, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import type { ThreeEvent } from '@react-three/fiber'
import { OrbitControls, Grid } from '@react-three/drei'
import { MousePointer, Trash2 } from 'lucide-react'
import type { BlockData, BlockType } from '../../types'
import './Scene3D.css'

interface Scene3DProps {
  blocks: BlockData[]
  selectedColor: string
  selectedBlockType: BlockType
  onAddBlock: (position: [number, number, number]) => void
  onRemoveBlock: (id: string) => void
}

// 获取积木高度
const getBlockHeight = (type: BlockType): number => {
  switch (type) {
    case 'plate': return 0.3
    default: return 1
  }
}

// 单个积木组件
const Block = memo(function Block({ 
  data, 
  onRemove,
  onStackClick,
  selectedType
}: { 
  data: BlockData
  onRemove: () => void
  onStackClick: (position: [number, number, number]) => void
  selectedType: BlockType
}) {
  const [hovered, setHovered] = useState(false)
  const pointerDownPos = useRef<{ x: number; y: number } | null>(null)

  const geometry = useMemo(() => {
    switch (data.type) {
      case 'cube':
        return <boxGeometry args={[1, 1, 1]} />
      case 'rectangle':
        return <boxGeometry args={[2, 1, 1]} />
      case 'cylinder':
        return <cylinderGeometry args={[0.5, 0.5, 1, 16]} />
      case 'triangle':
        return <coneGeometry args={[0.6, 1, 4]} />
      case 'arch':
        return <torusGeometry args={[0.5, 0.2, 8, 16, Math.PI]} />
      case 'plate':
        return <boxGeometry args={[2, 0.3, 2]} />
      default:
        return <boxGeometry args={[1, 1, 1]} />
    }
  }, [data.type])

  // 记录按下位置，用于区分拖动和点击
  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    pointerDownPos.current = { x: e.nativeEvent.clientX, y: e.nativeEvent.clientY }
  }

  // 点击积木顶部堆叠新积木
  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    
    // 检查是否是拖动（移动超过5像素认为是拖动）
    if (pointerDownPos.current) {
      const dx = Math.abs(e.nativeEvent.clientX - pointerDownPos.current.x)
      const dy = Math.abs(e.nativeEvent.clientY - pointerDownPos.current.y)
      if (dx > 5 || dy > 5) {
        pointerDownPos.current = null
        return // 是拖动，不处理点击
      }
    }
    pointerDownPos.current = null
    
    // 计算堆叠位置（当前积木顶部）
    const stackHeight = data.position[1] + getBlockHeight(data.type) / 2 + getBlockHeight(selectedType) / 2
    onStackClick([data.position[0], stackHeight, data.position[2]])
  }

  return (
    <mesh 
      position={data.position}
      onPointerDown={handlePointerDown}
      onClick={handleClick}
      onDoubleClick={(e) => {
        e.stopPropagation()
        onRemove()
      }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {geometry}
      <meshStandardMaterial 
        color={hovered ? '#FFD93D' : data.color} 
        roughness={0.4}
        emissive={hovered ? '#FFD93D' : '#000000'}
        emissiveIntensity={hovered ? 0.1 : 0}
      />
    </mesh>
  )
})

// 可点击的地面
const Ground = memo(function Ground({ 
  onAddBlock,
  selectedType
}: { 
  onAddBlock: (position: [number, number, number]) => void
  selectedType: BlockType
}) {
  const pointerDownPos = useRef<{ x: number; y: number } | null>(null)

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    pointerDownPos.current = { x: e.nativeEvent.clientX, y: e.nativeEvent.clientY }
  }

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    
    // 检查是否是拖动（移动超过5像素认为是拖动）
    if (pointerDownPos.current) {
      const dx = Math.abs(e.nativeEvent.clientX - pointerDownPos.current.x)
      const dy = Math.abs(e.nativeEvent.clientY - pointerDownPos.current.y)
      if (dx > 5 || dy > 5) {
        pointerDownPos.current = null
        return // 是拖动，不处理点击
      }
    }
    pointerDownPos.current = null
    
    const point = e.point
    const x = Math.round(point.x)
    const z = Math.round(point.z)
    const y = getBlockHeight(selectedType) / 2
    onAddBlock([x, y, z])
  }

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0, 0]}
      onPointerDown={handlePointerDown}
      onClick={handleClick}
    >
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial color="#F0F4F8" transparent opacity={0.6} />
    </mesh>
  )
})

// 场景内容组件
function SceneContent({ 
  blocks, 
  selectedType,
  onAddBlock, 
  onRemoveBlock
}: {
  blocks: BlockData[]
  selectedType: BlockType
  onAddBlock: (position: [number, number, number]) => void
  onRemoveBlock: (id: string) => void
}) {
  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 15, 10]} intensity={0.6} />

      <Grid
        args={[20, 20]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#94A3B8"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#64748B"
        fadeDistance={25}
        position={[0, 0.01, 0]}
      />

      <Ground onAddBlock={onAddBlock} selectedType={selectedType} />

      {blocks.map((block) => (
        <Block
          key={block.id}
          data={block}
          onRemove={() => onRemoveBlock(block.id)}
          onStackClick={onAddBlock}
          selectedType={selectedType}
        />
      ))}

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={25}
        maxPolarAngle={Math.PI / 2.1}
        enableDamping={false}
      />
    </>
  )
}

export default function Scene3D({ 
  blocks, 
  selectedBlockType,
  selectedColor,
  onAddBlock, 
  onRemoveBlock
}: Scene3DProps) {
  // selectedColor 保留用于未来扩展
  void selectedColor
  
  return (
    <div className="scene-container">
      <Canvas
        camera={{ position: [8, 8, 8], fov: 50 }}
        style={{ background: 'linear-gradient(180deg, #E0F2FE 0%, #DBEAFE 100%)' }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
      >
        <SceneContent
          blocks={blocks}
          selectedType={selectedBlockType}
          onAddBlock={onAddBlock}
          onRemoveBlock={onRemoveBlock}
        />
      </Canvas>

      <div className="scene-tips">
        <span><MousePointer size={14} /> 点击放置/堆叠</span>
        <span>|</span>
        <span><Trash2 size={14} /> 双击删除</span>
      </div>
    </div>
  )
}
