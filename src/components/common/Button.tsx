import { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
}

const baseClass =
  'inline-flex items-center justify-center rounded-xl font-semibold px-5 py-3 text-base transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed';

const variantClass: Record<Variant, string> = {
  primary: 'bg-teal-600 text-white hover:bg-teal-700',
  secondary: 'bg-white text-slate-800 border border-slate-300 hover:bg-slate-50',
  ghost: 'bg-transparent text-slate-700 hover:bg-slate-100',
  danger: 'bg-red-600 text-white hover:bg-red-700',
};

export const Button = ({ variant = 'primary', className = '', children, ...rest }: ButtonProps) => (
  <button className={`${baseClass} ${variantClass[variant]} ${className}`} {...rest}>
    {children}
  </button>
);
