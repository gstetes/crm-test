import { useState } from 'react'
import type { DropResult } from '@hello-pangea/dnd'
import { DragDropContext } from '@hello-pangea/dnd'
import { useAuth } from '../hooks/useAuth'
import { useCards } from '../hooks/useCards'
import BoardColumn from '../components/Board/BoardColumn'
import CardModal from '../components/Card/CardModal'
import Avatar from '../components/ui/Avatar'
import Spinner from '../components/ui/Spinner'
import type { Card, ColumnId } from '../types'

const COLUMNS: ColumnId[] = ['contact', 'contacted', 'proposal', 'waiting_inspection', 'done']

const COLUMN_LABELS: Record<ColumnId, string> = {
  contact:            'Entrar em contato',
  contacted:          'Contato feito',
  proposal:           'Proposta enviada',
  waiting_inspection: 'Ag. Vistoria',
  done:               'Concluído',
}

const COLUMN_DOT: Record<ColumnId, string> = {
  contact:            'bg-emerald-500',
  contacted:          'bg-amber-500',
  proposal:           'bg-blue-500',
  waiting_inspection: 'bg-orange-500',
  done:               'bg-violet-500',
}

interface ModalState {
  open: boolean
  card: Card | null
  column: ColumnId | null
}

export default function Board() {
  const { user, logout } = useAuth()
  const { cards, loading, createCard, updateCard, deleteCard, moveCard } = useCards()

  const [modal, setModal] = useState<ModalState>({ open: false, card: null, column: null })
  const [activeTab, setActiveTab] = useState<ColumnId>('contact')

  function openCreate() {
    setModal({ open: true, card: null, column: null })
  }

  function openEdit(card: Card) {
    setModal({ open: true, card, column: card.column })
  }

  function closeModal() {
    setModal({ open: false, card: null, column: null })
  }

  async function handleSave(payload: Omit<Card, 'id' | 'user_id' | 'position' | 'created_at' | 'column'>, column?: ColumnId) {
    if (modal.card) {
      await updateCard(modal.card.id, { ...payload, ...(column ? { column } : {}) })
    } else {
      await createCard({ ...payload, column: column ?? 'contact' })
    }
  }

  function onDragEnd(result: DropResult) {
    const { destination, source, draggableId } = result
    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) return

    const srcCol = source.droppableId as ColumnId
    const destCol = destination.droppableId as ColumnId

    const movedCard = cards.find((c) => c.id === draggableId)
    if (!movedCard) return

    // Cards do destino com o card inserido na posição correta
    const destCards = cards
      .filter((c) => c.column === destCol && c.id !== draggableId)
    destCards.splice(destination.index, 0, { ...movedCard, column: destCol })
    const destCardsPositioned = destCards.map((c, i) => ({ ...c, position: i }))

    let reordered: Card[]
    if (srcCol === destCol) {
      // Mesma coluna: apenas substitui os cards reordenados
      const otherCards = cards.filter((c) => c.column !== srcCol)
      reordered = [...otherCards, ...destCardsPositioned]
    } else {
      // Cards da origem sem o card movido, reposicionados
      const srcCards = cards
        .filter((c) => c.column === srcCol && c.id !== draggableId)
        .map((c, i) => ({ ...c, position: i }))
      const otherCards = cards.filter((c) => c.column !== srcCol && c.column !== destCol)
      reordered = [...otherCards, ...srcCards, ...destCardsPositioned]
    }

    moveCard(draggableId, srcCol, destCol, destination.index, reordered)
  }

  const cardsByColumn = COLUMNS.reduce<Record<ColumnId, Card[]>>((acc, col) => {
    acc[col] = cards
      .filter((c) => c.column === col)
      .sort((a, b) => a.position - b.position)
    return acc
  }, {} as Record<ColumnId, Card[]>)

  return (
    <div className="min-h-svh flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <span className="text-xl">🚗</span>
          <h1 className="text-base font-bold text-gray-900">CRM Seguros</h1>
        </div>
        <div className="flex items-center gap-3">
          <Avatar email={user?.email} />
          <button
            onClick={logout}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Sair
          </button>
        </div>
      </header>

      {/* Board */}
      <main className="flex-1 flex flex-col">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Spinner className="w-8 h-8 text-emerald-600" />
          </div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            {/* Desktop: colunas lado a lado com largura flexível */}
            <div className="hidden md:flex gap-3 p-4 flex-1 overflow-x-auto items-start">
              {COLUMNS.map((col) => (
                <BoardColumn
                  key={col}
                  columnId={col}
                  cards={cardsByColumn[col]}
                  onCardClick={openEdit}
                />
              ))}
            </div>

            {/* Mobile: tabs + coluna única */}
            <div className="flex flex-col md:hidden h-full">
              {/* Tabs */}
              <div className="flex overflow-x-auto border-b border-gray-200 bg-white sticky top-14 z-10 scrollbar-none">
                {COLUMNS.map((col) => {
                  const isActive = col === activeTab
                  return (
                    <button
                      key={col}
                      onClick={() => setActiveTab(col)}
                      className={`flex items-center gap-1.5 px-3 py-3 text-xs font-medium whitespace-nowrap border-b-2 transition-colors shrink-0
                        ${isActive
                          ? 'border-emerald-500 text-emerald-700'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                      <span className={`w-2 h-2 rounded-full shrink-0 ${COLUMN_DOT[col]}`} />
                      {COLUMN_LABELS[col]}
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold
                        ${isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                        {cardsByColumn[col].length}
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* Coluna ativa */}
              <div className="flex-1 overflow-y-auto p-3">
                <BoardColumn
                  key={activeTab}
                  columnId={activeTab}
                  cards={cardsByColumn[activeTab]}
                  onCardClick={openEdit}
                />
              </div>
            </div>
          </DragDropContext>
        )}
      </main>

      {/* FAB */}
      <button
        onClick={openCreate}
        className="fixed bottom-6 right-6 z-30 w-14 h-14 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
        aria-label="Novo card"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* Modal */}
      <CardModal
        isOpen={modal.open}
        onClose={closeModal}
        card={modal.card}
        defaultColumn={modal.column}
        onSave={handleSave}
        onDelete={deleteCard}
      />
    </div>
  )
}
