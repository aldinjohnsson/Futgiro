import { ChartColumn, House, Trophy, User, type LucideIcon } from 'lucide-react';

export type SectionId = 'home' | 'matches' | 'stats' | 'profile';

export type NavItem = {
  id: SectionId;
  label: string;
  icon: LucideIcon;
};

export const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Início', icon: House },
  { id: 'matches', label: 'Partidas', icon: Trophy },
  { id: 'stats', label: 'Estatísticas', icon: ChartColumn },
  { id: 'profile', label: 'Perfil', icon: User },
];
