import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

const styles: Record<Variant, string> = {
  primary: 'bg-pine text-white hover:bg-pine-deep disabled:bg-pine/40',
  secondary: 'bg-panel text-ink border border-line hover:border-pine disabled:opacity-50',
  ghost: 'bg-transparent text-ink-soft hover:bg-pine-wash hover:text-ink disabled:opacity-50',
  danger: 'bg-panel text-rose border border-rose/40 hover:bg-rose-wash disabled:opacity-50',
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: 'sm' | 'md' | 'lg'
}

export function Button({ variant = 'primary', size = 'md', className = '', type = 'button', ...rest }: ButtonProps) {
  const sizing = size === 'lg' ? 'px-6 py-3 text-base' : size === 'sm' ? 'px-3 py-1.5 text-sm' : 'px-4 py-2 text-sm'
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors disabled:cursor-not-allowed ${sizing} ${styles[variant]} ${className}`}
      {...rest}
    />
  )
}
