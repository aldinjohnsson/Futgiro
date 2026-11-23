import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { CalendarDays, Check, Loader2, MapPin, X } from 'lucide-react';
import FormField, { INPUT_CLASS } from '@/components/common/FormField';
import ModalShell from '@/components/common/ModalShell';
import { formatCurrency } from '@/lib/format';
import { getBookableSlots, type BookableSlot } from '@/lib/matchSlots';
import { createMatch, MatchServiceError, type MatchInput } from '@/services/matchService';
import type { Court, Match } from '@/types/futgiro';

type CreateMatchModalProps = {
  courts: Court[];
  matches: Match[];
  onClose: () => void;
  onSaved: () => void;
};

type FormValues = {
  courtId: string;
  modality: string;
  date: string;
  slotKey: string;
  totalSpots: string;
  goalkeeperSpots: string;
  organizerName: string;
};

const MODALITY_OPTIONS = ['Futebol Society', 'Futsal', 'Society Feminino', 'Futebol de Campo'];
const MIN_SPOTS = 2;
const MAX_SPOTS = 40;

const INITIAL_VALUES: FormValues = {
  courtId: '',
  modality: MODALITY_OPTIONS[0],
  date: '',
  slotKey: '',
  totalSpots: '12',
  goalkeeperSpots: '1',
  organizerName: '',
};

const getTodayIsoDate = () => {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
};

const validate = (values: FormValues, selectedSlot: BookableSlot | undefined): string | null => {
  if (!values.courtId) return 'Escolha a quadra da partida.';
  if (!values.date) return 'Escolha a data da partida.';
  if (!selectedSlot) return 'Escolha um horário disponível.';

  const totalSpots = Number(values.totalSpots);
  if (!Number.isInteger(totalSpots) || totalSpots < MIN_SPOTS || totalSpots > MAX_SPOTS) {
    return `A partida precisa ter entre ${MIN_SPOTS} e ${MAX_SPOTS} vagas.`;
  }

  const goalkeeperSpots = Number(values.goalkeeperSpots);
  if (!Number.isInteger(goalkeeperSpots) || goalkeeperSpots < 0 || goalkeeperSpots > totalSpots) {
    return 'A quantidade de goleiros não pode passar do total de vagas.';
  }

  if (values.organizerName.trim().length < 2) return 'Informe o nome do organizador.';

  return null;
};

const toMatchInput = (values: FormValues, slot: BookableSlot, court: Court): MatchInput => ({
  courtId: slot.courtId,
  modality: values.modality,
  startsAt: slot.startsAt,
  totalSpots: Number(values.totalSpots),
  goalkeeperSpots: Number(values.goalkeeperSpots),
  priceTotal: court.priceTotal,
  organizerName: values.organizerName.trim(),
});

