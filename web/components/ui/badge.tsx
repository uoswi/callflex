import { cn } from '@/lib/utils'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'pro'
  size?: 'sm' | 'md'
  dot?: boolean
  pulse?: boolean
}

// Badge component following design system status colors:
// - Active/Success: #10B981 (green)
// - Warning/Paused: #F59E0B (amber)
// - Error/Missed: #DC2626 (red)
// - Transferred/Pro: #8B5CF6 (purple)
// - Default/Completed: #6B7280 (gray)

export function Badge({
  className,
  variant = 'default',
  size = 'md',
  dot = false,
  pulse = false,
  children,
  ...props
}: BadgeProps) {
  const variants = {
    default: 'bg-gray-100 text-gray-700',
    success: 'bg-success-100 text-success-700',
    warning: 'bg-warning-100 text-warning-600',
    error: 'bg-error-100 text-error-700',
    info: 'bg-primary-100 text-primary-700',
    pro: 'bg-pro-100 text-pro-600',
  }

  const dotColors = {
    default: 'bg-gray-500',
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    error: 'bg-error-600',
    info: 'bg-primary-500',
    pro: 'bg-pro-500',
  }

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full mr-1.5',
            dotColors[variant],
            pulse && 'animate-pulse'
          )}
        />
      )}
      {children}
    </span>
  )
}

// Status badge presets for common use cases
export function StatusBadge({
  status,
  ...props
}: {
  status: 'active' | 'inactive' | 'draft' | 'completed' | 'voicemail' | 'transferred' | 'abandoned' | 'in-progress'
} & Omit<BadgeProps, 'variant' | 'dot' | 'pulse'>) {
  const statusConfig = {
    active: { variant: 'success' as const, label: 'Active', dot: true, pulse: true },
    'in-progress': { variant: 'success' as const, label: 'In Progress', dot: true, pulse: true },
    completed: { variant: 'success' as const, label: 'Completed', dot: false, pulse: false },
    inactive: { variant: 'default' as const, label: 'Inactive', dot: false, pulse: false },
    draft: { variant: 'warning' as const, label: 'Draft', dot: false, pulse: false },
    voicemail: { variant: 'warning' as const, label: 'Voicemail', dot: false, pulse: false },
    transferred: { variant: 'pro' as const, label: 'Transferred', dot: false, pulse: false },
    abandoned: { variant: 'error' as const, label: 'Abandoned', dot: false, pulse: false },
  }

  const config = statusConfig[status]

  return (
    <Badge variant={config.variant} dot={config.dot} pulse={config.pulse} {...props}>
      {config.label}
    </Badge>
  )
}
