import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Loader2, Trash2, X } from 'lucide-react';
import FormField, { INPUT_CLASS } from '@/components/common/FormField';
import ModalShell from '@/components/common/ModalShell';
import { createCourt, CourtServiceError, deleteCourt, replaceCourtSlots, updateCourt, type CourtInput, type CourtSlotInput } from '@/services/courtService';
import { WEEKDAY_NAMES } from '@/lib/format';
import type { Court, CourtSlot } from '@/types/futgiro';

type CourtFormModalProps = {
  court: Court | null;
  onClose: () => void;
  onSaved: () => void;
};

type FormValues = {
  name: string;
  city: string;
  address: string;
  photoUrl: string;
  priceTotal: string;
};

type DayHours = {
  weekday: number;
  enabled: boolean;
  from: string;
  to: string;
};

const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

const DEFAULT_FROM = '18:00';
const DEFAULT_TO = '22:30';
const SLOT_MINUTES = 60;

const buildDayHours = (slots: CourtSlot[]): DayHours[] =>
  WEEKDAY_ORDER.map((weekday) => {
    const times = slots.filter((slot) => slot.weekday === weekday).map((slot) => slot.startTime).sort();
    const first = times[0];
    const last = times[times.length - 1];
    return {
      weekday,
      enabled: times.length > 0,
      from: first ?? DEFAULT_FROM,
      to: last ? addMinutes(last, SLOT_MINUTES) : DEFAULT_TO,
    };
  });

