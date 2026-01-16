import { supabase } from './supabase'
import type { BlockData, Work } from '../types'

// 保存作品
export async function saveWork(title: string, blocks: BlockData[], isPublic = false): Promise<{ data: Work | null; error: Error | null }> {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { data: null, error: new Error('请先登录') }
  }

  const { data, error } = await supabase
    .from('works')
    .insert({
      user_id: user.id,
      title,
      blocks,
      is_public: isPublic,
    })
    .select()
    .single()

  return { data: data as Work | null, error: error as Error | null }
}

// 更新作品
export async function updateWork(id: string, updates: { title?: string; blocks?: BlockData[]; is_public?: boolean }): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from('works')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)

  return { error: error as Error | null }
}

// 删除作品
export async function deleteWork(id: string): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from('works')
    .delete()
    .eq('id', id)

  return { error: error as Error | null }
}

// 获取用户的作品列表
export async function getUserWorks(): Promise<{ data: Work[]; error: Error | null }> {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { data: [], error: new Error('请先登录') }
  }

  const { data, error } = await supabase
    .from('works')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  return { data: (data as Work[]) || [], error: error as Error | null }
}

// 获取单个作品
export async function getWork(id: string): Promise<{ data: Work | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('works')
    .select('*')
    .eq('id', id)
    .single()

  return { data: data as Work | null, error: error as Error | null }
}

// 获取公开作品（作品广场）
export async function getPublicWorks(): Promise<{ data: Work[]; error: Error | null }> {
  const { data, error } = await supabase
    .from('works')
    .select('*')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(50)

  return { data: (data as Work[]) || [], error: error as Error | null }
}
