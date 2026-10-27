import { cva } from 'class-variance-authority'
import { clsx } from 'clsx'
import type { VariantProps } from 'class-variance-authority'
import type { VehicleType } from '../../types'

const badge = cva('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', {
  variants: {
    variant: {
      green: 'bg-emerald-100 text-emerald-700',
      yellow: 'bg-amber-100 text-amber-700',
      blue: 'bg-blue-100 text-blue-700',
      gray: 'bg-gray-100 text-gray-600',
      violet: 'bg-violet-100 text-violet-700',
      red: 'bg-red-100 text-red-700',
    },
  },
  defaultVariants: { variant: 'gray' },
})

const vehicleVariant: Record<VehicleType, 'yellow' | 'blue' | 'gray'> = {
  moto: 'yellow',
  carro: 'blue',
  caminhao: 'gray',
}

const vehicleLabel: Record<VehicleType, string> = {
  moto: 'Moto',
  carro: 'Carro',
  caminhao: 'Caminhão',
}

interface VehicleBadgeProps {
  type: VehicleType
}

export function VehicleBadge({ type }: VehicleBadgeProps) {
  return (
    <Badge variant={vehicleVariant[type] ?? 'gray'}>
      {vehicleLabel[type] ?? type}
    </Badge>
  )
}

interface BadgeProps extends VariantProps<typeof badge> {
  children: React.ReactNode
  className?: string
}

export default function Badge({ variant, children, className }: BadgeProps) {
  return <span className={clsx(badge({ variant }), className)}>{children}</span>
}