export default function CreateMatchModal({ courts, matches, onClose, onSaved }: CreateMatchModalProps) {
  const [values, setValues] = useState<FormValues>(INITIAL_VALUES);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const today = useMemo(getTodayIsoDate, []);

  const titleId = 'create-match-title';
  const selectedCourt = courts.find((court) => court.id === values.courtId);
  const bookableSlots = useMemo(
    () => (selectedCourt ? getBookableSlots([selectedCourt], matches, values.date, Date.now()) : []),
    [selectedCourt, matches, values.date],
  );
  const selectedSlot = bookableSlots.find((slot) => slot.key === values.slotKey);

  const updateField = (field: keyof FormValues) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setValues((current) => ({ ...current, [field]: event.target.value }));
  };

  const selectCourt = (courtId: string) => {
    setValues((current) => ({ ...current, courtId, date: '', slotKey: '' }));
  };

  const updateDate = (event: ChangeEvent<HTMLInputElement>) => {
    setValues((current) => ({ ...current, date: event.target.value, slotKey: '' }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationError = validate(values, selectedSlot);
    if (validationError || !selectedSlot || !selectedCourt) {
      setError(validationError);
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      await createMatch(toMatchInput(values, selectedSlot, selectedCourt));
      onSaved();
    } catch (caught) {
      setError(caught instanceof MatchServiceError ? caught.message : 'Algo deu errado. Tente novamente.');
      setIsSaving(false);
    }
  };

  return (
    <ModalShell titleId={titleId} onClose={onClose}>
      <div className="flex items-center justify-between gap-4 border-b border-navy-100 p-5 sm:p-6">
        <div>
          <h2 id={titleId} className="text-xl font-extrabold text-navy-900">
            Criar partida
          </h2>
          <p className="mt-1 text-sm text-navy-500">Escolha a quadra, a data e um horário livre.</p>
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

      {courts.length === 0 ? (
        <p className="p-5 text-sm text-navy-600 sm:p-6">Cadastre pelo menos uma quadra antes de criar uma partida.</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 overflow-y-auto p-5 sm:p-6" noValidate>
          <fieldset className="flex flex-col gap-3">
            <legend className="mb-2 text-sm font-bold text-navy-800">Quadra</legend>
            {courts.map((court) => {
              const isChecked = court.id === values.courtId;
              return (
                <button
                  key={court.id}
                  type="button"
                  role="radio"
                  aria-checked={isChecked}
                  onClick={() => selectCourt(court.id)}
                  className={`flex w-full items-center gap-4 rounded-2xl p-3 text-left ring-1 transition-all ${
                    isChecked ? 'bg-pitch-50 ring-pitch-400' : 'bg-white ring-navy-100 hover:ring-navy-300'
                  }`}
                >
                  <img src={court.photoUrl} alt="" aria-hidden="true" className="h-14 w-14 shrink-0 rounded-xl object-cover" />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-bold text-navy-900">{court.name}</span>
                    <span className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-navy-500">
                      <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
                      {court.city}
                    </span>
                  </span>
                  {isChecked && (
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-pitch-600 text-white">
                      <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />
                    </span>
                  )}
                </button>
              );
            })}
          </fieldset>

          {selectedCourt && (
            <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 animate-fade-in">
            <FormField label="Data da partida" htmlFor="match-date">              <input
                id="match-date"
                type="date"
                min={today}
                className={INPUT_CLASS}
                value={values.date}
                onChange={updateDate}
              />
            </FormField>
            <FormField label="Modalidade" htmlFor="match-modality">
              <select id="match-modality" className={INPUT_CLASS} value={values.modality} onChange={updateField('modality')}>
                {MODALITY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <fieldset className="flex flex-col gap-3">
            <legend className="mb-2 text-sm font-bold text-navy-800">Horário disponível</legend>
            {!values.date && (
              <p className="rounded-2xl border border-dashed border-navy-200 p-5 text-center text-sm text-navy-500">
                Escolha uma data para ver as quadras com horário livre.
              </p>
            )}
            {values.date && bookableSlots.length === 0 && (
              <p className="rounded-2xl border border-dashed border-navy-200 p-5 text-center text-sm text-navy-500">
                Nenhum horário livre nessa data. Escolha outro dia.
              </p>
            )}
            {bookableSlots.map((slot) => {
              const isChecked = slot.key === values.slotKey;
              return (
                <button
                  key={slot.key}
                  type="button"
                  role="radio"
                  aria-checked={isChecked}
                  onClick={() => setValues((current) => ({ ...current, slotKey: slot.key }))}
                  className={`flex w-full items-center gap-4 rounded-2xl p-4 text-left ring-1 transition-all ${
                    isChecked ? 'bg-pitch-50 ring-pitch-400' : 'bg-white ring-navy-100 hover:ring-navy-300'
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                      isChecked ? 'border-pitch-600 bg-pitch-600 text-white' : 'border-navy-300 bg-white'
                    }`}
                  >
                    {isChecked && <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-bold text-navy-900">{slot.courtName}</span>
                    <span className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-navy-500">
                      <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
                      {slot.courtCity}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-navy-900 px-3 py-1.5 text-sm font-extrabold text-white">
                    <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                    {slot.time}
                  </span>
                </button>
              );
            })}
          </fieldset>
            </>
          )}

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <FormField label="Total de vagas" htmlFor="match-spots" hint={`Entre ${MIN_SPOTS} e ${MAX_SPOTS} jogadores.`}>
              <input
                id="match-spots"
                type="number"
                inputMode="numeric"
                min={MIN_SPOTS}
                max={MAX_SPOTS}
                className={INPUT_CLASS}
                value={values.totalSpots}
                onChange={updateField('totalSpots')}
              />
            </FormField>
            <FormField label="Vagas de goleiro" htmlFor="match-goalkeepers" hint="Use 0 se não houver goleiro fixo.">
              <input
                id="match-goalkeepers"
                type="number"
                inputMode="numeric"
                min={0}
                className={INPUT_CLASS}
                value={values.goalkeeperSpots}
                onChange={updateField('goalkeeperSpots')}
              />
            </FormField>
          </div>

          {selectedCourt && (
            <div className="flex items-center justify-between gap-4 rounded-2xl bg-navy-50 p-4 ring-1 ring-navy-100">
              <div>
                <p className="text-sm font-bold text-navy-900">Valor da quadra</p>
                {selectedCourt.priceTotal !== null ? (
                  <p className="mt-1 text-xs text-navy-500">
                    Total de {formatCurrency(selectedCourt.priceTotal)}, dividido entre quem pagar na partida.
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-navy-500">Esta quadra não tem valor definido.</p>
                )}
              </div>
            </div>
          )}

          <FormField label="Nome do organizador" htmlFor="match-organizer">
            <input
              id="match-organizer"
              className={INPUT_CLASS}
              value={values.organizerName}
              onChange={updateField('organizerName')}
              placeholder="Como os jogadores vão te reconhecer"
              maxLength={80}
            />
          </FormField>

          {error && (
            <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 ring-1 ring-red-100">
              {error}
            </p>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center justify-center gap-2 rounded-xl bg-pitch-500 px-6 py-3 text-sm font-bold text-navy-900 shadow-lg shadow-pitch-500/25 transition-all hover:bg-pitch-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              Criar partida
            </button>
          </div>
        </form>
      )}
    </ModalShell>
  );
}
