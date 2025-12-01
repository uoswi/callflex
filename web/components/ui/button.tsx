import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    // Base styles with design system tokens
    const baseStyles = [
      'inline-flex items-center justify-center',
      'font-medium rounded-lg',
      'transition-all duration-150 ease-out',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
      'disabled:opacity-50 disabled:pointer-events-none',
      'active:scale-[0.98]',
    ].join(' ')

    // Variant styles matching design system
    const variants = {
      primary: [
        'bg-primary-600 text-white',
        'hover:bg-primary-700',
        'focus-visible:ring-primary-500',
        'shadow-sm',
      ].join(' '),
      secondary: [
        'bg-gray-100 text-gray-900',
        'hover:bg-gray-200',
        'focus-visible:ring-gray-500',
      ].join(' '),
      outline: [
        'border border-gray-200 bg-white text-gray-700',
        'hover:bg-gray-50 hover:border-gray-300',
        'focus-visible:ring-primary-500',
      ].join(' '),
      ghost: [
        'text-gray-600 bg-transparent',
        'hover:bg-gray-100 hover:text-gray-900',
        'focus-visible:ring-gray-500',
      ].join(' '),
      destructive: [
        'bg-error-600 text-white',
        'hover:bg-error-700',
        'focus-visible:ring-error-500',
      ].join(' '),
    }

    // Size styles matching design system spacing
    const sizes = {
      sm: 'px-3 py-2 text-sm',      // 12px 8px padding
      md: 'px-4 py-2.5 text-sm',    // 16px 10px padding
      lg: 'px-6 py-3 text-base',    // 24px 12px padding
    }

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }
