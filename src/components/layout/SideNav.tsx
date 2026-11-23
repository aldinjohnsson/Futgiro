import { Plus } from 'lucide-react';
import Logo from '@/components/layout/Logo';
import { NAV_ITEMS, type SectionId } from '@/components/layout/navItems';

type SideNavProps = {
  active: SectionId;
  onChange: (section: SectionId) => void;
  onCreateMatch: () => void;
};

export default function SideNav({ active, onChange, onCreateMatch }: SideNavProps) {
  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col bg-navy-900 p-6 lg:flex">
      <Logo inverted showSlogan className="mb-10" />

      <nav aria-label="Navegação principal">
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const isActive = id === active;
            return (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => onChange(id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-pitch-500 text-navy-900'
                      : 'text-navy-100 hover:bg-navy-800 hover:text-white'
                  }`}
                >
                  <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} aria-hidden="true" />
                  {label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <button
        type="button"
        onClick={onCreateMatch}
        className="mt-auto flex items-center justify-center gap-2 rounded-xl bg-pitch-400 px-4 py-3 text-sm font-bold text-navy-900 transition-colors hover:bg-pitch-300"
      >
        <Plus className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
        Criar partida
      </button>
    </aside>
  );
}
