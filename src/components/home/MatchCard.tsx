import { CalendarDays, Clock, MapPin, TrendingDown } from 'lucide-react';
import {
  formatCurrency,
  formatDayMonth,
  formatTime,
  formatWeekday,
  getAvailableSpots,
  getFilledSpots,
  getMatchPricing,
} from '@/lib/format';
import type { Court, Match } from '@/types/futgiro';

type MatchCardProps = {
  match: Match;
  court: Court;
  onOpen: (match: Match) => void;
};

export default function MatchCard({ match, court, onOpen }: MatchCardProps) {
  const availableSpots = getAvailableSpots(match);
  const fillPercent = Math.round((getFilledSpots(match) / match.totalSpots) * 100);
  const pricing = getMatchPricing(match);

  return (
    <button
      type="button"
      onClick={() => onOpen(match)}
      className="group flex w-full flex-col overflow-hidden rounded-3xl bg-white text-left shadow-card ring-1 ring-navy-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pitch-500"
    >
      <div className="relative h-40 overflow-hidden">
        <img
          src={court.photoUrl}
          alt={`Quadra ${court.name}`}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900/70 to-transparent" />
        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-navy-800">
          {match.modality}
        </span>
        {pricing && (
          <span className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-pitch-400 px-3 py-1 text-xs font-extrabold text-navy-900">
            <TrendingDown className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden="true" />
            Total {formatCurrency(pricing.totalRent)} · {formatCurrency(pricing.perPlayer)} por jogador
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-extrabold leading-tight text-navy-900">{court.name}</h3>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-navy-500">
            <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{court.city}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-semibold text-navy-700">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4 text-navy-400" aria-hidden="true" />
            {formatWeekday(match.startsAt)}, {formatDayMonth(match.startsAt)}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-navy-400" aria-hidden="true" />
            {formatTime(match.startsAt)}
          </span>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between text-xs font-semibold">
            <span className="text-navy-700">
              {availableSpots} de {match.totalSpots} vagas disponíveis
            </span>
            <span className="text-navy-400">{fillPercent}% preenchido</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-navy-100">
            <div className="h-full rounded-full bg-pitch-500 transition-all duration-500" style={{ width: `${fillPercent}%` }} />
          </div>
        </div>

        <div className="mt-auto rounded-2xl bg-pitch-50 p-4 ring-1 ring-pitch-100">
          {pricing ? (
            <>
              <p className="text-xs font-semibold text-navy-500">Valor total da quadra</p>
              <p className="flex flex-wrap items-baseline gap-x-2 text-navy-900">
                <span className="text-2xl font-extrabold text-pitch-700">{formatCurrency(pricing.totalRent)}</span>
                <span className="text-xs font-semibold text-navy-600">≈ {formatCurrency(pricing.perPlayer)} por jogador que paga</span>
              </p>
            </>
          ) : (
            <p className="text-sm font-semibold text-navy-700">Sem cobrança pelo aplicativo</p>
          )}
        </div>

        <span className="flex w-full items-center justify-center rounded-xl bg-navy-900 px-4 py-3 text-sm font-bold text-white transition-colors group-hover:bg-navy-700">
          Ver partida
        </span>
      </div>
    </button>
  );
}
