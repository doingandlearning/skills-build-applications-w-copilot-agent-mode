import mongoose from 'mongoose';
import { activityWeights, isActivityType } from '../config/activityWeights.js';
import { Activity, Team, User, Workout } from '../models/index.js';

function httpError(status: number, message: string) {
  return Object.assign(new Error(message), { status });
}

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  const body = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>;
  const { userId, teamId, type, minutes } = body;
  if (typeof userId !== 'string' || !mongoose.isValidObjectId(userId)) throw httpError(400, 'userId must be a valid id');
  if (typeof teamId !== 'string' || !mongoose.isValidObjectId(teamId)) throw httpError(400, 'teamId must be a valid id');
  if (typeof type !== 'string' || !isActivityType(type)) throw httpError(400, 'type must be a supported activity type');
  if (typeof minutes !== 'number' || !Number.isFinite(minutes) || minutes < 1) throw httpError(400, 'minutes must be a positive number');

  const [user, team] = await Promise.all([User.exists({ _id: userId }), Team.exists({ _id: teamId })]);
  if (!user) throw httpError(404, 'User not found');
  if (!team) throw httpError(404, 'Team not found');

  const activity = await Activity.create({
    user: userId,
    team: teamId,
    type,
    minutes,
    points: minutes * activityWeights[type],
    occurredAt: new Date(),
  });
  return activity.toObject();
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  const body = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>;
  const { name, mascot, members = [] } = body;
  if (typeof name !== 'string' || !name.trim()) throw httpError(400, 'name is required');
  if (typeof mascot !== 'string' || !mascot.trim()) throw httpError(400, 'mascot is required');
  if (!Array.isArray(members)) throw httpError(400, 'members must be an array of user ids');
  if (!members.every((id) => typeof id === 'string' && mongoose.isValidObjectId(id))) {
    throw httpError(400, 'members must be valid user ids');
  }
  const memberIds = [...new Set(members as string[])];
  if (memberIds.length && (await User.countDocuments({ _id: { $in: memberIds } })) !== memberIds.length) {
    throw httpError(404, 'One or more members were not found');
  }
  const team = await Team.create({ name, mascot, members: memberIds });
  return team.toObject();
}

export async function getLeaderboard() {
  const [teams, totals] = await Promise.all([
    Team.find().select('name').lean(),
    Activity.aggregate<{ _id: mongoose.Types.ObjectId; totalPoints: number }>([
      { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
    ]),
  ]);
  const pointsByTeam = new Map(totals.map((total) => [total._id.toString(), total.totalPoints]));
  const entries = teams
    .map((team) => ({ teamId: team._id, teamName: team.name, totalPoints: pointsByTeam.get(team._id.toString()) ?? 0 }))
    .sort((a, b) => b.totalPoints - a.totalPoints || a.teamName.localeCompare(b.teamName));

  const ranked: Array<(typeof entries)[number] & { rank: number }> = [];
  entries.forEach((entry, index) => {
    const previous = ranked[index - 1];
    ranked.push({ ...entry, rank: previous && previous.totalPoints === entry.totalPoints ? previous.rank : index + 1 });
  });
  return ranked;
}

const RECENT_ACTIVITY_DAYS = 30;

export async function suggestWorkouts(userEmail: string) {
  const email = userEmail.trim().toLowerCase();
  const user = await User.findOne({ email }).lean();
  if (!user) throw httpError(404, 'User not found');

  const since = new Date(Date.now() - RECENT_ACTIVITY_DAYS * 24 * 60 * 60 * 1000);
  const recent = await Activity.find({ user: user._id, occurredAt: { $gte: since } }).lean();
  const minutesByType = new Map<string, number>();
  for (const activity of recent) minutesByType.set(activity.type, (minutesByType.get(activity.type) ?? 0) + activity.minutes);
  const topType = [...minutesByType.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];

  const focus = user.fitnessGoal;
  const goalReason = `Matches your ${focus} goal`;
  const activityReason = topType ? `Builds on your recent ${topType} activity` : 'A general fitness option';

  const workouts = await Workout.find().lean();
  const matching = workouts.filter((workout) => workout.focus === focus);
  const others = workouts.filter((workout) => workout.focus !== focus);
  return [
    ...matching.map((workout) => ({ ...workout, reason: goalReason })),
    ...others.map((workout) => ({ ...workout, reason: activityReason })),
  ];
}

export { User };
