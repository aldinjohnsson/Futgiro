import type { Court, Match } from '@/types/futgiro';

const TIME_ZONE = 'America/Sao_Paulo';

const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const weekdayFormatter = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', timeZone: TIME_ZONE });
const dayMonthFormatter = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', timeZone: TIME_ZONE });
const timeFormatter = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: TIME_ZONE });

export const WEEKDAY_NAMES = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];

export const WEEKDAY_SHORT_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export const formatCurrency = (value: number) => currencyFormatter.format(value);

export const formatWeekday = (iso: string) => capitalize(weekdayFormatter.format(new Date(iso)));

export const formatDayMonth = (iso: string) => dayMonthFormatter.format(new Date(iso)).replace('.', '');

export const formatTime = (iso: string) => timeFormatter.format(new Date(iso));

export const formatRating = (rating: number) => rating.toFixed(1).replace('.', ',');

export const getFilledSpots = (match: Match) => match.players.length;

export const getAvailableSpots = (match: Match) => match.totalSpots - getFilledSpots(match);

export const getAvailableGoalkeeperSpots = (match: Match) =>
  match.goalkeeperSpots - match.players.filter((player) => player.isGoalkeeper).length;

export type MatchPricing = {
  totalRent: number;
  payingPlayers: number;
  perPlayer: number;
};

// The court total is split only among players who actually pay; exempt players (e.g. goalkeepers
// marked as exempt) contribute nothing. The total stays fixed regardless of how many players join.
export const getMatchPricing = (match: Match): MatchPricing | null => {
  if (!match.requiresPayment || match.priceTotal === null) return null;
  const payingPlayers = match.players.filter((player) => !player.isExempt).length;
  return {
    totalRent: match.priceTotal,
    payingPlayers,
    perPlayer: payingPlayers > 0 ? match.priceTotal / payingPlayers : 0,
  };
};

export const findCourt = (courts: Court[], courtId: string) => courts.find((court) => court.id === courtId);

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
