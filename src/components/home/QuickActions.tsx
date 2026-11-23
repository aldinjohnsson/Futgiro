import { CalendarDays, MapPin, Plus, Users, type LucideIcon } from 'lucide-react';

export type ShortcutId = 'create-match' | 'find-courts' | 'find-players' | 'agenda';

type Shortcut = {
  id: ShortcutId;
  label: string;
  icon: LucideIcon;
};

const SHORTCUTS: Shortcut[] = [
  { id: 'create-match', label: 'Criar partida', icon: Plus },
  { id: 'find-courts', label: 'Encontrar quadras', icon: MapPin },
  { id: 'find-players', label: 'Buscar jogadores', icon: Users },
  { id: 'agenda', label: 'Minha agenda', icon: CalendarDays },
];

type QuickActionsProps = {
  onAction: (id: ShortcutId) => void;
};

export default function QuickActions({ onAction }: QuickActionsProps) {
  return (
    <section aria-label="Atalhos principais">
      <ul className="grid grid-cols-4 gap-2 sm:gap-4">
        {SHORTCUTS.map(({ id, label, icon: Icon }) => (
          <li key={id}>
            <button
              type="button"
              onClick={() => onAction(id)}
              className="group flex w-full flex-col items-center gap-2 rounded-2xl bg-white p-3 text-center shadow-card ring-1 ring-navy-100 transition-all hover:-translate-y-0.5 hover:shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pitch-500 sm:p-5"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-pitch-50 text-pitch-700 transition-colors group-hover:bg-pitch-600 group-hover:text-white sm:h-12 sm:w-12">
                <Icon className="h-5 w-5" strokeWidth={2.25} aria-hidden="true" />
              </span>
              <span className="text-[11px] font-semibold leading-tight text-navy-800 sm:text-sm">{label}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
