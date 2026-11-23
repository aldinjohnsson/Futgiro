import { useState, type FormEvent } from 'react';
import { Clock, Loader2, Plus, X } from 'lucide-react';
import ModalShell from '@/components/common/ModalShell';
import { WEEKDAY_NAMES, WEEKDAY_SHORT_NAMES } from '@/lib/format';
import { addCourtSlot, CourtServiceError, removeCourtSlot } from '@/services/courtService';
import type { Court } from '@/types/futgiro';

type CourtSlotsModalProps = {
  court: Court;
  onClose: () => void;
  onChanged: () => void;
};

const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

const INPUT_CLASS =
  'w-full rounded-xl border border-navy-200 bg-white px-4 py-3 text-sm text-navy-900 transition-colors focus:border-pitch-500 focus:outline-none focus:ring-2 focus:ring-pitch-200';

export default function CourtSlotsModal({ court, onClose, onChanged }: CourtSlotsModalProps) {
  const [weekday, setWeekday] = useState(5);
  const [startTime, setStartTime] = useState('18:00');
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const runAction = async (action: () => Promise<void>, fallbackMessage: string) => {
    setIsBusy(true);
    setError(null);
    try {
      await action();
      onChanged();
    } catch (caught) {
      setError(caught instanceof CourtServiceError ? caught.message : fallbackMessage);
    } finally {
      setIsBusy(false);
    }
  };

  const handleAdd = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!startTime) {
      setError('Escolha o horário de início.');
      return;
    }
    void runAction(() => addCourtSlot(court.id, weekday, startTime), 'Não foi possível adicionar o horário.');
  };

  const handleRemove = (slotId: string) => {
    void runAction(() => removeCourtSlot(slotId), 'Não foi possível remover o horário.');
  };

  const titleId = 'court-slots-title';

  return (
    <ModalShell titleId={titleId} onClose={onClose}>
      <div className="flex items-start justify-between gap-4 border-b border-navy-100 p-5 sm:p-6">
        <div className="min-w-0">
          <h2 id={titleId} className="text-xl font-extrabold text-navy-900">
            Horários disponíveis
          </h2>
          <p className="mt-1 truncate text-sm text-navy-500">{court.name}</p>
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

      <div className="flex flex-col gap-6 overflow-y-auto p-5 sm:p-6">
        <form onSubmit={handleAdd} className="flex flex-col gap-3 rounded-2xl bg-navy-50 p-4 sm:flex-row sm:items-end" noValidate>
          <div className="flex flex-1 flex-col gap-2">
            <label htmlFor="slot-weekday" className="text-sm font-bold text-navy-800">
              Dia da semana
            </label>
            <select
              id="slot-weekday"
              className={INPUT_CLASS}
              value={weekday}
              onChange={(event) => setWeekday(Number(event.target.value))}
            >
              {WEEKDAY_ORDER.map((day) => (
                <option key={day} value={day}>
                  {WEEKDAY_NAMES[day]}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-1 flex-col gap-2">
            <label htmlFor="slot-time" className="text-sm font-bold text-navy-800">
              Início
            </label>
            <input
              id="slot-time"
              type="time"
              className={INPUT_CLASS}
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={isBusy}
            className="flex items-center justify-center gap-2 rounded-xl bg-pitch-500 px-5 py-3 text-sm font-bold text-navy-900 transition-colors hover:bg-pitch-400 disabled:opacity-60"
          >
            {isBusy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Plus className="h-4 w-4" aria-hidden="true" />}
            Adicionar
          </button>
        </form>

        {error && (
          <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 ring-1 ring-red-100">
            {error}
          </p>
        )}

        {court.slots.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-navy-200 p-6 text-center text-sm text-navy-500">
            Nenhum horário cadastrado. Adicione os dias e horários em que a quadra recebe jogos.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {WEEKDAY_ORDER.map((day) => {
              const daySlots = court.slots.filter((slot) => slot.weekday === day);
              if (daySlots.length === 0) return null;
              return (
                <div key={day} className="flex flex-col gap-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-navy-500">{WEEKDAY_SHORT_NAMES[day]} · {WEEKDAY_NAMES[day]}</h3>
                  <ul className="flex flex-wrap gap-2">
                    {daySlots.map((slot) => (
                      <li
                        key={slot.id}
                        className="flex items-center gap-2 rounded-lg bg-pitch-50 py-1.5 pl-3 pr-1.5 text-xs font-bold text-pitch-800 ring-1 ring-pitch-100"
                      >
                        <Clock className="h-3 w-3" aria-hidden="true" />
                        {slot.startTime}
                        <button
                          type="button"
                          onClick={() => handleRemove(slot.id)}
                          disabled={isBusy}
                          aria-label={`Remover horário ${slot.startTime}`}
                          className="flex h-5 w-5 items-center justify-center rounded-md text-pitch-800 transition-colors hover:bg-pitch-200 disabled:opacity-50"
                        >
                          <X className="h-3 w-3" aria-hidden="true" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </ModalShell>
  );
}
