export type DrawablePlayer = {
  id: string;
  isGoalkeeper: boolean;
};

const shuffle = <T>(items: T[]): T[] => {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
};

// Goalkeepers are placed first so they spread across teams; each player goes to the smallest team.
export function drawTeams(players: DrawablePlayer[], playersPerTeam: number): Map<string, number> {
  const teamCount = Math.ceil(players.length / playersPerTeam);
  const goalkeepers = shuffle(players.filter((player) => player.isGoalkeeper));
  const fieldPlayers = shuffle(players.filter((player) => !player.isGoalkeeper));
  const teamSizes = new Array<number>(teamCount).fill(0);
  const assignments = new Map<string, number>();

  for (const player of [...goalkeepers, ...fieldPlayers]) {
    let target = 0;
    for (let index = 1; index < teamCount; index += 1) {
      if (teamSizes[index] < teamSizes[target]) target = index;
    }
    teamSizes[target] += 1;
    assignments.set(player.id, target + 1);
  }

  return assignments;
}
