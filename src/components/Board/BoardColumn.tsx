import { Droppable } from '@hello-pangea/dnd'
import CardItem from './CardItem'
import type { Card, ColumnId } from '../../types'

const COLUMN_STYLES: Record<ColumnId, { header: string; title: string; dot: string }> = {
  contact:           { header: 'bg-emerald-50 border-emerald-200', title: 'text-emerald-800', dot: 'bg-emerald-500' },
  contacted:         { header: 'bg-amber-50 border-amber-200',     title: 'text-amber-800',   dot: 'bg-amber-500' },
  proposal:          { header: 'bg-blue-50 border-blue-200',       title: 'text-blue-800',    dot: 'bg-blue-500' },
  waiting_inspection:{ header: 'bg-orange-50 border-orange-200',   title: 'text-orange-800',  dot: 'bg-orange-500' },
  done:              { header: 'bg-violet-50 border-violet-200',   title: 'text-violet-800',  dot: 'bg-violet-500' },
}

const COLUMN_LABELS: Record<ColumnId, string> = {
  contact:            'Entrar em contato',
  contacted:          'Contato feito',
  proposal:           'Proposta enviada',
  waiting_inspection: 'Aguardando Vistoria',
  done:               'Concluído',
}

interface BoardColumnProps {
  columnId: ColumnId
  cards: Card[]
  onCardClick: (card: Card) => void
}

export default function BoardColumn({ columnId, cards, onCardClick }: BoardColumnProps) {
  const style = COLUMN_STYLES[columnId]

  return (
    <div className="flex flex-col flex-1 min-w-44 md:min-w-52 min-h-48 rounded-2xl bg-gray-50 border border-gray-200">
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-3 border-b ${style.header}`}>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${style.dot}`} />
          <h3 className={`text-sm font-semibold ${style.title}`}>
            {COLUMN_LABELS[columnId]}
          </h3>
        </div>
        <span className="text-xs font-medium text-gray-400 bg-white px-1.5 py-0.5 rounded-full border border-gray-200">
          {cards.length}
        </span>
      </div>

      {/* Cards */}
      <Droppable droppableId={columnId}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex flex-col gap-2 p-3 flex-1 min-h-[120px] transition-colors
              ${snapshot.isDraggingOver ? 'bg-emerald-50/50' : ''}
            `}
          >
            {cards.map((card, index) => (
              <CardItem key={card.id} card={card} index={index} onClick={onCardClick} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  )
}
