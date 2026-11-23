import { useState } from 'react';
import { Shirt, Users, X } from 'lucide-react';
import ModalShell from '@/components/common/ModalShell';
import MatchPlayersPanel from '@/components/match/MatchPlayersPanel';
import TeamDrawPanel from '@/components/match/TeamDrawPanel';
import { formatDayMonth, formatTime, formatWeekday } from '@/lib/format';
import type { Court, Match } from '@/types/futgiro';

type MatchManageModalProps = {
  match: Match;
  court: Court;
  onClose: () => void;
  onChanged: () => void;
};

type ManageTab = 'players' | 'teams';

const TABS: { id: ManageTab; label: string; icon: typeof Users }[] = [
  { id: 'players', label: 'Jogadores e pagamento', icon: Users },
  { id: 'teams', label: 'Times', icon: Shirt },
];

export default function MatchManageModal({ match, court, onClose, onChanged }: MatchManageModalProps) {
  const [tab, setTab] = useState<ManageTab>('players');

  return (
    <ModalShell titleId="match-manage-title" onClose={onClose}>
      <div className="flex items-start justify-between gap-4 border-b border-navy-100 p-5 sm:p-6">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-pitch-700">{match.modality}</p>
          <h2 id="match-manage-title" className="mt-1 truncate text-xl font-extrabold text-navy-900">
            {court.name}
          </h2>
          <p className="mt-1 text-sm text-navy-500">
            {formatWeekday(match.startsAt)}, {formatDayMonth(match.startsAt)} às {formatTime(match.startsAt)}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy-50 text-navy-700 transition-colors hover:bg-navy-100"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <div role="tablist" aria-label="Seções da partida" className="flex gap-2 border-b border-navy-100 px-5 pt-3 sm:px-6">
        {TABS.map(({ id, label, icon: Icon }) => {
          const isActive = tab === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setTab(id)}
              className={`-mb-px flex items-center gap-2 border-b-2 px-3 pb-3 text-sm font-bold transition-colors ${
                isActive ? 'border-pitch-600 text-navy-900' : 'border-transparent text-navy-500 hover:text-navy-800'
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </button>
          );
        })}
      </div>

      <div role="tabpanel" className="overflow-y-auto p-5 sm:p-6">
        {tab === 'players' ? (
          <MatchPlayersPanel match={match} onChanged={onChanged} />
        ) : (
          <TeamDrawPanel match={match} onChanged={onChanged} />
        )}
      </div>
    </ModalShell>
  );
}
