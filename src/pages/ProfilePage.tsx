import AccountSection from '@/components/profile/AccountSection';
import type { AccountProfile } from '@/types/futgiro';

type ProfilePageProps = {
  profile: AccountProfile | null;
};

const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

export default function ProfilePage({ profile }: ProfilePageProps) {
  const displayName = profile?.fullName ?? 'Visitante';

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col items-center gap-4 rounded-3xl bg-white p-6 text-center shadow-card ring-1 ring-navy-100 sm:flex-row sm:text-left sm:p-8">
        <span className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-pitch-100 text-3xl font-extrabold text-pitch-800 ring-4 ring-pitch-50">
          {getInitials(displayName)}
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-extrabold text-navy-900">{displayName}</h1>
          <p className="mt-1 text-sm font-semibold text-navy-500">
            {profile ? 'Seu perfil de jogador e dono de quadra' : 'Entre para ver e editar seu perfil'}
          </p>
        </div>
      </section>

      <AccountSection />
    </div>
  );
}
