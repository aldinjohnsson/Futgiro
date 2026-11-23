import { supabase } from '@/lib/supabase';
import type { Court, CourtSlot } from '@/types/futgiro';

export const DEFAULT_COURT_PHOTO_URL =
  'https://images.pexels.com/photos/15521639/pexels-photo-15521639.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';

const COURT_COLUMNS =
  'id, owner_id, name, city, address, photo_url, rating, review_count, price_total, court_slots(id, weekday, start_time)';

type SlotRow = {
  id: string;
  weekday: number;
  start_time: string;
};

type CourtRow = {
  id: string;
  owner_id: string | null;
  name: string;
  city: string;
  address: string;
  photo_url: string | null;
  rating: number | string | null;
  review_count: number;
  price_total: number | string | null;
  court_slots: SlotRow[];
};

export type CourtInput = {
  name: string;
  city: string;
  address: string;
  photoUrl: string | null;
  priceTotal: number | null;
};

export type CourtSlotInput = {
  weekday: number;
  startTimes: string[];
};

const DUPLICATE_KEY_CODE = '23505';
const FOREIGN_KEY_VIOLATION_CODE = '23503';

export class CourtServiceError extends Error {}

const toNumberOrNull = (value: number | string | null) => (value === null ? null : Number(value));

const mapSlot = (row: SlotRow): CourtSlot => ({
  id: row.id,
  weekday: row.weekday,
  startTime: row.start_time.slice(0, 5),
});

const mapCourt = (row: CourtRow): Court => ({
  id: row.id,
  ownerId: row.owner_id,
  name: row.name,
  city: row.city,
  address: row.address,
  rating: row.rating === null ? null : Number(row.rating),
  reviewCount: row.review_count,
  photoUrl: row.photo_url ?? DEFAULT_COURT_PHOTO_URL,
  priceTotal: toNumberOrNull(row.price_total),
  slots: row.court_slots
    .map(mapSlot)
    .sort((a, b) => a.weekday - b.weekday || a.startTime.localeCompare(b.startTime)),
});

export async function fetchCourts(): Promise<Court[]> {
  const { data, error } = await supabase.from('courts').select(COURT_COLUMNS).order('name');
  if (error) throw new CourtServiceError('Não foi possível carregar as quadras.');
  return (data as CourtRow[]).map(mapCourt);
}

export async function createCourt(input: CourtInput, slots: CourtSlotInput[]): Promise<void> {
  const { data, error } = await supabase.from('courts').insert(toCourtRow(input)).select('id').maybeSingle();
  if (error || !data) throw new CourtServiceError('Não foi possível cadastrar a quadra.');
  await replaceCourtSlots((data as { id: string }).id, slots);
}

export async function updateCourt(courtId: string, input: CourtInput): Promise<void> {
  const { error } = await supabase.from('courts').update(toCourtRow(input)).eq('id', courtId);
  if (error) throw new CourtServiceError('Não foi possível salvar as alterações da quadra.');
}

export async function deleteCourt(courtId: string): Promise<void> {
  const { error } = await supabase.from('courts').delete().eq('id', courtId);
  if (error?.code === FOREIGN_KEY_VIOLATION_CODE) {
    throw new CourtServiceError('Esta quadra tem partidas cadastradas e não pode ser excluída.');
  }
  if (error) throw new CourtServiceError('Não foi possível excluir a quadra.');
}

export async function addCourtSlot(courtId: string, weekday: number, startTime: string): Promise<void> {
  const { error } = await supabase
    .from('court_slots')
    .insert({ court_id: courtId, weekday, start_time: startTime });
  if (error?.code === DUPLICATE_KEY_CODE) throw new CourtServiceError('Este horário já está cadastrado.');
  if (error) throw new CourtServiceError('Não foi possível adicionar o horário.');
}

export async function removeCourtSlot(slotId: string): Promise<void> {
  const { error } = await supabase.from('court_slots').delete().eq('id', slotId);
  if (error) throw new CourtServiceError('Não foi possível remover o horário.');
}

const toCourtRow = (input: CourtInput) => ({
  name: input.name,
  city: input.city,
  address: input.address,
  photo_url: input.photoUrl,
  price_total: input.priceTotal,
});

export async function replaceCourtSlots(courtId: string, slots: CourtSlotInput[]): Promise<void> {
  const rows = slots.flatMap((slot) =>
    slot.startTimes.map((startTime) => ({ court_id: courtId, weekday: slot.weekday, start_time: startTime })),
  );
  const { error } = await supabase.from('court_slots').delete().eq('court_id', courtId);
  if (error) throw new CourtServiceError('Não foi possível atualizar os horários.');
  if (rows.length > 0) {
    const { error: insertError } = await supabase.from('court_slots').insert(rows);
    if (insertError) throw new CourtServiceError('Não foi possível atualizar os horários.');
  }
}
