import { Draggable } from '@hello-pangea/dnd'
import { VehicleBadge } from '../ui/Badge'
import type { Card } from '../../types'

interface CardItemProps {
  card: Card
  index: number
  onClick: (card: Card) => void
}

export default function CardItem({ card, index, onClick }: CardItemProps) {
  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick(card)}
          className={`bg-white rounded-xl border border-gray-100 p-3 cursor-pointer select-none
            hover:border-gray-300 hover:shadow-sm transition-all
            ${snapshot.isDragging ? 'shadow-lg rotate-1 border-emerald-300' : ''}
          `}
        >
          <p className="text-sm font-semibold text-gray-900 mb-1 truncate">{card.name}</p>
          <div className="flex items-center gap-2 flex-wrap">
            {card.plate && (
              <span className="text-xs text-gray-500 font-mono bg-gray-50 px-1.5 py-0.5 rounded">
                {card.plate}
              </span>
            )}
            {card.vehicle_type && <VehicleBadge type={card.vehicle_type} />}
          </div>
          {card.insurance_monthly && (
            <p className="text-xs text-emerald-600 font-medium mt-2">
              R$ {Number(card.insurance_monthly).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              <span className="text-gray-400 font-normal">/mês</span>
            </p>
          )}
        </div>
      )}
    </Draggable>
  )
}
