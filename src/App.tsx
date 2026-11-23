import { useCallback, useState } from 'react';
import Toast from '@/components/common/Toast';
import type { ShortcutId } from '@/components/home/QuickActions';
import AppHeader from '@/components/layout/AppHeader';
import BottomNav from '@/components/layout/BottomNav';
import type { SectionId } from '@/components/layout/navItems';
import SideNav from '@/components/layout/SideNav';
import CourtFormModal from '@/components/court/CourtFormModal';
import CourtSlotsModal from '@/components/court/CourtSlotsModal';
import AuthModal from '@/components/auth/AuthModal';
import CreateMatchModal from '@/components/match/CreateMatchModal';
import MatchDetailModal from '@/components/match/MatchDetailModal';
import MatchManageModal from '@/components/match/MatchManageModal';
import { useAuth } from '@/hooks/useAuth';
import { useCourts } from '@/hooks/useCourts';
import { useMatches } from '@/hooks/useMatches';
import { findCourt } from '@/lib/format';
import HomePage from '@/pages/HomePage';
import MatchesPage from '@/pages/MatchesPage';
import ProfilePage from '@/pages/ProfilePage';
import StatsPage from '@/pages/StatsPage';
import type { Court, Match } from '@/types/futgiro';

type ToastState = {
  id: number;
  message: string;
};

type CourtDialog = { kind: 'create' } | { kind: 'edit'; courtId: string } | { kind: 'slots'; courtId: string };

type MatchDialog = { kind: 'create' } | { kind: 'detail' | 'manage'; matchId: string };

const UNAVAILABLE_MESSAGE = 'Esta função estará disponível em breve.';
const NO_NOTIFICATIONS_MESSAGE = 'Você não tem notificações novas.';
const MATCH_CREATED_MESSAGE = 'Partida criada com sucesso.';
const LOGIN_REQUIRED_MESSAGE = 'Entre na sua conta para continuar.';
const COURT_OWNER_REQUIRED_MESSAGE = 'Ative o perfil de dono de quadra na sua conta para cadastrar quadras.';

