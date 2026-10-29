import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type Entry = { teamName: string; totalPoints: number; rank: number };
type Response = { leaderboard: Entry[] };

const load = () => getJson<Response>('/api/leaderboard').then((response) => response.leaderboard);

export default function Leaderboard() {
  return (
    <CapabilityCard
      title="Leaderboard"
      description="Compare team point totals."
      load={load}
      emptyText="No leaderboard scores yet."
      renderItem={(entry: Entry) => `#${entry.rank} ${entry.teamName}: ${entry.totalPoints} points`}
    />
  );
}
