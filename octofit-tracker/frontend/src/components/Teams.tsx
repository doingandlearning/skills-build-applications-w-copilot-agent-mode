import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type Team = { name: string; mascot?: string; members?: unknown[] };
type Response = { teams: Team[] };

const load = () => getJson<Response>('/api/teams').then((response) => response.teams);

export default function Teams() {
  return (
    <CapabilityCard
      title="Teams"
      description="Manage teams and members."
      load={load}
      emptyText="No teams created yet."
      renderItem={(team: Team) => `${team.name}${team.mascot ? ` (${team.mascot})` : ''}: ${team.members?.length ?? 0} members`}
    />
  );
}
