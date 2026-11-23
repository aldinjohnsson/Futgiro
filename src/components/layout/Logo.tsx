import { Goal } from 'lucide-react';

type LogoProps = {
  inverted?: boolean;
  showSlogan?: boolean;
  className?: string;
};

export default function Logo({ inverted = false, showSlogan = false, className = '' }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pitch-500 text-navy-900 shadow-md shadow-pitch-500/30">
        <Goal className="h-5 w-5" strokeWidth={2.5} aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className={`text-lg font-extrabold leading-none tracking-tight ${inverted ? 'text-white' : 'text-navy-800'}`}>
          FUT<span className="text-pitch-400">GIRO</span>
        </p>
        {showSlogan && (
          <p className={`mt-1 truncate text-xs font-semibold ${inverted ? 'text-navy-200' : 'text-navy-500'}`}>
            O futebol da nossa região.
          </p>
        )}
      </div>
    </div>
  );
}
