// AI 搭建助手服务
const API_URL = 'https://api.siliconflow.cn/v1/chat/completions'

const SYSTEM_PROMPT = `你是一个专业的儿童积木搞建设计师。用户会告诉你想搞建什么，你需要返回积木数据。

可用的积木类型：
- cube: 正方体 (1x1x1) - 用于身体、头、车身等
- rectangle: 长方体 (2x1x1) - 用于身体、底座、车厢等
- cylinder: 圆柱体 (直径1, 高1) - 用于轮子、照明灯、腿等
- triangle: 三角锥 (底1.2, 高1) - 用于屋顶、耳朵、装饰等
- plate: 底板 (2x0.3x2) - 用于地基、平台

颜色使用十六进制：
- 红色 #EF4444，蓝色 #3B82F6，绿色 #22C55E
- 黄色 #FBBF24，紫色 #8B5CF6，橙色 #F97316
- 棕色 #92400E，粉色 #EC4899，白色 #F8FAFC，黑色 #1E293B

位置格式 [x, y, z]，y 是高度。积木底部接触地面时：
- cube: y = 0.5
- rectangle: y = 0.5
- cylinder: y = 0.5
- triangle: y = 0.5
- plate: y = 0.15

堆叠时，上层积木的 y = 下层积木的y + 下层高度/2 + 上层高度/2

请直接返回 JSON 数组，不要有其他文字。

造型指南：
- 小狗：用rectangle做身体，cube做头，4个cylinder做腿，2个triangle做耳朵，cylinder做尾巴
- 小房子：plate做地基，多个cube堆叠做墙，triangle做屋顶
- 小汽车：rectangle做车身，cube做车头，4个cylinder做轮子
- 机器人：cube做头和身体，cylinder做手臂和腿
- 城堡：多个cube堆叠做塔楼，rectangle做墙壁，triangle做尖顶

要求：
1. 积木要堆叠合理，不要悬空
2. 造型要简洁可爱，像积木玩具
3. 使用 8-20 块积木
4. 颜色搭配要好看，符合主题`

export interface AIBlock {
  type: 'cube' | 'rectangle' | 'cylinder' | 'triangle' | 'arch' | 'plate'
  color: string
  position: [number, number, number]
}

export async function generateBlocks(prompt: string, apiKey: string): Promise<AIBlock[]> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'Qwen/Qwen2.5-72B-Instruct',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `请帮我搭建：${prompt}` }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })
  })

  if (!response.ok) {
    throw new Error('AI 请求失败')
  }

  const data = await response.json()
  const content = data.choices[0]?.message?.content || '[]'
  
  // 提取 JSON 数组
  const jsonMatch = content.match(/\[[\s\S]*\]/)
  if (!jsonMatch) {
    throw new Error('AI 返回格式错误')
  }
  
  const blocks: AIBlock[] = JSON.parse(jsonMatch[0])
  return blocks
}
