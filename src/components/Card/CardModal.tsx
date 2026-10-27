import { useState } from 'react'
import Modal from '../ui/Modal'
import CardForm from './CardForm'
import type { Card, ColumnId } from '../../types'

type CardPayload = Omit<Card, 'id' | 'user_id' | 'position' | 'created_at' | 'column'>

interface CardModalProps {
  isOpen: boolean
  onClose: () => void
  card: Card | null
  defaultColumn: ColumnId | null
  onSave: (payload: CardPayload, column?: ColumnId) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export default function CardModal({ isOpen, onClose, card, defaultColumn, onSave, onDelete }: CardModalProps) {
  const [loading, setLoading] = useState(false)

  const isEditing = !!card

  async function handleSubmit(payload: CardPayload, column?: ColumnId) {
    setLoading(true)
    try {
      await onSave(payload, column)
      onClose()
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!card) return
    if (!confirm('Tem certeza que deseja excluir este card?')) return
    setLoading(true)
    try {
      await onDelete(card.id)
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar card' : 'Novo card'}
    >
      <CardForm
        key={card?.id ?? defaultColumn ?? undefined}
        initialData={card}
        onSubmit={handleSubmit}
        onDelete={isEditing ? handleDelete : null}
        loading={loading}
      />
    </Modal>
  )
}
