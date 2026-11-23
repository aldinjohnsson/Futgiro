export type CourtSlot = {
  id: string;
  weekday: number;
  startTime: string;
};

export type Court = {
  id: string;
  ownerId: string | null;
  name: string;
  city: string;
  address: string;
  rating: number | null;
  reviewCount: number;
  photoUrl: string;
  priceTotal: number | null;
  slots: CourtSlot[];
};

export type MatchPlayer = {
  id: string;
  name: string;
  isGoalkeeper: boolean;
  isExempt: boolean;
  teamNumber: number | null;
  isPaid: boolean;
};

export type Match = {
  id: string;
  ownerId: string | null;
  modality: string;
  startsAt: string;
  courtId: string;
  totalSpots: number;
  goalkeeperSpots: number;
  requiresPayment: boolean;
  priceTotal: number | null;
  organizer: string;
  paymentReleased: boolean;
  players: MatchPlayer[];
};

export type AccountProfile = {
  id: string;
  fullName: string;
  isPlayer: boolean;
  isCourtOwner: boolean;
};
