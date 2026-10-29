# Feature Specification: OctoFit Tracker

> Governed by: [architecture.md](../architecture.md)

**Feature Branch**: `octofit-tracker`  
**Created**: 2026-10-29  
**Status**: Draft  
**Input**: User description: Develop a specification from the OctoFit Tracker architecture and its recorded implementation decisions.

## Scope Baseline

- **Discovery method**: Reviewed the application capabilities and implementation decisions recorded in `docs/architecture.md`.
- **Total items discovered**: 4 user-facing capabilities: activity tracking, team management, leaderboard, and workout suggestions.
- **Items in scope**: 4; all capabilities identified in the architecture are included.

OctoFit Tracker supports a school fitness program. Participants can record exercise, take part in teams, see team standings, and get workout suggestions. This specification describes those user-visible outcomes and the related data and validation expectations.

## User Scenarios & Testing

### User Story 1 - Record fitness activity (Priority: P1)

As a participant, I want to record my activity so that my effort contributes to my team's progress.

**Why this priority**: Recording activity is the primary source of participation data and team points.

**Independent Test**: Create an activity for an existing participant and team, then verify it appears in the activity list with calculated points and a recorded time.

**Acceptance Scenarios**:

1. **Given** a participant and team that exist and a supported activity type with a positive number of minutes, **When** the participant submits an activity, **Then** the activity is saved with the participant, team, type, minutes, calculated points, and occurrence time.
2. **Given** a saved activity, **When** a participant requests the activity list, **Then** the activity is included in the returned records.
3. **Given** an activity submission with a malformed or unknown participant or team identifier, **When** the submission is processed, **Then** it is rejected with a client error and no activity is created.
4. **Given** an activity submission with invalid or missing required values, **When** the submission is processed, **Then** it is rejected with a client error and no activity is created.

### User Story 2 - Create and view teams (Priority: P1)

As a program organizer, I want to create teams and assign participants so that participants can take part in a shared fitness challenge.

**Why this priority**: Teams establish the groups whose activity is compared on the leaderboard.

**Independent Test**: Create a named team with existing participants, then retrieve the team list and verify the submitted name, mascot, and membership are present.

**Acceptance Scenarios**:

1. **Given** a team name, mascot, and valid participant identifiers, **When** an organizer creates the team, **Then** the team is saved with those values and participants.
2. **Given** a team without a name, **When** an organizer submits it, **Then** the request is rejected with a `400` response and no team is created.
3. **Given** a team submission containing a malformed or unknown participant identifier, **When** an organizer submits it, **Then** the request is rejected with a client error and no team is created.
4. **Given** one or more saved teams, **When** a participant requests the team list, **Then** each returned team includes its name, mascot, and members.

### User Story 3 - Compare team progress (Priority: P2)

As a participant, I want to see teams ranked by earned activity points so that I can understand the progress of the challenge.

**Why this priority**: The leaderboard makes team progress visible and encourages participation after teams and activity records are available.

**Independent Test**: Provide activity records for multiple teams, request the leaderboard, and verify aggregate totals, ordering, and ranks.

**Acceptance Scenarios**:

1. **Given** teams with activity records, **When** a participant views the leaderboard, **Then** each team is shown with its total activity points and a 1-based rank, ordered from highest total to lowest.
2. **Given** two or more teams with equal totals, **When** the leaderboard is generated, **Then** tied teams are ordered by team name ascending and receive the same competition rank (for example, `1, 1, 3`).
3. **Given** a team with no activity records, **When** the leaderboard is generated, **Then** the team is included with a total of zero points and an appropriate rank.

### User Story 4 - Get a workout suggestion (Priority: P2)

As a participant, I want a workout suggestion that reflects my goal or recent activity so that I can choose a relevant next activity.

**Why this priority**: Suggestions help participants decide how to continue, while relying on participant and activity data established by the higher-priority flows.

**Independent Test**: Request suggestions for a known participant with a stated goal and verify that the first suggestion reflects the goal and gives a reason.

**Acceptance Scenarios**:

1. **Given** a participant with a stated fitness goal, **When** that participant requests suggestions, **Then** the first suggestion's focus matches the goal and includes a concise reason.
2. **Given** a participant without a stated goal but with recent activity, **When** that participant requests suggestions, **Then** the first suggestion's focus reflects recent activity and includes a concise reason.
3. **Given** an email address that does not match a participant, **When** suggestions are requested, **Then** the request is rejected with a client error and does not return suggestions for another participant.

### Edge Cases

