import { useState, type FormEvent } from 'react';
import { Check, Loader2, Lock, Trash2, Unlock, UserPlus } from 'lucide-react';
import FormField, { INPUT_CLASS } from '@/components/common/FormField';
import {
  addMatchPlayer,
  MatchServiceError,
  removeMatchPlayer,
  setPaymentReleased,
  setPlayerExempt,
  setPlayerPaid,
} from '@/services/matchService';
import { getAvailableGoalkeeperSpots, getAvailableSpots, getMatchPricing } from '@/lib/format';
import type { Match } from '@/types/futgiro';

type MatchPlayersPanelProps = {
  match: Match;
  onChanged: () => void;
};

const GENERIC_ERROR = 'Algo deu errado. Tente novamente.';

export default function MatchPlayersPanel({ match, onChanged }: MatchPlayersPanelProps) {
  const [name, setName] = useState('');
  const [isGoalkeeper, setIsGoalkeeper] = useState(false);
  const [isExempt, setIsExempt] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const pricing = getMatchPricing(match);
  const availableSpots = getAvailableSpots(match);
  const availableGoalkeepers = getAvailableGoalkeeperSpots(match);
  const paidCount = match.players.filter((player) => player.isPaid).length;

  const run = async (busyKey: string, action: () => Promise<void>) => {
    setBusyId(busyKey);
    setError(null);
    try {
      await action();
      onChanged();
    } catch (caught) {
      setError(caught instanceof MatchServiceError ? caught.message : GENERIC_ERROR);
    } finally {
      setBusyId(null);
    }
  };

  const handleAdd = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setError('Informe o nome do jogador.');
      return;
    }
    if (availableSpots <= 0) {
      setError('Não há vagas disponíveis nesta partida.');
      return;
    }
    if (isGoalkeeper && availableGoalkeepers <= 0) {
      setError('Não há vagas de goleiro disponíveis nesta partida.');
      return;
    }
    await run('add', async () => {
      await addMatchPlayer(match.id, trimmed, isGoalkeeper, isExempt);
      setName('');
      setIsGoalkeeper(false);
      setIsExempt(false);
    });
  };

  const togglePaymentRelease = () =>
    run('release', () => setPaymentReleased(match.id, !match.paymentReleased));

  return (
    <div className="flex flex-col gap-6">
      {pricing && (
        <section aria-labelledby="release-title" className="flex flex-col gap-3 rounded-2xl bg-navy-50 p-4 ring-1 ring-navy-100 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-navy-600 shadow-sm">
              {match.paymentReleased ? <Unlock className="h-4 w-4" aria-hidden="true" /> : <Lock className="h-4 w-4" aria-hidden="true" />}
            </span>
            <div>
              <p id="release-title" className="text-sm font-bold text-navy-900">
                {match.paymentReleased ? 'Pagamento liberado para os jogadores' : 'Pagamento bloqueado'}
              </p>
              <p className="mt-1 text-xs text-navy-500">
                {match.paymentReleased
                  ? 'Os jogadores já podem pagar a vaga pelo aplicativo.'
                  : 'Libere para que os jogadores possam pagar pelo aplicativo.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={togglePaymentRelease}
            disabled={busyId !== null}
            className={`flex shrink-0 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-colors disabled:opacity-60 ${
              match.paymentReleased
                ? 'bg-white text-navy-800 ring-1 ring-navy-200 hover:bg-navy-100'
                : 'bg-pitch-500 text-navy-900 hover:bg-pitch-400'
            }`}
          >
            {busyId === 'release' && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {match.paymentReleased ? 'Bloquear pagamento' : 'Liberar pagamento'}
          </button>
        </section>
      )}

      <section aria-labelledby="players-title" className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 id="players-title" className="text-base font-extrabold text-navy-900">
            Jogadores ({match.players.length} de {match.totalSpots})
          </h3>
          {pricing && (
            <span className="rounded-full bg-pitch-100 px-3 py-1 text-xs font-bold text-pitch-800">
              {paidCount} pago(s)
            </span>
          )}
        </div>

        {match.players.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-navy-200 p-6 text-center text-sm text-navy-500">
            Nenhum jogador confirmado ainda.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {match.players.map((player) => (
              <li
                key={player.id}
                className="flex flex-wrap items-center gap-3 rounded-2xl bg-white p-3 ring-1 ring-navy-100"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-navy-900">{player.name}</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {player.isGoalkeeper && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800">Goleiro</span>
                    )}
                    {player.isExempt && (
                      <span className="rounded-full bg-navy-100 px-2 py-0.5 text-[11px] font-bold text-navy-700">Não paga</span>
                    )}
                    {player.teamNumber !== null && (
                      <span className="rounded-full bg-navy-100 px-2 py-0.5 text-[11px] font-bold text-navy-700">
                        Time {player.teamNumber}
                      </span>
                    )}
                  </div>
                </div>

                {pricing && !player.isExempt && (
                  <button
                    type="button"
                    onClick={() => run(player.id, () => setPlayerPaid(player.id, !player.isPaid))}
                    disabled={busyId !== null}
                    aria-pressed={player.isPaid}
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-colors disabled:opacity-60 ${
                      player.isPaid
                        ? 'bg-pitch-500 text-navy-900 hover:bg-pitch-400'
                        : 'bg-white text-navy-700 ring-1 ring-navy-200 hover:bg-navy-50'
                    }`}
                  >
                    {player.isPaid && <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />}
                    {player.isPaid ? 'Pago' : 'Marcar como pago'}
                  </button>
                )}

                {pricing && (
                  <button
                    type="button"
                    onClick={() => run(`${player.id}-exempt`, () => setPlayerExempt(player.id, !player.isExempt))}
                    disabled={busyId !== null}
                    aria-pressed={player.isExempt}
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-colors disabled:opacity-60 ${
                      player.isExempt
                        ? 'bg-navy-900 text-white hover:bg-navy-700'
                        : 'bg-white text-navy-700 ring-1 ring-navy-200 hover:bg-navy-50'
                    }`}
                  >
                    {player.isExempt ? 'Não paga' : 'Isentar'}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => run(player.id, () => removeMatchPlayer(player.id))}
                  disabled={busyId !== null}
                  aria-label={`Remover ${player.name}`}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60"
                >
                  {busyId === player.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <form onSubmit={handleAdd} noValidate className="flex flex-col gap-4 rounded-2xl bg-navy-50 p-4 ring-1 ring-navy-100">
        <h3 className="text-sm font-extrabold text-navy-900">Adicionar jogador</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <FormField label="Nome" htmlFor="player-name">
            <input
              id="player-name"
              className={INPUT_CLASS}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Nome do jogador"
              maxLength={80}
            />
          </FormField>
          <label className="flex items-center gap-2 pb-3 text-sm font-semibold text-navy-800">
            <input
              type="checkbox"
              checked={isGoalkeeper}
              onChange={(event) => {
                setIsGoalkeeper(event.target.checked);
                if (event.target.checked) setIsExempt(false);
              }}
              className="h-4 w-4 rounded border-navy-300 text-pitch-600 focus:ring-pitch-500"
            />
            É goleiro
          </label>
        </div>
        <label className="flex items-center gap-2 text-sm font-semibold text-navy-800">
          <input
            type="checkbox"
            checked={isExempt}
            onChange={(event) => setIsExempt(event.target.checked)}
            className="h-4 w-4 rounded border-navy-300 text-pitch-600 focus:ring-pitch-500"
          />
          Não paga (o valor é dividido só entre os demais)
        </label>
        <button
          type="submit"
          disabled={busyId !== null || availableSpots <= 0}
          className="flex items-center justify-center gap-2 rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-navy-700 disabled:cursor-not-allowed disabled:opacity-60 sm:self-end"
        >
          {busyId === 'add' ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <UserPlus className="h-4 w-4" aria-hidden="true" />}
          {availableSpots <= 0 ? 'Partida lotada' : 'Adicionar'}
        </button>
      </form>

      {error && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 ring-1 ring-red-100">
          {error}
        </p>
      )}
    </div>
  );
}
