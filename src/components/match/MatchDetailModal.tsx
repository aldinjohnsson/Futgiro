import type { ReactNode } from 'react';
import { CalendarDays, Clock, MapPin, Settings2, Users, X } from 'lucide-react';
import ModalShell from '@/components/common/ModalShell';
import PaymentArea from '@/components/match/PaymentArea';
import {
  formatDayMonth,
  formatTime,
  formatWeekday,
  getAvailableGoalkeeperSpots,
  getAvailableSpots,
} from '@/lib/format';
import type { Court, Match } from '@/types/futgiro';

type MatchDetailModalProps = {
  match: Match;
  court: Court;
  onClose: () => void;
  onManage: () => void;
  canManage: boolean;
};

export default function MatchDetailModal({ match, court, onClose, onManage, canManage }: MatchDetailModalProps) {
  const availableSpots = getAvailableSpots(match);
  const availableGoalkeepers = getAvailableGoalkeeperSpots(match);

  return (
    <ModalShell titleId="match-detail-title" onClose={onClose}>
      <div className="relative h-44 shrink-0 overflow-hidden sm:h-52">
        <img src={court.photoUrl} alt="" aria-hidden="true" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900/90 via-navy-900/30 to-transparent" />
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar detalhes"
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-navy-800 transition-transform hover:scale-105"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
          <span className="rounded-full bg-pitch-400 px-3 py-1 text-xs font-extrabold text-navy-900">
            {match.modality}
          </span>
          <h2 id="match-detail-title" className="mt-2 text-2xl font-extrabold text-white">
            {court.name}
          </h2>
        </div>
      </div>

      <div className="flex flex-col gap-6 overflow-y-auto p-5 sm:p-6">
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <InfoRow icon={CalendarDays} label="Data">
            {formatWeekday(match.startsAt)}, {formatDayMonth(match.startsAt)}
          </InfoRow>
          <InfoRow icon={Clock} label="Horário">
            {formatTime(match.startsAt)}
          </InfoRow>
          <InfoRow icon={MapPin} label="Endereço">
            {court.address}, {court.city}
          </InfoRow>
          <InfoRow icon={Users} label="Vagas">
            {availableSpots} de {match.totalSpots} disponíveis
            {match.goalkeeperSpots > 0 && ` · ${availableGoalkeepers} de ${match.goalkeeperSpots} goleiro(s)`}
          </InfoRow>
        </dl>

        <PaymentArea match={match} />

        <div className="flex flex-col gap-3 border-t border-navy-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-navy-500">Organizado por {match.organizer}.</p>
          {canManage && (
            <button
              type="button"
              onClick={onManage}
              className="flex items-center justify-center gap-2 rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-navy-700"
            >
              <Settings2 className="h-4 w-4" aria-hidden="true" />
              Gerenciar partida
            </button>
          )}
        </div>
      </div>
    </ModalShell>
  );
}

type InfoRowProps = {
  icon: typeof CalendarDays;
  label: string;
  children: ReactNode;
};

function InfoRow({ icon: Icon, label, children }: InfoRowProps) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-navy-50 p-3.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-pitch-700 shadow-sm">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <dt className="text-xs font-semibold text-navy-500">{label}</dt>
        <dd className="text-sm font-bold text-navy-900">{children}</dd>
      </div>
    </div>
  );
}
