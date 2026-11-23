import { supabase } from '@/lib/supabase';
import type { Match, MatchPlayer } from '@/types/futgiro';

const MATCH_COLUMNS =
  'id, owner_id, court_id, modality, starts_at, total_spots, goalkeeper_spots, requires_payment, price_normal, organizer_name, payment_released_at, match_players(id, player_name, is_goalkeeper, is_exempt, team_number, is_paid)';

type PlayerRow = {
  id: string;
  player_name: string;
  is_goalkeeper: boolean;
  is_exempt: boolean;
  team_number: number | null;
  is_paid: boolean;
};

type MatchRow = {
  id: string;
  owner_id: string | null;
  court_id: string;
  modality: string;
  starts_at: string;
  total_spots: number;
  goalkeeper_spots: number;
  requires_payment: boolean;
  price_normal: number | string | null;
  organizer_name: string;
  payment_released_at: string | null;
  match_players: PlayerRow[];
};

export type MatchInput = {
  courtId: string;
  modality: string;
  startsAt: string;
  totalSpots: number;
  goalkeeperSpots: number;
  priceTotal: number | null;
  organizerName: string;
};

export class MatchServiceError extends Error {}

const toNumberOrNull = (value: number | string | null) => (value === null ? null : Number(value));

const mapPlayer = (row: PlayerRow): MatchPlayer => ({
  id: row.id,
  name: row.player_name,
  isGoalkeeper: row.is_goalkeeper,
  isExempt: row.is_exempt,
  teamNumber: row.team_number,
  isPaid: row.is_paid,
});

const mapMatch = (row: MatchRow): Match => ({
  id: row.id,
  ownerId: row.owner_id,
  modality: row.modality,
  startsAt: row.starts_at,
  courtId: row.court_id,
  totalSpots: row.total_spots,
  goalkeeperSpots: row.goalkeeper_spots,
  requiresPayment: row.requires_payment,
  priceTotal: toNumberOrNull(row.price_normal),
  organizer: row.organizer_name,
  paymentReleased: row.payment_released_at !== null,
  players: row.match_players.map(mapPlayer).sort((a, b) => a.name.localeCompare(b.name)),
});

const DATABASE_RAISE_CODE = 'P0001';
const UNIQUE_VIOLATION_CODE = '23505';

// Database rule messages are written in Portuguese and safe to show to the user.
const toServiceError = (code: string | undefined, message: string, fallback: string) =>
  new MatchServiceError(code === DATABASE_RAISE_CODE ? message : fallback);

export async function fetchMatches(): Promise<Match[]> {
  const { data, error } = await supabase
    .from('matches')
    .select(MATCH_COLUMNS)
    .order('starts_at');
  if (error) throw new MatchServiceError('Não foi possível carregar as partidas.');
  return (data as MatchRow[]).map(mapMatch);
}

export async function createMatch(input: MatchInput): Promise<void> {
  const { error } = await supabase.from('matches').insert({
    court_id: input.courtId,
    modality: input.modality,
    starts_at: input.startsAt,
    total_spots: input.totalSpots,
    goalkeeper_spots: input.goalkeeperSpots,
    requires_payment: input.priceTotal !== null,
    price_normal: input.priceTotal,
    organizer_name: input.organizerName,
  });
  if (error?.code === UNIQUE_VIOLATION_CODE) {
    throw new MatchServiceError('Este horário acabou de ser reservado. Escolha outro horário.');
  }
  if (error) throw new MatchServiceError('Não foi possível criar a partida.');
}

export async function setPaymentReleased(matchId: string, released: boolean): Promise<void> {
  const { error } = await supabase
    .from('matches')
    .update({ payment_released_at: released ? new Date().toISOString() : null })
    .eq('id', matchId);
  if (error) throw new MatchServiceError('Não foi possível atualizar a liberação do pagamento.');
}

export async function addMatchPlayer(
  matchId: string,
  name: string,
  isGoalkeeper: boolean,
  isExempt: boolean,
): Promise<void> {
  const { error } = await supabase
    .from('match_players')
    .insert({ match_id: matchId, player_name: name, is_goalkeeper: isGoalkeeper, is_exempt: isExempt });
  if (error) throw toServiceError(error.code, error.message, 'Não foi possível adicionar o jogador.');
}

export async function setPlayerExempt(playerId: string, isExempt: boolean): Promise<void> {
  const { error } = await supabase.from('match_players').update({ is_exempt: isExempt }).eq('id', playerId);
  if (error) throw new MatchServiceError('Não foi possível atualizar a isenção do jogador.');
}

export async function removeMatchPlayer(playerId: string): Promise<void> {
  const { error } = await supabase.from('match_players').delete().eq('id', playerId);
  if (error) throw new MatchServiceError('Não foi possível remover o jogador.');
}

export async function setPlayerPaid(playerId: string, isPaid: boolean): Promise<void> {
  const { error } = await supabase.from('match_players').update({ is_paid: isPaid }).eq('id', playerId);
  if (error) throw new MatchServiceError('Não foi possível atualizar o pagamento do jogador.');
}

export async function saveTeamAssignments(assignments: Map<string, number>): Promise<void> {
  const results = await Promise.all(
    Array.from(assignments, ([playerId, teamNumber]) =>
      supabase.from('match_players').update({ team_number: teamNumber }).eq('id', playerId),
    ),
  );
  if (results.some((result) => result.error)) {
    throw new MatchServiceError('Não foi possível salvar os times. Tente sortear novamente.');
  }
}
