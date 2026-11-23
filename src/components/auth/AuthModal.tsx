import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Loader2, X } from 'lucide-react';
import FormField, { INPUT_CLASS } from '@/components/common/FormField';
import ModalShell from '@/components/common/ModalShell';
import { useAuth } from '@/hooks/useAuth';
import { AuthServiceError, signIn, signUp } from '@/services/authService';

type AuthMode = 'signin' | 'signup';

type AuthModalProps = {
  onClose: () => void;
  initialMode?: AuthMode;
};

type FormValues = {
  fullName: string;
  email: string;
  password: string;
  isPlayer: boolean;
  isCourtOwner: boolean;
};

const INITIAL_VALUES: FormValues = {
  fullName: '',
  email: '',
  password: '',
  isPlayer: true,
  isCourtOwner: false,
};

const GENERIC_ERROR = 'Algo deu errado. Tente novamente.';

const validate = (mode: AuthMode, values: FormValues): string | null => {
  if (!values.email.includes('@')) return 'Informe um e-mail válido.';
  if (values.password.length < 8) return 'A senha precisa ter pelo menos 8 caracteres.';
  if (mode === 'signup') {
    if (values.fullName.trim().length < 2) return 'Informe seu nome.';
    if (!values.isPlayer && !values.isCourtOwner) return 'Escolha pelo menos um perfil.';
  }
  return null;
};

export default function AuthModal({ onClose, initialMode = 'signin' }: AuthModalProps) {
  const { refreshProfile } = useAuth();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [values, setValues] = useState<FormValues>(INITIAL_VALUES);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const titleId = 'auth-modal-title';

  const updateField = (field: keyof FormValues) => (event: ChangeEvent<HTMLInputElement>) => {
    setValues((current) => ({ ...current, [field]: event.target.value }));
  };

  const toggleRole = (role: 'isPlayer' | 'isCourtOwner') => {
    setValues((current) => ({ ...current, [role]: !current[role] }));
  };

  const switchMode = (next: AuthMode) => {
    setMode(next);
    setError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationError = validate(mode, values);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const email = values.email.trim();
      if (mode === 'signin') {
        await signIn(email, values.password);
      } else {
        await signUp({
          email,
          password: values.password,
          fullName: values.fullName.trim(),
          isPlayer: values.isPlayer,
          isCourtOwner: values.isCourtOwner,
        });
      }
      await refreshProfile();
      onClose();
    } catch (caught) {
      setError(caught instanceof AuthServiceError ? caught.message : GENERIC_ERROR);
      setIsSaving(false);
    }
  };

  const isSignup = mode === 'signup';

  return (
    <ModalShell titleId={titleId} onClose={onClose}>
      <div className="flex items-start justify-between gap-4 border-b border-navy-100 p-5 sm:p-6">
        <div>
          <h2 id={titleId} className="text-xl font-extrabold text-navy-900">
            {isSignup ? 'Criar conta' : 'Entrar na sua conta'}
          </h2>
          <p className="mt-1 text-sm text-navy-500">
            {isSignup ? 'Jogue, organize partidas ou gerencie suas quadras.' : 'Use o e-mail e a senha do seu cadastro.'}
          </p>
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

      <div role="tablist" aria-label="Tipo de acesso" className="grid grid-cols-2 gap-2 p-5 pb-0 sm:px-6">
        {(['signin', 'signup'] as AuthMode[]).map((option) => (
          <button
            key={option}
            type="button"
            role="tab"
            aria-selected={mode === option}
            onClick={() => switchMode(option)}
            className={`rounded-xl px-4 py-2.5 text-sm font-bold transition-colors ${
              mode === option ? 'bg-navy-900 text-white' : 'bg-navy-50 text-navy-700 hover:bg-navy-100'
            }`}
          >
            {option === 'signin' ? 'Entrar' : 'Criar conta'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 overflow-y-auto p-5 sm:p-6" noValidate>
        {isSignup && (
          <FormField label="Seu nome" htmlFor="auth-name">
            <input
              id="auth-name"
              className={INPUT_CLASS}
              value={values.fullName}
              onChange={updateField('fullName')}
              placeholder="Como os jogadores vão te reconhecer"
              maxLength={80}
              autoComplete="name"
            />
          </FormField>
        )}

        <FormField label="E-mail" htmlFor="auth-email">
          <input
            id="auth-email"
            type="email"
            className={INPUT_CLASS}
            value={values.email}
            onChange={updateField('email')}
            placeholder="voce@exemplo.com"
            autoComplete="email"
          />
        </FormField>

        <FormField label="Senha" htmlFor="auth-password" hint={isSignup ? 'Use pelo menos 8 caracteres, com letras e números.' : undefined}>
          <input
            id="auth-password"
            type="password"
            className={INPUT_CLASS}
            value={values.password}
            onChange={updateField('password')}
            autoComplete={isSignup ? 'new-password' : 'current-password'}
          />
        </FormField>

        {isSignup && (
          <fieldset className="flex flex-col gap-3">
            <legend className="mb-2 text-sm font-bold text-navy-800">Como você vai usar o app?</legend>
            <RoleOption
              label="Quero jogar"
              description="Entrar em partidas, pagar sua vaga e montar times."
              checked={values.isPlayer}
              onToggle={() => toggleRole('isPlayer')}
            />
            <RoleOption
              label="Sou dono de quadra"
              description="Cadastrar quadras, horários e gerenciar as partidas delas."
              checked={values.isCourtOwner}
              onToggle={() => toggleRole('isCourtOwner')}
            />
            <p className="text-xs text-navy-500">Você pode ter os dois perfis ao mesmo tempo.</p>
          </fieldset>
        )}

        {error && (
          <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 ring-1 ring-red-100">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center justify-center gap-2 rounded-xl bg-pitch-500 px-6 py-3 text-sm font-bold text-navy-900 shadow-lg shadow-pitch-500/25 transition-all hover:bg-pitch-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          {isSignup ? 'Criar minha conta' : 'Entrar'}
        </button>
      </form>
    </ModalShell>
  );
}

type RoleOptionProps = {
  label: string;
  description: string;
  checked: boolean;
  onToggle: () => void;
};

function RoleOption({ label, description, checked, onToggle }: RoleOptionProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onToggle}
      className={`flex w-full items-start gap-3 rounded-2xl p-4 text-left ring-1 transition-all ${
        checked ? 'bg-pitch-50 ring-pitch-400' : 'bg-white ring-navy-100 hover:ring-navy-300'
      }`}
    >
      <span
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 ${
          checked ? 'border-pitch-600 bg-pitch-600' : 'border-navy-300 bg-white'
        }`}
      />
      <span>
        <span className="block text-sm font-bold text-navy-900">{label}</span>
        <span className="mt-0.5 block text-xs text-navy-500">{description}</span>
      </span>
    </button>
  );
}
