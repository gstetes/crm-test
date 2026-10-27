import { cva } from 'class-variance-authority'
import { clsx } from 'clsx'
import type { VariantProps } from 'class-variance-authority'
import Spinner from './Spinner'

const button = cva(
  'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary: 'bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-500',
        secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus-visible:ring-gray-400',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500',
        ghost: 'text-gray-600 hover:bg-gray-100 focus-visible:ring-gray-400',
      },
      size: {
        sm: 'text-sm px-3 py-1.5 gap-1.5',
        md: 'text-sm px-4 py-2 gap-2',
        lg: 'text-base px-5 py-2.5 gap-2',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof button> {
  loading?: boolean
  children: React.ReactNode
}

export default function Button({ variant, size, loading, children, className, ...props }: ButtonProps) {
  return (
    <button className={clsx(button({ variant, size }), className)} disabled={loading || props.disabled} {...props}>
      {loading && <Spinner className="w-4 h-4" />}
      {children}
    </button>
  )
}
