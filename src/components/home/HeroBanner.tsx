import { ArrowRight } from 'lucide-react';

type HeroBannerProps = {
  onSearchMatches: () => void;
};

export default function HeroBanner({ onSearchMatches }: HeroBannerProps) {
  return (
    <section className="relative isolate overflow-hidden rounded-3xl bg-navy-900 text-white shadow-lift">
      <img
        src="https://images.pexels.com/photos/37364066/pexels-photo-37364066.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 -z-10 h-full w-full object-cover opacity-50"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-navy-900 via-navy-900/80 to-navy-900/20" />

      <div className="flex min-h-[280px] flex-col justify-end gap-5 p-6 sm:p-10 lg:min-h-[360px] lg:max-w-3xl lg:p-12">
        <span className="w-fit rounded-full bg-pitch-400/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-pitch-300 ring-1 ring-pitch-400/40">
          Partidas abertas esta semana
        </span>
        <h1 className="text-3xl font-extrabold leading-[1.15] sm:text-4xl lg:text-5xl">
          Encontre partidas. Monte seu time. Reserve sua quadra.
        </h1>
        <p className="max-w-md text-sm leading-relaxed text-navy-100 sm:text-base">
          Pague pelo aplicativo e economize em cada participação.
        </p>
        <button
          type="button"
          onClick={onSearchMatches}
          className="group inline-flex w-fit items-center gap-2 rounded-xl bg-pitch-400 px-6 py-3.5 text-sm font-bold text-navy-900 shadow-lg shadow-pitch-500/30 transition-all hover:bg-pitch-300 active:scale-[0.98]"
        >
          Buscar partidas
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
