import { Deck, Flashcard } from '@/types/types'
import { supabase } from '@/lib/supabase'

class DecksService {
  async getAllDecks(): Promise<Deck[]> {
    const { data, error } = await supabase
      .from('decks')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  async getDeckById(deckId: string): Promise<Deck> {
    const { data, error } = await supabase
      .from('decks')
      .select('*')
      .eq('id', deckId)
      .single()

    if (error) throw error
    return data
  }

  async getDecksByCreator(creatorId: string): Promise<Deck[]> {
    const { data, error } = await supabase
      .from('decks')
      .select('*')
      .eq('creator_id', creatorId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  async getFlashcardsForDeck(deckId: string): Promise<Flashcard[]> {
    const { data, error } = await supabase
      .from('flashcards')
      .select('*')
      .eq('deck_id', deckId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data
  }

  async createDeck(deckData: Partial<Deck>): Promise<Deck> {
    const { data, error } = await supabase
      .from('decks')
      .insert([deckData])
      .select()
      .single()

    if (error) throw error
    return data
  }

  async updateDeck(deckId: string, deckData: Partial<Deck>): Promise<Deck> {
    const { data, error } = await supabase
      .from('decks')
      .update(deckData)
      .eq('id', deckId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async deleteDeck(deckId: string): Promise<void> {
    const { error } = await supabase
      .from('decks')
      .delete()
      .eq('id', deckId)

    if (error) throw error
  }
}

export const decksService = new DecksService() 