import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

// Input component following design system:
// - radius: 8px
// - padding: 10px 14px
// - font-size: 16px (prevents iOS zoom)
// - Focus: border primary-500, ring 3px primary-100
// - Error: border error-500, ring error-100
// - Disabled: bg gray-100, text gray-400

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            // Base styles
            'block w-full px-3.5 py-2.5 text-base text-gray-900',
            'border rounded-lg placeholder-gray-400',
            'transition-all duration-150 ease-out',
            // Focus state with 3px ring
            'focus:outline-none focus:ring-[3px]',
            // Normal state
            !error && [
              'border-gray-300',
              'focus:border-primary-500 focus:ring-primary-100',
            ],
            // Error state
            error && [
              'border-error-500',
              'focus:border-error-500 focus:ring-error-100',
            ],
            // Disabled state
            'disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1.5 text-sm text-error-600">{error}</p>}
        {hint && !error && <p className="mt-1.5 text-sm text-gray-500">{hint}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input }
