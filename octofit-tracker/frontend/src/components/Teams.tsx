import { CapabilityCard } from './CapabilityCard.js';

type Team = { name: string; mascot?: string; members?: unknown[] };
type Response = { teams: Team[] };

const select = (response: Response) => response.teams;

export default function Teams() {
  return (
    <CapabilityCard
      title="Teams"
      description="Manage teams and members."
      path="/api/teams"
      select={select}
      emptyText="No teams created yet."
      renderItem={(team: Team) => `${team.name}${team.mascot ? ` (${team.mascot})` : ''}: ${team.members?.length ?? 0} members`}
    />
  );
}
