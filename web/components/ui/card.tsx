import { cn } from '@/lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

// Card component following design system:
// - bg: white
// - border: gray-200 (1px)
// - radius: 12px (rounded-lg)
// - padding: 24px
// - shadow: sm

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-lg border border-gray-200 shadow-sm',
        'transition-shadow duration-200 ease-out',
        'hover:shadow-md',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className, children, ...props }: CardProps) {
  return (
    <div className={cn('px-6 py-5 border-b border-gray-100', className)} {...props}>
      {children}
    </div>
  )
}

export function CardTitle({ className, children, ...props }: CardProps) {
  return (
    <h3 className={cn('text-lg font-semibold text-gray-900', className)} {...props}>
      {children}
    </h3>
  )
}

export function CardDescription({ className, children, ...props }: CardProps) {
  return (
    <p className={cn('text-sm text-gray-500 mt-1', className)} {...props}>
      {children}
    </p>
  )
}

export function CardContent({ className, children, ...props }: CardProps) {
  return (
    <div className={cn('p-6', className)} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({ className, children, ...props }: CardProps) {
  return (
    <div className={cn('px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-lg', className)} {...props}>
      {children}
    </div>
  )
}
