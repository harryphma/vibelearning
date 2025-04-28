import { supabase } from '@/lib/supabase'
import { Message, MessageThread } from '@/types/types'

class MessagesService {
  async getAllThreads(): Promise<MessageThread[]> {
    const { data, error } = await supabase
      .from('message_threads')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  async getThreadsByCreator(creatorId: string): Promise<MessageThread[]> {
    const { data, error } = await supabase
      .from('message_threads')
      .select('*')
      .eq('creator_id', creatorId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  async getThreadById(threadId: number): Promise<MessageThread> {
    const { data, error } = await supabase
      .from('message_threads')
      .select('*')
      .eq('id', threadId)
      .single()

    if (error) throw error
    return data
  }

  async createThread(threadData: Partial<MessageThread>): Promise<MessageThread> {
    const { data, error } = await supabase
      .from('message_threads')
      .insert([threadData])
      .select()
      .single()

    if (error) throw error
    return data
  }

  async updateThread(threadId: number, threadData: Partial<MessageThread>): Promise<MessageThread> {
    const { data, error } = await supabase
      .from('message_threads')
      .update(threadData)
      .eq('id', threadId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async deleteThread(threadId: number): Promise<void> {
    // First delete all messages in this thread
    await this.deleteMessagesByThread(threadId)

    // Then delete the thread itself
    const { error } = await supabase.from('message_threads').delete().eq('id', threadId)

    if (error) throw error
  }

  async getMessagesByThread(threadId: number): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data
  }

  async getMessageById(messageId: number): Promise<Message> {
    const { data, error } = await supabase.from('messages').select('*').eq('id', messageId).single()

    if (error) throw error
    return data
  }

  async createMessage(messageData: Partial<Message>): Promise<Message> {
    const { data, error } = await supabase.from('messages').insert([messageData]).select().single()

    if (error) throw error
    return data
  }

  async updateMessage(messageId: number, messageData: Partial<Message>): Promise<Message> {
    const { data, error } = await supabase
      .from('messages')
      .update(messageData)
      .eq('id', messageId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async deleteMessage(messageId: number): Promise<void> {
    const { error } = await supabase.from('messages').delete().eq('id', messageId)

    if (error) throw error
  }

  async deleteMessagesByThread(threadId: number): Promise<void> {
    const { error } = await supabase.from('messages').delete().eq('thread_id', threadId)

    if (error) throw error
  }
}

export const messagesService = new MessagesService()
