import { useState } from 'react';
import { Loader2, Shuffle } from 'lucide-react';
import FormField, { INPUT_CLASS } from '@/components/common/FormField';
import { drawTeams } from '@/lib/teamDraw';
import { MatchServiceError, saveTeamAssignments } from '@/services/matchService';
import type { Match, MatchPlayer } from '@/types/futgiro';

type TeamDrawPanelProps = {
  match: Match;
  onChanged: () => void;
};

const TEAM_COLORS = ['bg-pitch-500', 'bg-sky-500', 'bg-amber-400', 'bg-rose-500', 'bg-teal-500', 'bg-navy-500'];
const GENERIC_ERROR = 'Algo deu errado. Tente novamente.';

const groupByTeam = (players: MatchPlayer[]) => {
  const teams = new Map<number, MatchPlayer[]>();
  for (const player of players) {
    if (player.teamNumber === null) continue;
    teams.set(player.teamNumber, [...(teams.get(player.teamNumber) ?? []), player]);
  }
  return [...teams.entries()].sort(([a], [b]) => a - b);
};

export default function TeamDrawPanel({ match, onChanged }: TeamDrawPanelProps) {
  const [playersPerTeam, setPlayersPerTeam] = useState('5');
  const [error, setError] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const teams = groupByTeam(match.players);
  const unassigned = match.players.filter((player) => player.teamNumber === null);
  const perTeam = Number(playersPerTeam);

  const handleDraw = async () => {
    if (match.players.length < 2) {
      setError('Adicione pelo menos 2 jogadores para sortear os times.');
      return;
    }
    if (!Number.isInteger(perTeam) || perTeam < 1 || perTeam > match.players.length) {
      setError('Informe quantos jogadores terá cada time.');
      return;
    }
    if (Math.ceil(match.players.length / perTeam) < 2) {
      setError('Com essa quantidade, só sairia um time. Diminua o número por time.');
      return;
    }

    setIsDrawing(true);
    setError(null);
    try {
      const assignments = drawTeams(
        match.players.map((player) => ({ id: player.id, isGoalkeeper: player.isGoalkeeper })),
        perTeam,
      );
      await saveTeamAssignments(assignments);
      onChanged();
    } catch (caught) {
      setError(caught instanceof MatchServiceError ? caught.message : GENERIC_ERROR);
    } finally {
      setIsDrawing(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void handleDraw();
        }}
        noValidate
        className="flex flex-col gap-4 rounded-2xl bg-navy-50 p-4 ring-1 ring-navy-100 sm:flex-row sm:items-end"
      >
        <FormField label="Jogadores por time" htmlFor="players-per-team" hint={`${match.players.length} jogador(es) na partida.`}>
          <input
            id="players-per-team"
            type="number"
            inputMode="numeric"
            min={1}
            max={Math.max(match.players.length, 1)}
            className={`${INPUT_CLASS} sm:w-40`}
            value={playersPerTeam}
            onChange={(event) => setPlayersPerTeam(event.target.value)}
          />
        </FormField>
        <button
          type="submit"
          disabled={isDrawing}
          className="flex items-center justify-center gap-2 rounded-xl bg-pitch-500 px-6 py-3 text-sm font-bold text-navy-900 shadow-lg shadow-pitch-500/25 transition-all hover:bg-pitch-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isDrawing ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Shuffle className="h-4 w-4" aria-hidden="true" />}
          {teams.length > 0 ? 'Sortear novamente' : 'Sortear times'}
        </button>
      </form>

      {error && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 ring-1 ring-red-100">
          {error}
        </p>
      )}

      {teams.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-navy-200 p-6 text-center text-sm text-navy-500">
          Os times ainda não foram sorteados. Defina o tamanho de cada time e sorteie.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {teams.map(([teamNumber, players]) => (
            <section
              key={teamNumber}
              aria-label={`Time ${teamNumber}`}
              className="overflow-hidden rounded-2xl bg-white ring-1 ring-navy-100"
            >
              <header className="flex items-center justify-between px-4 py-3">
                <h3 className="text-sm font-extrabold text-navy-900">Time {teamNumber}</h3>
                <span className={`h-3 w-3 rounded-full ${TEAM_COLORS[(teamNumber - 1) % TEAM_COLORS.length]}`} aria-hidden="true" />
              </header>
              <ul className="flex flex-col divide-y divide-navy-100 border-t border-navy-100">
                {players.map((player) => (
                  <li key={player.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                    <span className="truncate font-semibold text-navy-800">{player.name}</span>
                    {player.isGoalkeeper && (
                      <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800">Goleiro</span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      {teams.length > 0 && unassigned.length > 0 && (
        <p className="text-xs text-navy-500">
          {unassigned.length} jogador(es) entraram depois do sorteio. Sorteie novamente para incluí-los.
        </p>
      )}
    </div>
  );
}
