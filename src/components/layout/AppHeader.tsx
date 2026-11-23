import { Bell, User } from 'lucide-react';
import Logo from '@/components/layout/Logo';
import type { AccountProfile } from '@/types/futgiro';

type AppHeaderProps = {
  profile: AccountProfile | null;
  onNotificationsClick: () => void;
  onProfileClick: () => void;
};

export default function AppHeader({ profile, onNotificationsClick, onProfileClick }: AppHeaderProps) {
  const firstName = profile?.fullName.split(' ')[0];

  return (
    <header className="sticky top-0 z-30 border-b border-navy-100 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <div className="min-w-0 lg:hidden">
          <Logo showSlogan />
        </div>
        <div className="hidden min-w-0 lg:block">
          <p className="truncate text-lg font-extrabold text-navy-800">{firstName ? `Olá, ${firstName}` : 'Bem-vindo'}</p>
          <p className="truncate text-xs font-semibold text-navy-500">Bora jogar hoje?</p>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onNotificationsClick}
            aria-label="Notificações"
            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-navy-50 text-navy-700 ring-1 ring-navy-100 transition-colors hover:bg-navy-100"
          >
            <Bell className="h-5 w-5" aria-hidden="true" />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-pitch-500 ring-2 ring-white" />
          </button>

          <button
            type="button"
            onClick={onProfileClick}
            aria-label="Abrir perfil"
            className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-pitch-100 text-pitch-800 ring-2 ring-pitch-400 ring-offset-2 transition-transform hover:scale-105"
          >
            <User className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
}