function App() {
  const [section, setSection] = useState<SectionId>('home');
  const [matchDialog, setMatchDialog] = useState<MatchDialog | null>(null);
  const [courtDialog, setCourtDialog] = useState<CourtDialog | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const { session, profile } = useAuth();
  const userId = session?.user.id ?? null;
  const { courts, isLoading: courtsLoading, error: courtsError, reload: reloadCourts } = useCourts();
  const {
    matches,
    isLoading: matchesLoading,
    error: matchesError,
    reload: reloadMatches,
  } = useMatches();

  const showToast = useCallback((message: string) => setToast({ id: Date.now(), message }), []);
  const dismissToast = useCallback(() => setToast(null), []);
  const closeMatchDialog = useCallback(() => setMatchDialog(null), []);
  const closeCourtDialog = useCallback(() => setCourtDialog(null), []);

  const navigate = (next: SectionId) => {
    setSection(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openCreateMatch = () => {
    if (!session) {
      showToast(LOGIN_REQUIRED_MESSAGE);
      setIsAuthOpen(true);
      return;
    }
    setMatchDialog({ kind: 'create' });
  };

  const openCreateCourt = () => {
    if (!session) {
      showToast(LOGIN_REQUIRED_MESSAGE);
      setIsAuthOpen(true);
      return;
    }
    if (!profile?.isCourtOwner) {
      showToast(COURT_OWNER_REQUIRED_MESSAGE);
      return;
    }
    setCourtDialog({ kind: 'create' });
  };

  const canManageCourt = (court: Court) => userId !== null && court.ownerId === userId;

  const canManageMatch = (match: Match, court: Court | undefined) =>
    userId !== null && (match.ownerId === userId || court?.ownerId === userId);

  const handleShortcut = (id: ShortcutId) => {
    if (id === 'create-match') {
      openCreateMatch();
      return;
    }
    if (id === 'find-courts') {
      document.getElementById('quadras')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    showToast(UNAVAILABLE_MESSAGE);
  };

  const handleCourtSaved = () => {
    setCourtDialog(null);
    void reloadCourts();
  };

  const handleMatchCreated = () => {
    setMatchDialog(null);
    showToast(MATCH_CREATED_MESSAGE);
    void reloadMatches();
  };

  const dialogMatch =
    matchDialog && matchDialog.kind !== 'create' ? matches.find((match) => match.id === matchDialog.matchId) : undefined;
  const dialogMatchCourt = dialogMatch ? findCourt(courts, dialogMatch.courtId) : undefined;
  const dialogCourt: Court | undefined =
    courtDialog && courtDialog.kind !== 'create' ? findCourt(courts, courtDialog.courtId) : undefined;

  return (
    <div className="min-h-screen bg-navy-50">
      <SideNav active={section} onChange={navigate} onCreateMatch={openCreateMatch} />

      <div className="lg:pl-64">
        <AppHeader
          profile={profile}
          onNotificationsClick={() => showToast(NO_NOTIFICATIONS_MESSAGE)}
          onProfileClick={() => navigate('profile')}
        />

        <main className="mx-auto w-full max-w-6xl px-4 pb-28 pt-6 sm:px-6 lg:pb-16 lg:pt-10">
          {section === 'home' && (
            <HomePage
              courts={courts}
              courtsLoading={courtsLoading}
              courtsError={courtsError}
              matches={matches}
              matchesLoading={matchesLoading}
              matchesError={matchesError}
              onRetryMatches={() => void reloadMatches()}
              onOpenMatch={(match) => setMatchDialog({ kind: 'detail', matchId: match.id })}
              onSearchMatches={() => navigate('matches')}
              onShortcut={handleShortcut}
              onViewAllMatches={() => navigate('matches')}
              onRetryCourts={() => void reloadCourts()}
              onCreateCourt={openCreateCourt}
              canManageCourt={canManageCourt}
              onEditCourt={(court) => setCourtDialog({ kind: 'edit', courtId: court.id })}
              onManageSlots={(court) => setCourtDialog({ kind: 'slots', courtId: court.id })}
            />
          )}
          {section === 'matches' && (
            <MatchesPage
              courts={courts}
              matches={matches}
              isLoading={matchesLoading}
              error={matchesError}
              onRetry={() => void reloadMatches()}
              onOpenMatch={(match) => setMatchDialog({ kind: 'detail', matchId: match.id })}
            />
          )}
          {section === 'stats' && <StatsPage userId={userId} courts={courts} matches={matches} />}
          {section === 'profile' && <ProfilePage profile={profile} />}
        </main>
      </div>

      <BottomNav active={section} onChange={navigate} />

      {matchDialog?.kind === 'create' && (
        <CreateMatchModal courts={courts} matches={matches} onClose={closeMatchDialog} onSaved={handleMatchCreated} />
      )}

      {matchDialog?.kind === 'detail' && dialogMatch && dialogMatchCourt && (
        <MatchDetailModal
          match={dialogMatch}
          court={dialogMatchCourt}
          onClose={closeMatchDialog}
          canManage={canManageMatch(dialogMatch, dialogMatchCourt)}
          onManage={() => setMatchDialog({ kind: 'manage', matchId: dialogMatch.id })}
        />
      )}

      {matchDialog?.kind === 'manage' && dialogMatch && dialogMatchCourt && (
        <MatchManageModal
          match={dialogMatch}
          court={dialogMatchCourt}
          onClose={closeMatchDialog}
          onChanged={() => void reloadMatches()}
        />
      )}

      {courtDialog?.kind === 'create' && (
        <CourtFormModal court={null} onClose={closeCourtDialog} onSaved={handleCourtSaved} />
      )}

      {courtDialog?.kind === 'edit' && dialogCourt && (
        <CourtFormModal court={dialogCourt} onClose={closeCourtDialog} onSaved={handleCourtSaved} />
      )}

      {courtDialog?.kind === 'slots' && dialogCourt && (
        <CourtSlotsModal court={dialogCourt} onClose={closeCourtDialog} onChanged={() => void reloadCourts()} />
      )}

      {isAuthOpen && <AuthModal onClose={() => setIsAuthOpen(false)} />}

      {toast && <Toast key={toast.id} message={toast.message} onDismiss={dismissToast} />}
    </div>
  );
}

export default App;