- An activity must not be recorded when its referenced participant or team does not exist.
- A team must not be created when its name is missing or any submitted member reference is invalid.
- Teams without recorded activity remain visible on the leaderboard with zero points.
- Equal team totals use deterministic alphabetical ordering and shared competition ranks.
- A participant with neither a stated goal nor recent activity still receives a deliberate response; the suggested fallback behavior is documented as an assumption below.
- Invalid input and unknown participants produce deliberate client errors rather than server errors.

## Requirements

### Functional Requirements

- **REQ-001**: The system MUST allow participants to retrieve recorded activities.
- **REQ-002**: The system MUST allow an activity to be recorded with a participant, team, activity type, and positive duration in minutes.
- **REQ-003**: The system MUST verify that activity participant and team references are well-formed and refer to existing records before saving the activity.
- **REQ-004**: The system MUST calculate activity points by multiplying the submitted minutes by the configured weight for the activity type, and MUST store the resulting points and occurrence time with the activity.
- **REQ-005**: The system MUST reject invalid activity input with a deliberate client-error response and MUST NOT create an activity for a rejected request.
- **REQ-006**: The system MUST allow participants to retrieve teams, including each team's name, mascot, and members.
- **REQ-007**: The system MUST allow a team to be created with a name, mascot, and participant membership.
- **REQ-008**: The system MUST reject a team without a name with a `400` response.
- **REQ-009**: The system MUST verify that each submitted team member reference is well-formed and refers to an existing participant before creating the team.
- **REQ-010**: The system MUST reject invalid team input with a deliberate client-error response and MUST NOT create a team for a rejected request.
- **REQ-011**: The system MUST calculate each team's leaderboard total as the sum of points from that team's activities.
- **REQ-012**: The system MUST include teams with no activity in the leaderboard with a total of zero points.
- **REQ-013**: The system MUST order leaderboard entries by total points descending and, when totals are equal, by team name ascending.
- **REQ-014**: The system MUST assign 1-based competition ranks on the leaderboard, giving equal totals the same rank and skipping the next rank after a tie.
- **REQ-015**: The system MUST provide workout suggestions for a matching participant, preferring the participant's stated goal and otherwise using recent activity patterns to determine the first suggestion's focus.
- **REQ-016**: The system MUST include a concise reason with each workout suggestion.
- **REQ-017**: The system MUST reject a workout-suggestion request for an unknown participant with a deliberate client-error response.
- **REQ-018**: The system MUST not require authentication for the exercise's user flows.

### Key Entities

- **Participant**: A program participant identified by name and email, with an optional fitness goal and team membership.
- **Team**: A named challenge group with a mascot and participant members.
- **Activity**: A participant's exercise record, associated with a team and containing an activity type, duration, calculated points, and occurrence time.
- **Workout suggestion**: A recommended exercise focus with a reason, selected in relation to a participant's goal or recent activity.
- **Activity-type weight**: A configured numeric multiplier used with activity duration to determine earned points.

## Assumptions

- The initial activity-type weights are maintained in application configuration and can be changed through code or deployment; they are not edited by participants at runtime.
- The architecture does not specify the list of supported activity types, their initial weights, or the valid bounds for activity minutes. The implementation must define and consistently validate those values.
- “Recent activity” means activity within the 30 calendar days before the suggestion request. This is a proposed default because no time window is specified in the architecture.
- If a participant has neither a stated goal nor recent activity, the system may return a general fitness suggestion with a reason that does not claim to be personalized.
- Suggestions may return one or more results; the required focus and reason behavior applies to the first result.
- Participants and teams are provisioned through the exercise's existing data and team-creation flows; account creation and authentication are out of scope.

## Constraints

- The application remains a three-tier fitness tracker with presentation, business logic, and data responsibilities kept separate.
- The MongoDB service uses port `27017`, the API uses port `8000`, and the frontend uses port `5173`.
- The browser uses relative `/api` requests through the development proxy; the API does not require authentication for this exercise.

## Success Criteria

### Measurable Outcomes

- **SC-001**: In contract tests, 100% of valid activity submissions create retrievable records containing the submitted values, computed points, and occurrence time.
- **SC-002**: In contract tests, 100% of malformed or unknown activity participant/team references are rejected without creating an activity.
- **SC-003**: In contract tests, 100% of team-creation requests missing a name return `400`; invalid member references are rejected without creating a team.
- **SC-004**: For every leaderboard test dataset, returned totals equal the sum of the teams' activity points, all teams are included, and ordering and competition ranks match the specified rules.
- **SC-005**: For every suggestion test case, a known participant's first suggestion has the goal-first or recent-activity focus and a non-empty reason; an unknown email receives a client error.
- **SC-006**: A participant can complete each of the four core tasks—record activity, view teams, view the leaderboard, and request workout suggestions—using the application without authentication.
