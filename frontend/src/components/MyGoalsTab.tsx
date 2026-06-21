import React from "react";
import type { Challenge } from "../lib/types";

interface MyGoalsTabProps {
  streakCount: number;
  weekdays: string[];
  checkedDays: boolean[];
  handleDayClick: (index: number) => void;
  level: number;
  xp: number;
  nextLevelXp: number;
  progressPercentage: number;
  xpToNextLevel: number;
  challenges: Challenge[];
  handleChallengeAction: (id: string, xpAward: number, currentStatus: string) => void;
}

export const MyGoalsTab = React.memo(function MyGoalsTab({
  streakCount,
  weekdays,
  checkedDays,
  handleDayClick,
  level,
  xp,
  nextLevelXp,
  progressPercentage,
  xpToNextLevel,
  challenges,
  handleChallengeAction,
}: MyGoalsTabProps) {
  return (
    <main className="main-content">
      <header className="dashboard-header">
        <h1>Animated Insights &amp; Habits</h1>
        <p>
          Discover actionable ways to reduce your carbon footprint and build sustainable
          routines. Small changes lead to massive impact.
        </p>
      </header>

      <section className="dashboard-grid">
        <div className="card-row-top">
          <div className="glass-card streak-card">
            <div className="streak-header">
              <div className="streak-title-container">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
                </svg>
                <h3 className="streak-card-title">Current Streak</h3>
              </div>
              <p className="streak-card-sub">
                Keep logging activities to maintain your momentum.
              </p>
            </div>

            <div className="streak-content-wrapper">
              <div className="streak-days-container">
                {weekdays.map((day, i) => (
                  <div key={day} className="streak-day-column">
                    <span className="day-label">{day}</span>
                    <button
                      onClick={() => handleDayClick(i)}
                      className={`day-circle ${checkedDays[i] ? "checked" : "unchecked"}`}
                      aria-label={`Mark ${day} as done`}
                    >
                      {checkedDays[i] && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </button>
                  </div>
                ))}
              </div>

              <div className="streak-badge-container">
                <div className="streak-badge">
                  <span className="streak-badge-num">{streakCount}</span>
                  <span className="streak-badge-txt">DAYS</span>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card progress-card">
            <svg
              className="botanical-overlay"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2 22C2 22 8 18 12 14C15 11 18 9 22 2C22 2 17 5 14 8C10 12 6 18 2 22Z" />
              <path d="M12 14C12 14 15 13 18 11" />
              <path d="M9 17C9 17 11 16 13 14" />
              <path d="M14 8C14 8 13 5 11 2" />
              <path d="M17 11C17 11 16 8 14 5" />
            </svg>

            <div>
              <span className="level-badge">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                Level {level}
              </span>
              <h3 className="rank-title">Eco-Warrior</h3>
              <p className="rank-desc">Top 15% of community reducers this month.</p>
            </div>

            <div className="progress-bar-wrapper">
              <div className="progress-stats">
                <span className="xp-current">{xp.toLocaleString()} XP</span>
                <span className="xp-next">
                  {level === 4
                    ? `${nextLevelXp.toLocaleString()} XP for Lvl 5`
                    : "Max Level reached"}
                </span>
              </div>
              <div className="progress-track">
                <div
                  className="progress-bar"
                  style={{ width: `${level === 4 ? progressPercentage : 100}%` }}
                ></div>
              </div>
              {level === 4 && (
                <div className="progress-footer">{xpToNextLevel} XP to Next Rank</div>
              )}
            </div>
          </div>
        </div>

        <div className="grid-challenges">
          {challenges.map((challenge) => (
            <div key={challenge.id} className="challenge-card">
              <div className="challenge-card-img-wrapper">
                <span className="ai-badge">AI Recommendations</span>
                <img
                  src={challenge.image}
                  alt={challenge.title}
                  className="challenge-card-img"
                />
              </div>
              <div className="challenge-card-content">
                <div>
                  <h4 className="challenge-card-title">{challenge.title}</h4>
                  <p className="challenge-card-desc">{challenge.description}</p>
                </div>

                <div className="challenge-card-footer">
                  {challenge.avatars ? (
                    <div className="avatar-group">
                      {challenge.avatars.map((av, index) => (
                        <img key={index} className="avatar" src={av} alt="User avatar" />
                      ))}
                      <div className="avatar more-users">+6</div>
                    </div>
                  ) : challenge.stat ? (
                    <div className="challenge-stat">
                      <span>Save Potential:</span>
                      <span className="challenge-stat-val">{challenge.stat}</span>
                    </div>
                  ) : (
                    <div style={{ width: "1px" }} />
                  )}

                  <button
                    className={`btn-challenge ${
                      challenge.status === "completed"
                        ? "completed"
                        : challenge.status !== "idle"
                          ? "glow-button"
                          : ""
                    }`}
                    onClick={() =>
                      challenge.status !== "completed" &&
                      handleChallengeAction(challenge.id, challenge.xpAward, challenge.status)
                    }
                  >
                    {challenge.status === "completed"
                      ? "Completed"
                      : challenge.status === "started"
                        ? "In Progress"
                        : challenge.status === "accepted"
                          ? "Accepted"
                          : challenge.status === "joined"
                            ? "Joined"
                            : challenge.id === "car-free"
                              ? "Accept Challenge"
                              : challenge.id === "plant-based"
                                ? "Join Them"
                                : "Start Challenge"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
});
