import { CalendarCheck, Flag, Users, Warehouse } from 'lucide-react';
import { getAvailableSpots, getFilledSpots } from '@/lib/format';
import type { Court, Match } from '@/types/futgiro';

type StatsPageProps = {
  userId: string | null;
  courts: Court[];
  matches: Match[];
};

export default function StatsPage({ userId, courts, matches }: StatsPageProps) {
  const header = (
    <div>
      <h1 className="text-2xl font-extrabold text-navy-900 sm:text-3xl">Estatísticas</h1>
      <p className="mt-1 text-sm text-navy-500">Resumo das suas partidas e quadras.</p>
    </div>
  );

  if (!userId) {
    return (
      <div className="flex flex-col gap-6">
        {header}
        <p className="rounded-2xl border border-dashed border-navy-200 bg-white p-8 text-center text-sm text-navy-500">
          Entre na sua conta para acompanhar suas partidas e quadras.
        </p>
      </div>
    );
  }

  const myMatches = matches.filter((match) => match.ownerId === userId);
  const myCourts = courts.filter((court) => court.ownerId === userId);
  const stats = [
    { label: 'Partidas criadas', value: myMatches.length, icon: CalendarCheck },
    {
      label: 'Jogadores confirmados',
      value: myMatches.reduce((total, match) => total + getFilledSpots(match), 0),
      icon: Users,
    },
    { label: 'Quadras cadastradas', value: myCourts.length, icon: Warehouse },
    {
      label: 'Partidas com vagas',
      value: myMatches.filter((match) => getAvailableSpots(match) > 0).length,
      icon: Flag,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {header}

      <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <li key={label} className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-navy-100 sm:p-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-pitch-50 text-pitch-700">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <p className="mt-4 text-2xl font-extrabold text-navy-900">{value}</p>
            <p className="mt-1 text-xs font-semibold text-navy-500">{label}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
