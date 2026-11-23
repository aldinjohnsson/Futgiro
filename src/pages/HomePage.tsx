import { ArrowRight, Loader2, Plus } from 'lucide-react';
import CourtCard from '@/components/home/CourtCard';
import HeroBanner from '@/components/home/HeroBanner';
import MatchCard from '@/components/home/MatchCard';
import QuickActions, { type ShortcutId } from '@/components/home/QuickActions';
import { findCourt } from '@/lib/format';
import type { Court, Match } from '@/types/futgiro';

type HomePageProps = {
  courts: Court[];
  courtsLoading: boolean;
  courtsError: string | null;
  matches: Match[];
  matchesLoading: boolean;
  matchesError: string | null;
  onRetryMatches: () => void;
  onOpenMatch: (match: Match) => void;
  onSearchMatches: () => void;
  onShortcut: (id: ShortcutId) => void;
  onViewAllMatches: () => void;
  onRetryCourts: () => void;
  onCreateCourt: () => void;
  onEditCourt: (court: Court) => void;
  onManageSlots: (court: Court) => void;
  canManageCourt: (court: Court) => boolean;
};

export default function HomePage({
  courts,
  courtsLoading,
  courtsError,
  matches,
  matchesLoading,
  matchesError,
  onRetryMatches,
  onOpenMatch,
  onSearchMatches,
  onShortcut,
  onViewAllMatches,
  onRetryCourts,
  onCreateCourt,
  onEditCourt,
  onManageSlots,
  canManageCourt,
}: HomePageProps) {
  return (
    <div className="flex flex-col gap-8 lg:gap-10">
      <HeroBanner onSearchMatches={onSearchMatches} />

      <QuickActions onAction={onShortcut} />

      <section aria-labelledby="featured-matches-title" className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <h2 id="featured-matches-title" className="text-xl font-extrabold text-navy-900 sm:text-2xl">
            Partidas em destaque
          </h2>
          <button
            type="button"
            onClick={onViewAllMatches}
            className="group flex items-center gap-1 text-sm font-bold text-pitch-700 transition-colors hover:text-pitch-600"
          >
            Ver todas
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </button>
        </div>
        {matchesLoading && matches.length === 0 && (
          <p className="flex items-center gap-2 rounded-2xl bg-white p-6 text-sm font-semibold text-navy-600 ring-1 ring-navy-100">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Carregando partidas...
          </p>
        )}

        {matchesError && (
          <div role="alert" className="flex flex-col items-start gap-3 rounded-2xl bg-red-50 p-6 ring-1 ring-red-100">
            <p className="text-sm font-semibold text-red-700">{matchesError}</p>
            <button
              type="button"
              onClick={onRetryMatches}
              className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-red-700 ring-1 ring-red-200 transition-colors hover:bg-red-100"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {!matchesLoading && !matchesError && matches.length === 0 && (
          <p className="rounded-2xl border border-dashed border-navy-200 bg-white p-8 text-center text-sm text-navy-500">
            Nenhuma partida marcada ainda. Crie a primeira e convide a galera.
          </p>
        )}

        {matches.length > 0 && (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {matches.map((match) => {
              const court = findCourt(courts, match.courtId);
              if (!court) return null;
              return <MatchCard key={match.id} match={match} court={court} onOpen={onOpenMatch} />;
            })}
          </div>
        )}
      </section>

      <section id="quadras" aria-labelledby="courts-title" className="flex scroll-mt-24 flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="courts-title" className="text-xl font-extrabold text-navy-900 sm:text-2xl">
            Quadras próximas
          </h2>
          <button
            type="button"
            onClick={onCreateCourt}
            className="flex items-center gap-2 rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-navy-700"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
            Cadastrar quadra
          </button>
        </div>

        {courtsLoading && courts.length === 0 && (
          <p className="flex items-center gap-2 rounded-2xl bg-white p-6 text-sm font-semibold text-navy-600 ring-1 ring-navy-100">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Carregando quadras...
          </p>
        )}

        {courtsError && (
          <div role="alert" className="flex flex-col items-start gap-3 rounded-2xl bg-red-50 p-6 ring-1 ring-red-100">
            <p className="text-sm font-semibold text-red-700">{courtsError}</p>
            <button
              type="button"
              onClick={onRetryCourts}
              className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-red-700 ring-1 ring-red-200 transition-colors hover:bg-red-100"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {!courtsLoading && !courtsError && courts.length === 0 && (
          <p className="rounded-2xl border border-dashed border-navy-200 bg-white p-8 text-center text-sm text-navy-500">
            Nenhuma quadra cadastrada ainda. Cadastre a primeira para começar a receber partidas.
          </p>
        )}

        {courts.length > 0 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {courts.map((court) => (
              <CourtCard
                key={court.id}
                court={court}
                canManage={canManageCourt(court)}
                onEdit={onEditCourt}
                onManageSlots={onManageSlots}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
