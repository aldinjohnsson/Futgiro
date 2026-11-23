import { supabase } from '@/lib/supabase';
import type { AccountProfile } from '@/types/futgiro';
import type { AuthError } from '@supabase/supabase-js';

export class AuthServiceError extends Error {}

type ProfileRow = {
  id: string;
  full_name: string;
  is_player: boolean;
  is_court_owner: boolean;
};

export type SignUpInput = {
  email: string;
  password: string;
  fullName: string;
  isPlayer: boolean;
  isCourtOwner: boolean;
};

export type ProfileRoles = {
  isPlayer: boolean;
  isCourtOwner: boolean;
};

const mapProfile = (row: ProfileRow): AccountProfile => ({
  id: row.id,
  fullName: row.full_name,
  isPlayer: row.is_player,
  isCourtOwner: row.is_court_owner,
});

const translateAuthError = (error: AuthError) => {
  if (error.code === 'weak_password') return 'Esta senha é muito comum ou insegura. Escolha outra, misturando letras e números.';
  if (error.message.includes('Invalid login credentials')) return 'E-mail ou senha incorretos.';
  if (error.message.includes('already registered')) return 'Já existe uma conta com este e-mail.';
  if (error.message.includes('Password should be at least')) return 'A senha precisa ter pelo menos 8 caracteres.';
  return 'Não foi possível concluir. Tente novamente.';
};

export async function signIn(email: string, password: string): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new AuthServiceError(translateAuthError(error));
}

export async function signUp(input: SignUpInput): Promise<void> {
  const { data, error } = await supabase.auth.signUp({ email: input.email, password: input.password });
  if (error) throw new AuthServiceError(translateAuthError(error));
  if (!data.user || !data.session) {
    throw new AuthServiceError('Não foi possível entrar automaticamente. Tente entrar com seu e-mail e senha.');
  }

  const { error: profileError } = await supabase.from('profiles').insert({
    id: data.user.id,
    full_name: input.fullName,
    is_player: input.isPlayer,
    is_court_owner: input.isCourtOwner,
  });
  if (profileError) throw new AuthServiceError('Sua conta foi criada, mas não foi possível salvar o perfil.');
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw new AuthServiceError('Não foi possível sair da conta. Tente novamente.');
}

export async function fetchProfile(userId: string): Promise<AccountProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, is_player, is_court_owner')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw new AuthServiceError('Não foi possível carregar seu perfil.');
  return data ? mapProfile(data as ProfileRow) : null;
}

export async function updateProfileRoles(userId: string, roles: ProfileRoles): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ is_player: roles.isPlayer, is_court_owner: roles.isCourtOwner })
    .eq('id', userId);
  if (error) throw new AuthServiceError('Não foi possível salvar seus perfis.');
}
