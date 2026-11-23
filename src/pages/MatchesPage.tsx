import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import MatchCard from '@/components/home/MatchCard';
import { findCourt } from '@/lib/format';
import type { Court, Match } from '@/types/futgiro';

type MatchesPageProps = {
  courts: Court[];
  matches: Match[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onOpenMatch: (match: Match) => void;
};

const ALL_MODALITIES = 'Todas';

export default function MatchesPage({ courts, matches, isLoading, error, onRetry, onOpenMatch }: MatchesPageProps) {
  const [modality, setModality] = useState(ALL_MODALITIES);

  const modalities = [ALL_MODALITIES, ...Array.from(new Set(matches.map((match) => match.modality)))];
  const visibleMatches = modality === ALL_MODALITIES ? matches : matches.filter((match) => match.modality === modality);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold text-navy-900 sm:text-3xl">Partidas</h1>
        <p className="mt-1 text-sm text-navy-500">Escolha uma partida e veja quanto você economiza pagando pelo app.</p>
      </div>

      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0" role="tablist" aria-label="Filtrar por modalidade">
        {modalities.map((option) => {
          const isActive = option === modality;
          return (
            <button
              key={option}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setModality(option)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition-colors ${
                isActive ? 'bg-navy-900 text-white' : 'bg-white text-navy-700 ring-1 ring-navy-100 hover:ring-navy-300'
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>

      {isLoading && matches.length === 0 && (
        <p className="flex items-center gap-2 rounded-2xl bg-white p-6 text-sm font-semibold text-navy-600 ring-1 ring-navy-100">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Carregando partidas...
        </p>
      )}

      {error && (
        <div role="alert" className="flex flex-col items-start gap-3 rounded-2xl bg-red-50 p-6 ring-1 ring-red-100">
          <p className="text-sm font-semibold text-red-700">{error}</p>
          <button
            type="button"
            onClick={onRetry}
            className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-red-700 ring-1 ring-red-200 transition-colors hover:bg-red-100"
          >
            Tentar novamente
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {visibleMatches.map((match) => {
          const court = findCourt(courts, match.courtId);
          if (!court) return null;
          return <MatchCard key={match.id} match={match} court={court} onOpen={onOpenMatch} />;
        })}
      </div>

      {!isLoading && !error && visibleMatches.length === 0 && (
        <p className="rounded-2xl bg-white p-6 text-center text-sm text-navy-500 ring-1 ring-navy-100">
          Nenhuma partida nesta modalidade no momento.
        </p>
      )}
    </div>
  );
}
