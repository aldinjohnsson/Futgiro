import { useState } from 'react';
import { CalendarClock, ChevronDown, Clock, MapPin, Pencil, Star } from 'lucide-react';
import { formatRating, WEEKDAY_SHORT_NAMES } from '@/lib/format';
import type { Court } from '@/types/futgiro';

type CourtCardProps = {
  court: Court;
  canManage: boolean;
  onEdit: (court: Court) => void;
  onManageSlots: (court: Court) => void;
};

export default function CourtCard({ court, canManage, onEdit, onManageSlots }: CourtCardProps) {
  const [showSlots, setShowSlots] = useState(false);
  const slotsId = `${court.id}-slots`;

  return (
    <article className="flex flex-col overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-navy-100 transition-shadow duration-300 hover:shadow-lift">
      <div className="relative h-36 overflow-hidden">
        <img src={court.photoUrl} alt={`Quadra ${court.name}`} className="h-full w-full object-cover" />
        {court.rating !== null && (
          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-navy-900">
            <Star className="h-3.5 w-3.5 fill-pitch-500 text-pitch-500" aria-hidden="true" />
            {formatRating(court.rating)}
            <span className="font-medium text-navy-400">({court.reviewCount})</span>
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h3 className="text-base font-extrabold text-navy-900">{court.name}</h3>
          <p className="mt-1 text-sm font-semibold text-navy-600">{court.city}</p>
          <p className="mt-1 flex items-start gap-1.5 text-xs text-navy-500">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {court.address}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowSlots((current) => !current)}
          aria-expanded={showSlots}
          aria-controls={slotsId}
          className="mt-auto flex w-full items-center justify-between rounded-xl bg-navy-50 px-4 py-3 text-sm font-bold text-navy-800 transition-colors hover:bg-navy-100"
        >
          Ver horários disponíveis
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-300 ${showSlots ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </button>

        {showSlots && (
          <div id={slotsId} className="flex flex-wrap gap-2 animate-fade-in">
            {court.slots.length === 0 ? (
              <p className="text-xs text-navy-500">Nenhum horário cadastrado ainda.</p>
            ) : (
              court.slots.map((slot) => (
                <span
                  key={slot.id}
                  className="flex items-center gap-1.5 rounded-lg bg-pitch-50 px-3 py-1.5 text-xs font-bold text-pitch-800 ring-1 ring-pitch-100"
                >
                  <Clock className="h-3 w-3" aria-hidden="true" />
                  {WEEKDAY_SHORT_NAMES[slot.weekday]} {slot.startTime}
                </span>
              ))
            )}
          </div>
        )}

        {canManage && (
          <div className="grid grid-cols-2 gap-2 border-t border-navy-100 pt-3">
            <button
              type="button"
              onClick={() => onEdit(court)}
              className="flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-navy-700 transition-colors hover:bg-navy-50"
            >
              <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
              Editar quadra
            </button>
            <button
              type="button"
              onClick={() => onManageSlots(court)}
              className="flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-pitch-700 transition-colors hover:bg-pitch-50"
            >
              <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />
              Gerenciar horários
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