const toMinutes = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const toTimeLabel = (totalMinutes: number) => {
  const clamped = Math.min(Math.max(totalMinutes, 0), 24 * 60);
  const hours = Math.floor(clamped / 60) % 24;
  const minutes = clamped % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

const addMinutes = (time: string, amount: number) => toTimeLabel(toMinutes(time) + amount);

const generateStartTimes = (from: string, to: string): string[] => {
  const start = toMinutes(from);
  const end = toMinutes(to);
  if (end <= start) return [];
  const times: string[] = [];
  for (let time = start; time + SLOT_MINUTES <= end; time += SLOT_MINUTES) {
    times.push(toTimeLabel(time));
  }
  return times;
};

const parseMoney = (value: string) => Number(value.replace(',', '.'));

const toFormValues = (court: Court | null): FormValues => ({
  name: court?.name ?? '',
  city: court?.city ?? '',
  address: court?.address ?? '',
  photoUrl: court?.photoUrl ?? '',
  priceTotal: court?.priceTotal !== null && court?.priceTotal !== undefined ? String(court.priceTotal).replace('.', ',') : '',
});

const isValidHttpsUrl = (value: string) => {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
};

const validate = (values: FormValues, dayHours: DayHours[]): string | null => {
  if (values.name.trim().length < 2) return 'Informe o nome da quadra.';
  if (values.city.trim().length < 2) return 'Informe a cidade.';
  if (values.address.trim().length < 3) return 'Informe o endereço da quadra.';
  if (values.photoUrl.trim() && !isValidHttpsUrl(values.photoUrl.trim())) {
    return 'O endereço da foto precisa começar com https://';
  }
  if (dayHours.every((day) => !day.enabled)) return 'Marque pelo menos um dia de funcionamento.';
  for (const day of dayHours.filter((day) => day.enabled)) {
    if (generateStartTimes(day.from, day.to).length === 0) {
      return `Em ${WEEKDAY_NAMES[day.weekday]}, o fim precisa ser depois do início (mínimo 1 hora).`;
    }
  }
  return null;
};

export default function CourtFormModal({ court, onClose, onSaved }: CourtFormModalProps) {
  const [values, setValues] = useState<FormValues>(() => toFormValues(court));
  const [dayHours, setDayHours] = useState<DayHours[]>(() => buildDayHours(court?.slots ?? []));
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const isEditing = court !== null;
  const titleId = 'court-form-title';

  const updateField = (field: keyof FormValues) => (event: ChangeEvent<HTMLInputElement>) => {
    setValues((current) => ({ ...current, [field]: event.target.value }));
  };

  const updateDay = (weekday: number, patch: Partial<DayHours>) => {
    setDayHours((current) => current.map((day) => (day.weekday === weekday ? { ...day, ...patch } : day)));
  };

  const toCourtInput = (): CourtInput => ({
    name: values.name.trim(),
    city: values.city.trim(),
    address: values.address.trim(),
    photoUrl: values.photoUrl.trim() || null,
    priceTotal: values.priceTotal.trim() ? parseMoney(values.priceTotal) : null,
  });

  const toSlotInput = (): CourtSlotInput[] =>
    dayHours
      .filter((day) => day.enabled)
      .map((day) => ({ weekday: day.weekday, startTimes: generateStartTimes(day.from, day.to) }));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationError = validate(values, dayHours);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      if (court) {
        await updateCourt(court.id, toCourtInput());
        await replaceCourtSlots(court.id, toSlotInput());
      } else {
        await createCourt(toCourtInput(), toSlotInput());
      }
      onSaved();
    } catch (caught) {
      setError(caught instanceof CourtServiceError ? caught.message : 'Algo deu errado. Tente novamente.');
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!court) return;
    setIsSaving(true);
    setError(null);
    try {
      await deleteCourt(court.id);
      onSaved();
    } catch (caught) {
      setError(caught instanceof CourtServiceError ? caught.message : 'Algo deu errado. Tente novamente.');
      setIsSaving(false);
      setConfirmingDelete(false);
    }
  };

  return (
    <ModalShell titleId={titleId} onClose={onClose}>
      <div className="flex items-center justify-between gap-4 border-b border-navy-100 p-5 sm:p-6">
        <div>
          <h2 id={titleId} className="text-xl font-extrabold text-navy-900">
            {isEditing ? 'Editar quadra' : 'Cadastrar quadra'}
          </h2>
          <p className="mt-1 text-sm text-navy-500">Preencha os dados que aparecerão para os jogadores.</p>
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

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 overflow-y-auto p-5 sm:p-6" noValidate>
        <FormField label="Nome da quadra" htmlFor="court-name">
          <input
            id="court-name"
            className={INPUT_CLASS}
            value={values.name}
            onChange={updateField('name')}
            placeholder="Ex.: Arena do Vale"
            maxLength={80}
          />
        </FormField>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField label="Cidade" htmlFor="court-city">
            <input
              id="court-city"
              className={INPUT_CLASS}
              value={values.city}
              onChange={updateField('city')}
              placeholder="Ex.: Rio Branco do Sul"
              maxLength={80}
            />
          </FormField>
          <FormField label="Endereço" htmlFor="court-address">
            <input
              id="court-address"
              className={INPUT_CLASS}
              value={values.address}
              onChange={updateField('address')}
              placeholder="Rua, número e bairro"
              maxLength={160}
            />
          </FormField>
        </div>

        <FormField label="Endereço da foto (opcional)" htmlFor="court-photo" hint="Se deixar em branco, usaremos uma foto padrão.">
          <input
            id="court-photo"
            type="url"
            className={INPUT_CLASS}
            value={values.photoUrl}
            onChange={updateField('photoUrl')}
            placeholder="https://..."
          />
        </FormField>

        <FormField
          label="Valor total da quadra (R$)"
          htmlFor="court-price-total"
          hint="Aluguel total do horário. Na partida, o valor é dividido entre quem paga."
        >
          <input
            id="court-price-total"
            inputMode="decimal"
            className={INPUT_CLASS}
            value={values.priceTotal}
            onChange={updateField('priceTotal')}
            placeholder="Ex.: 120,00"
          />
        </FormField>

        <fieldset className="flex flex-col gap-3">
          <legend className="text-sm font-bold text-navy-800">Horário de funcionamento</legend>
          <p className="text-xs text-navy-500">
            Em cada dia marcado criamos partidas de 1 em 1 hora. Ex.: das 18:00 às 22:30 gera 18:00, 19:00, 20:00, 21:00 e 22:00.
          </p>
          <ul className="flex flex-col gap-2">
            {dayHours.map((day) => (
              <li
                key={day.weekday}
                className={`flex flex-wrap items-center gap-2 rounded-xl p-3 ring-1 transition-colors sm:gap-3 ${
                  day.enabled ? 'bg-pitch-50 ring-pitch-100' : 'bg-navy-50 ring-navy-100'
                }`}
              >
                <label className="flex w-28 shrink-0 items-center gap-2 text-sm font-bold text-navy-800">
                  <input
                    type="checkbox"
                    checked={day.enabled}
                    onChange={(event) => updateDay(day.weekday, { enabled: event.target.checked })}
                    className="h-4 w-4 accent-pitch-600"
                  />
                  {WEEKDAY_NAMES[day.weekday]}
                </label>
                {day.enabled ? (
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-navy-500">Das</span>
                    <input
                      type="time"
                      aria-label={`Início em ${WEEKDAY_NAMES[day.weekday]}`}
                      className="w-28 rounded-lg border border-navy-200 bg-white px-2 py-1.5 text-sm text-navy-900 focus:border-pitch-500 focus:outline-none focus:ring-2 focus:ring-pitch-200"
                      value={day.from}
                      onChange={(event) => updateDay(day.weekday, { from: event.target.value })}
                    />
                    <span className="text-xs font-semibold text-navy-500">até</span>
                    <input
                      type="time"
                      aria-label={`Fim em ${WEEKDAY_NAMES[day.weekday]}`}
                      className="w-28 rounded-lg border border-navy-200 bg-white px-2 py-1.5 text-sm text-navy-900 focus:border-pitch-500 focus:outline-none focus:ring-2 focus:ring-pitch-200"
                      value={day.to}
                      onChange={(event) => updateDay(day.weekday, { to: event.target.value })}
                    />
                    <span className="text-xs font-semibold text-pitch-700">
                      {generateStartTimes(day.from, day.to).length} horários
                    </span>
                  </span>
                ) : (
                  <span className="text-xs text-navy-400">Fechado</span>
                )}
              </li>
            ))}
          </ul>
        </fieldset>

        {error && (
          <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 ring-1 ring-red-100">
            {error}
          </p>
        )}

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
          {isEditing ? (
            confirmingDelete ? (
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <span className="text-xs font-semibold text-navy-600">Os horários desta quadra também serão removidos.</span>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isSaving}
                  className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-red-500 disabled:opacity-60"
                >
                  Confirmar exclusão
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmingDelete(true)}
                disabled={isSaving}
                className="flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Excluir quadra
              </button>
            )
          ) : (
            <span />
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center justify-center gap-2 rounded-xl bg-pitch-500 px-6 py-3 text-sm font-bold text-navy-900 shadow-lg shadow-pitch-500/25 transition-all hover:bg-pitch-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {isEditing ? 'Salvar alterações' : 'Cadastrar quadra'}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
