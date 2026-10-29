import { CapabilityCard } from './CapabilityCard.js';

type Suggestion = { title: string; reason: string };
type Response = { suggestions: Suggestion[] };

// No sign-in exists in this exercise, so suggestions use the seeded demo participant.
const DEMO_USER_EMAIL = 'mona@example.com';
const select = (response: Response) => response.suggestions;

export default function Workouts() {
  return (
    <CapabilityCard
      title="Workout suggestions"
      description="Recommend workouts from activity patterns."
      path={`/api/workouts/suggestions/${encodeURIComponent(DEMO_USER_EMAIL)}`}
      select={select}
      emptyText="No workout suggestions yet."
      renderItem={(suggestion: Suggestion) => `${suggestion.title}: ${suggestion.reason}`}
    />
  );
}
