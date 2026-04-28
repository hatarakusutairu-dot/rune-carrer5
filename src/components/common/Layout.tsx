import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export const Layout = ({ children, title, subtitle }: LayoutProps) => (
  <div className="min-h-full flex flex-col">
    {(title || subtitle) && (
      <header className="px-4 pt-6 pb-3 sm:px-8">
        {title && <h1 className="text-xl sm:text-2xl font-bold">{title}</h1>}
        {subtitle && <p className="text-sm text-slate-600">{subtitle}</p>}
      </header>
    )}
    <main className="flex-1 px-4 pb-10 sm:px-8">{children}</main>
  </div>
);
