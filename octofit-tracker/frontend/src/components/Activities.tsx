import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type Activity = { type: string; minutes: number; points: number };
type Response = { activities: Activity[] };

const load = () => getJson<Response>('/api/activities').then((response) => response.activities);

export default function Activities() {
  return (
    <CapabilityCard
      title="Activities"
      description="Track student activity minutes and points."
      load={load}
      emptyText="No activities recorded yet."
      renderItem={(activity: Activity) => `${activity.type}: ${activity.minutes} minutes, ${activity.points} points`}
    />
  );
}
