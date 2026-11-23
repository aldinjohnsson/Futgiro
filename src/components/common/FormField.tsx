import type { ReactNode } from 'react';

export const INPUT_CLASS =
  'w-full rounded-xl border border-navy-200 bg-white px-4 py-3 text-sm text-navy-900 placeholder:text-navy-300 transition-colors focus:border-pitch-500 focus:outline-none focus:ring-2 focus:ring-pitch-200';

type FormFieldProps = {
  label: string;
  htmlFor: string;
  hint?: string;
  children: ReactNode;
};

export default function FormField({ label, htmlFor, hint, children }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={htmlFor} className="text-sm font-bold text-navy-800">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-navy-500">{hint}</p>}
    </div>
  );
}
