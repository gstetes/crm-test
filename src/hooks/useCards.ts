import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import type { Card, ColumnId } from '../types'

type CreateCardData = Omit<Card, 'id' | 'user_id' | 'position' | 'created_at'>
type UpdateCardData = Partial<Omit<Card, 'id' | 'user_id' | 'created_at'>>

interface UseCardsReturn {
  cards: Card[]
  loading: boolean
  error: string | null
  createCard: (cardData: CreateCardData) => Promise<Card>
  updateCard: (id: string, updates: UpdateCardData) => Promise<Card>
  deleteCard: (id: string) => Promise<void>
  moveCard: (cardId: string, fromColumn: ColumnId, newColumn: ColumnId, newIndex: number, reorderedCards: Card[]) => Promise<void>
  refetch: () => Promise<void>
}

export function useCards(): UseCardsReturn {
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const isSyncing = useRef(false)

  const fetchCards = useCallback(async () => {
    setLoading(true)
    const { data, error: fetchError } = await supabase
      .from('cards')
      .select('*')
      .order('position', { ascending: true })

    if (fetchError) setError(fetchError.message)
    else setCards((data as Card[]) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchCards()

    const channel = supabase
      .channel('cards-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cards' }, () => {
        if (!isSyncing.current) fetchCards()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [fetchCards])

  async function createCard(cardData: CreateCardData): Promise<Card> {
    const { data: { user } } = await supabase.auth.getUser()
    const maxPosition = Math.max(
      0,
      ...cards.filter((c) => c.column === cardData.column).map((c) => c.position)
    )
    const { data, error: createError } = await supabase
      .from('cards')
      .insert({ ...cardData, position: maxPosition + 1, user_id: user?.id })
      .select()
      .single()

    if (createError) throw createError
    const card = data as Card
    setCards((prev) => [...prev, card])
    return card
  }

  async function updateCard(id: string, updates: UpdateCardData): Promise<Card> {
    const { data, error: updateError } = await supabase
      .from('cards')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (updateError) throw updateError
    const card = data as Card
    setCards((prev) => prev.map((c) => (c.id === id ? card : c)))
    return card
  }

  async function deleteCard(id: string): Promise<void> {
    const { error: deleteError } = await supabase.from('cards').delete().eq('id', id)
    if (deleteError) throw deleteError
    setCards((prev) => prev.filter((c) => c.id !== id))
  }

  async function moveCard(cardId: string, fromColumn: ColumnId, newColumn: ColumnId, _newIndex: number, reorderedCards: Card[]): Promise<void> {
    isSyncing.current = true
    setCards(reorderedCards)

    const affectedCards = reorderedCards.filter(
      (c) => c.column === newColumn || c.column === fromColumn
    )

    const updatePromises = affectedCards.map((c) =>
      supabase.from('cards').update({ column: c.column, position: c.position }).eq('id', c.id)
    )

    const results = await Promise.all(updatePromises)

    const moveError = results.find((r) => r.error)?.error
    isSyncing.current = false

    if (moveError) {
      console.error('[moveCard] erro ao salvar:', moveError)
      fetchCards()
      throw moveError
    }
  }

  return { cards, loading, error, createCard, updateCard, deleteCard, moveCard, refetch: fetchCards }
}
