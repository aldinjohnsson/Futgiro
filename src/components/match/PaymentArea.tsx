import { useState } from 'react';
import { Info, Lock, Receipt, TrendingDown } from 'lucide-react';
import { formatCurrency, getAvailableSpots, getMatchPricing } from '@/lib/format';
import type { Match } from '@/types/futgiro';

type PaymentAreaProps = {
  match: Match;
};

export default function PaymentArea({ match }: PaymentAreaProps) {
  const [isSimulated, setIsSimulated] = useState(false);
  const pricing = getMatchPricing(match);

  if (!pricing) {
    return (
      <section aria-labelledby="payment-title" className="flex flex-col gap-3">
        <h3 id="payment-title" className="text-lg font-extrabold text-navy-900">
          Pagamento
        </h3>
        <p className="flex items-start gap-2 rounded-2xl bg-navy-50 p-4 text-sm text-navy-600 ring-1 ring-navy-100">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-navy-500" aria-hidden="true" />
          Esta partida não é paga pelo aplicativo. Combine o pagamento direto com o organizador.
        </p>
      </section>
    );
  }

  if (!match.paymentReleased) {
    return (
      <section aria-labelledby="payment-title" className="flex flex-col gap-3">
        <h3 id="payment-title" className="text-lg font-extrabold text-navy-900">
          Pagamento pelo aplicativo
        </h3>
        <div className="flex items-start gap-3 rounded-2xl bg-navy-50 p-4 ring-1 ring-navy-100">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-navy-500 shadow-sm">
            <Lock className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-bold text-navy-900">Pagamento ainda não liberado</p>
            <p className="mt-1 text-xs text-navy-500">
              O valor total da quadra é {formatCurrency(pricing.totalRent)}, dividido entre quem pagar
              ({formatCurrency(pricing.perPlayer)} por jogador no momento).
            </p>
          </div>
        </div>
      </section>
    );
  }

  const canPay = getAvailableSpots(match) > 0;

  return (
    <section aria-labelledby="payment-title" className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 id="payment-title" className="text-lg font-extrabold text-navy-900">
          Pagamento pelo aplicativo
        </h3>
        <span className="rounded-full bg-pitch-100 px-3 py-1 text-xs font-bold text-pitch-800">
          {pricing.payingPlayers} pagando · {formatCurrency(pricing.perPlayer)} cada
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-navy-50 p-4 ring-1 ring-navy-100">
          <p className="text-xs font-semibold text-navy-600">Valor total da quadra</p>
          <p className="mt-1 text-xl font-extrabold text-navy-700">{formatCurrency(pricing.totalRent)}</p>
        </div>
        <div className="rounded-2xl bg-pitch-50 p-4 ring-1 ring-pitch-200">
          <p className="text-xs font-semibold text-pitch-800">Dividido por jogador</p>
          <p className="mt-1 text-xl font-extrabold text-pitch-700">{formatCurrency(pricing.perPlayer)}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl bg-navy-900 text-white shadow-lift">
        <div className="flex flex-col gap-3 p-5">
          <div className="flex items-center justify-between text-sm text-navy-200">
            <span className="flex items-center gap-2">
              <Receipt className="h-4 w-4" aria-hidden="true" />
              Sua vaga
            </span>
            <span className="font-bold text-white">{formatCurrency(pricing.perPlayer)}</span>
          </div>
          <div className="flex items-center justify-between text-sm text-navy-200">
            <span>Valor total da quadra</span>
            <span>{formatCurrency(pricing.totalRent)}</span>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 bg-pitch-400 px-5 py-4 text-navy-900">
          <span className="flex items-center gap-2 text-sm font-bold">
            <TrendingDown className="h-5 w-5" strokeWidth={2.5} aria-hidden="true" />
            Jogadores pagando
          </span>
          <span className="text-2xl font-extrabold">{pricing.payingPlayers}</span>
        </div>
      </div>

      {isSimulated && (
        <div role="status" className="flex items-start gap-3 rounded-2xl bg-navy-50 p-4 text-sm text-navy-700 ring-1 ring-navy-100 animate-fade-in">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-navy-500" aria-hidden="true" />
          <p>Simulação visual: nenhum valor foi cobrado. A cobrança real será integrada em uma próxima etapa.</p>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsSimulated(true)}
        disabled={!canPay}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-pitch-500 px-6 py-4 text-sm font-bold text-navy-900 shadow-lg shadow-pitch-500/25 transition-all hover:bg-pitch-400 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-navy-100 disabled:text-navy-400 disabled:shadow-none"
      >
        {canPay ? 'Simular pagamento da minha vaga' : 'Partida lotada'}
      </button>
    </section>
  );
}
