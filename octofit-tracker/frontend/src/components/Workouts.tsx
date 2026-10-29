import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type Suggestion = { title: string; reason: string };
type Response = { suggestions: Suggestion[] };

// No sign-in exists in this exercise, so suggestions use the seeded demo participant.
const DEMO_USER_EMAIL = 'mona@example.com';
const load = () => getJson<Response>(`/api/workouts/suggestions/${encodeURIComponent(DEMO_USER_EMAIL)}`).then((response) => response.suggestions);

export default function Workouts() {
  return (
    <CapabilityCard
      title="Workout suggestions"
      description="Recommend workouts from activity patterns."
      load={load}
      emptyText="No workout suggestions yet."
      renderItem={(suggestion: Suggestion) => `${suggestion.title}: ${suggestion.reason}`}
    />
  );
}
