import { useState, type ReactNode } from 'react';
import { LogOut, ShieldCheck, Trophy } from 'lucide-react';
import AuthModal from '@/components/auth/AuthModal';
import { useAuth } from '@/hooks/useAuth';

export default function AccountSection() {
  const { session, profile, isLoading, signOut } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    setSignOutError(null);
    try {
      await signOut();
    } catch {
      setSignOutError('Não foi possível sair da conta. Tente novamente.');
    } finally {
      setIsSigningOut(false);
    }
  };

  const isSignedIn = session !== null;
  const hasProfile = profile !== null;

  return (
    <section className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-card ring-1 ring-navy-100 sm:p-8">
      <div>
        <h2 className="text-lg font-extrabold text-navy-900">Conta</h2>
        <p className="mt-1 text-sm text-navy-500">
          {isSignedIn ? 'Você está conectado.' : 'Entre ou crie sua conta para jogar e gerenciar quadras.'}
        </p>
      </div>

      {isLoading && <p className="text-sm font-semibold text-navy-500">Carregando sua conta...</p>}

      {!isLoading && !isSignedIn && (
        <button
          type="button"
          onClick={() => setIsAuthOpen(true)}
          className="self-start rounded-xl bg-navy-900 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-navy-800"
        >
          Entrar ou criar conta
        </button>
      )}

      {!isLoading && isSignedIn && (
        <>
          {hasProfile ? (
            <div className="flex flex-col gap-3 sm:flex-row">
              <RoleBadge active={profile.isPlayer} icon={<Trophy className="h-4 w-4" aria-hidden="true" />} label="Jogador" />
              <RoleBadge
                active={profile.isCourtOwner}
                icon={<ShieldCheck className="h-4 w-4" aria-hidden="true" />}
                label="Dono de quadra"
              />
            </div>
          ) : (
            <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800 ring-1 ring-amber-100">
              Não encontramos o seu perfil. Saia e crie a conta novamente.
            </p>
          )}

          {signOutError && (
            <p role="alert" className="text-sm font-semibold text-red-700">
              {signOutError}
            </p>
          )}

          <button
            type="button"
            onClick={() => void handleSignOut()}
            disabled={isSigningOut}
            className="flex items-center gap-2 self-start rounded-xl bg-navy-50 px-5 py-3 text-sm font-bold text-navy-800 transition-colors hover:bg-navy-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Sair da conta
          </button>
        </>
      )}

      {isAuthOpen && <AuthModal onClose={() => setIsAuthOpen(false)} />}
    </section>
  );
}

type RoleBadgeProps = {
  active: boolean;
  icon: ReactNode;
  label: string;
};

function RoleBadge({ active, icon, label }: RoleBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ring-1 ${
        active ? 'bg-pitch-50 text-pitch-800 ring-pitch-300' : 'bg-navy-50 text-navy-400 ring-navy-100'
      }`}
    >
      {icon}
      {label}
      <span className="sr-only">{active ? ' ativo' : ' inativo'}</span>
    </span>
  );
}
