import React from "react";
import type { ActivityLog } from "../lib/types";

interface ActivityLogTabProps {
  activeEntryTab: "transport" | "utilities" | "food";
  setActiveEntryTab: (tab: "transport" | "utilities" | "food") => void;
  vehicleType: string;
  setVehicleType: (val: string) => void;
  distance: string;
  setDistance: (val: string) => void;
  utilityType: string;
  setUtilityType: (val: string) => void;
  utilityUsage: string;
  setUtilityUsage: (val: string) => void;
  dietType: string;
  setDietType: (val: string) => void;
  handleSaveEntry: (e: React.FormEvent) => void;
  loggedActivities: ActivityLog[];
  handleRemoveLog: (id: string, impact: number) => void;
  todayImpact: number;
}

export const ActivityLogTab = React.memo(function ActivityLogTab({
  activeEntryTab,
  setActiveEntryTab,
  vehicleType,
  setVehicleType,
  distance,
  setDistance,
  utilityType,
  setUtilityType,
  utilityUsage,
  setUtilityUsage,
  dietType,
  setDietType,
  handleSaveEntry,
  loggedActivities,
  handleRemoveLog,
  todayImpact,
}: ActivityLogTabProps) {
  return (
    <main className="main-content">
      <header className="dashboard-header">
        <h1>Track Your Footprint</h1>
        <p>Record and review your carbon-emitting activities.</p>
      </header>

      <section className="dashboard-grid">
        <div className="activity-grid">
          {/* New Entry Form Card */}
          <div className="glass-card">
            <h3 className="streak-card-title" style={{ marginBottom: "1.2rem" }}>
              Log an Action
            </h3>

            {/* Form Subtabs: Transport, Utilities, Food */}
            <div className="form-tabs">
              <button
                type="button"
                className={`form-tab-btn ${activeEntryTab === "transport" ? "active" : ""}`}
                onClick={() => setActiveEntryTab("transport")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-1.1 0-2 .9-2 2v7c0 .6.4 1 1 1h1" />
                  <circle cx="7" cy="17" r="2" />
                  <path d="M9 17h6" />
                  <circle cx="17" cy="17" r="2" />
                </svg>
                <span>Transport</span>
              </button>
              <button
                type="button"
                className={`form-tab-btn ${activeEntryTab === "utilities" ? "active" : ""}`}
                onClick={() => setActiveEntryTab("utilities")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
                <span>Utilities</span>
              </button>
              <button
                type="button"
                className={`form-tab-btn ${activeEntryTab === "food" ? "active" : ""}`}
                onClick={() => setActiveEntryTab("food")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 2v20" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
                <span>Food</span>
              </button>
            </div>

            <form onSubmit={handleSaveEntry}>
              {activeEntryTab === "transport" && (
                <>
                  <div className="form-group">
                    <label htmlFor="vehicle-select">Vehicle Type</label>
                    <select
                      id="vehicle-select"
                      className="form-select"
                      value={vehicleType}
                      onChange={(e) => setVehicleType(e.target.value)}
                    >
                      <option value="Petrol Car">Petrol Car</option>
                      <option value="Diesel Car">Diesel Car</option>
                      <option value="Electric Vehicle">Electric Vehicle</option>
                      <option value="Motorcycle">Motorcycle</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="distance-input">Distance Travelled</label>
                    <div className="input-suffix-wrapper">
                      <input
                        id="distance-input"
                        type="text"
                        className="form-input"
                        value={distance}
                        onChange={(e) => setDistance(e.target.value)}
                      />
                      <span className="input-suffix">km</span>
                    </div>
                  </div>
                </>
              )}

              {activeEntryTab === "utilities" && (
                <>
                  <div className="form-group">
                    <label htmlFor="utility-select">Utility Type</label>
                    <select
                      id="utility-select"
                      className="form-select"
                      value={utilityType}
                      onChange={(e) => setUtilityType(e.target.value)}
                    >
                      <option value="Electricity">Electricity</option>
                      <option value="Gas">Gas</option>
                      <option value="Water">Water</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="utility-input">Usage</label>
                    <div className="input-suffix-wrapper">
                      <input
                        id="utility-input"
                        type="text"
                        className="form-input"
                        value={utilityUsage}
                        onChange={(e) => setUtilityUsage(e.target.value)}
                      />
                      <span className="input-suffix">
                        {utilityType === "Water" ? "m³" : "kWh"}
                      </span>
                    </div>
                  </div>
                </>
              )}

              {activeEntryTab === "food" && (
                <div className="form-group">
                  <label htmlFor="diet-select">Diet Type</label>
                  <select
                    id="diet-select"
                    className="form-select"
                    value={dietType}
                    onChange={(e) => setDietType(e.target.value)}
                  >
                    <option value="Average Meat Diet">Average Meat Diet</option>
                    <option value="Heavy Meat Diet">Heavy Meat Diet</option>
                    <option value="Vegetarian">Vegetarian</option>
                    <option value="Vegan">Vegan</option>
                  </select>
                </div>
              )}

              <button type="submit" className="btn-save-entry">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
                <span>Save Entry</span>
              </button>
            </form>
          </div>

          {/* Recent Logs Table Card */}
          <div className="glass-card" style={{ paddingBottom: "1.1rem" }}>
            <div className="logs-table-header">
              <h3 className="streak-card-title">Your Footprint Timeline</h3>
              <a
                href="#view-all"
                className="view-all-link"
                onClick={(e) => {
                  e.preventDefault();
                }}
              >
                View All &rarr;
              </a>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table className="recent-logs-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Category</th>
                    <th>Activity</th>
                    <th>Impact (kg co2)</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loggedActivities.map((log) => (
                    <tr key={log.id}>
                      <td className="log-date" data-label="Date">{log.date}</td>
                      <td data-label="Category">
                        <span className={`log-badge ${log.category}`}>
                          {log.category === "transport" ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                            >
                              <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-1.1 0-2 .9-2 2v7c0 .6.4 1 1 1h1" />
                              <circle cx="7" cy="17" r="2" />
                              <path d="M9 17h6" />
                              <circle cx="17" cy="17" r="2" />
                            </svg>
                          ) : log.category === "utilities" ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                            >
                              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                            </svg>
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                            >
                              <path d="M12 2v20" />
                              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                            </svg>
                          )}
                          <span style={{ textTransform: "capitalize" }}>{log.category}</span>
                        </span>
                      </td>
                      <td className="log-activity" data-label="Activity">{log.activity}</td>
                      <td className="log-impact" data-label="Impact">{log.impact.toFixed(1)}</td>
                      <td data-label="Actions">
                        <button
                          className="btn-log-action"
                          onClick={() => handleRemoveLog(log.id, log.impact)}
                          aria-label={`Remove log entry ${log.activity}`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M2 22C2 22 8 18 12 14C15 11 18 9 22 2C22 2 17 5 14 8C10 12 6 18 2 22Z" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Bottom Full Width Impact Banner */}
        <div
          className="glass-card impact-banner-card"
          style={{ backgroundImage: "url('/assets/car_free_tuesday.png')" }}
        >
          <div className="impact-banner-bg-overlay"></div>
          <div className="impact-banner-content">
            <div className="impact-stats-group">
              <div className="impact-co2-badge">CO₂</div>
              <div className="impact-stats-text">
                <span className="impact-stats-label">Today's Carbon Snapshot</span>
                <span className="impact-stats-value">{todayImpact.toFixed(1)} kg CO2e</span>
              </div>
            </div>
            <h3 className="impact-banner-title">Today's Carbon Snapshot</h3>
          </div>
        </div>
      </section>
    </main>
  );
});
