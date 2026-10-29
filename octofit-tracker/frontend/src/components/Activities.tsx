import { CapabilityCard } from './CapabilityCard.js';

type Activity = { type: string; minutes: number; points: number };
type Response = { activities: Activity[] };

const select = (response: Response) => response.activities;

export default function Activities() {
  return (
    <CapabilityCard
      title="Activities"
      description="Track student activity minutes and points."
      path="/api/activities"
      select={select}
      emptyText="No activities recorded yet."
      renderItem={(activity: Activity) => `${activity.type}: ${activity.minutes} minutes, ${activity.points} points`}
    />
  );
}
