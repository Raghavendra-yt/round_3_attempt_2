import React from "react";

interface MyOverviewTabProps {
  totalEmissions: number;
  breakdownPct: {
    transport: number;
    homeEnergy: number;
    food: number;
    shopping: number;
  };
  handleQuickLog: (activityName: string, co2SavedKg: number) => void;
}

export const MyOverviewTab = React.memo(function MyOverviewTab({
  totalEmissions,
  breakdownPct,
  handleQuickLog,
}: MyOverviewTabProps) {
  return (
    <main className="main-content">
      <header className="dashboard-header">
        <h1>My Overview</h1>
        <p>Here is your carbon footprint overview for this month.</p>
      </header>

      <section className="dashboard-grid">
        <div className="card-row-dashboard-top">
          <div
            className="glass-card emissions-card"
            style={{ backgroundImage: "url('assets/eco_island.png')" }}
          >
            <div className="emissions-card-bg-overlay"></div>
            <div className="emissions-content">
              <h3 className="emissions-title">Total Emissions</h3>
              <div className="emissions-value">{totalEmissions.toFixed(1)} Tons CO2e</div>
              <p className="emissions-subtext">
                You are <strong>40% below</strong> the regional average of 2.0 Tons.
              </p>
            </div>
          </div>

          <div className="stack-column-right">
            <div className="glass-card">
              <h3 className="streak-card-title">Monthly Trend</h3>
              <div className="trend-chart-container">
                <div className="trend-col">
                  <span className="trend-badge negative">-8%</span>
                  <div className="organic-blob" style={{ height: "45px" }}></div>
                  <span className="trend-label">Jan</span>
                </div>
                <div className="trend-col">
                  <span className="trend-badge">+6%</span>
                  <div className="organic-blob" style={{ height: "70px" }}></div>
                  <span className="trend-label">Feb</span>
                </div>
                <div className="trend-col">
                  <span className="trend-badge negative">-12%</span>
                  <div className="organic-blob" style={{ height: "35px" }}></div>
                  <span className="trend-label">Mar</span>
                </div>
                <div className="trend-col">
                  <span className="trend-badge negative">-20%</span>
                  <div className="organic-blob" style={{ height: "95px" }}></div>
                  <span className="trend-label">Apr</span>
                </div>
                <div className="trend-col">
                  <span className="trend-badge">+5%</span>
                  <div
                    className="organic-blob"
                    style={{ height: `${Math.min(130, totalEmissions * 50)}px` }}
                  ></div>
                  <span className="trend-label">May</span>
                </div>
              </div>
            </div>

            <div className="glass-card">
              <h3 className="streak-card-title">Breakdown</h3>
              <div className="breakdown-list">
                <div className="breakdown-item">
                  <div className="breakdown-label-group">
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
                  </div>
                  <div className="breakdown-bar-container">
                    <div
                      className="breakdown-bar-fill"
                      style={{ width: `${breakdownPct.transport}%` }}
                    ></div>
                  </div>
                  <span className="breakdown-val">{breakdownPct.transport}%</span>
                </div>

                <div className="breakdown-item">
                  <div className="breakdown-label-group">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                    <span>Home Energy</span>
                  </div>
                  <div className="breakdown-bar-container">
                    <div
                      className="breakdown-bar-fill"
                      style={{ width: `${breakdownPct.homeEnergy}%` }}
                    ></div>
                  </div>
                  <span className="breakdown-val">{breakdownPct.homeEnergy}%</span>
                </div>

                <div className="breakdown-item">
                  <div className="breakdown-label-group">
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
                  </div>
                  <div className="breakdown-bar-container">
                    <div
                      className="breakdown-bar-fill green"
                      style={{ width: `${breakdownPct.food}%` }}
                    ></div>
                  </div>
                  <span className="breakdown-val">{breakdownPct.food}%</span>
                </div>

                <div className="breakdown-item">
                  <div className="breakdown-label-group">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                      <line x1="3" y1="6" x2="21" y2="6"></line>
                      <path d="M16 10a4 4 0 0 1-8 0"></path>
                    </svg>
                    <span>Shopping</span>
                  </div>
                  <div className="breakdown-bar-container">
                    <div
                      className="breakdown-bar-fill green"
                      style={{ width: `${breakdownPct.shopping}%` }}
                    ></div>
                  </div>
                  <span className="breakdown-val">{breakdownPct.shopping}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <h2 className="quick-log-section-title">Quick Log</h2>
        <div className="card-row-dashboard-top">
          <div
            className="glass-card blurry-card"
            style={{ backgroundImage: "url('assets/eco_island.png')" }}
          >
            <div className="blur-overlay"></div>
            <div className="blur-card-text">
              Lush moss and forest systems absorb up to 25% more carbon dioxide than traditional
              structures.
            </div>
          </div>

          <div className="stack-column-right">
            <div
              className="glass-card blurry-card"
              style={{
                backgroundImage: "url('assets/leaf_glow_chart.png')",
                minHeight: "150px",
              }}
            >
              <div className="blur-overlay" style={{ opacity: 0.15 }}></div>
              <div
                className="streak-title-container"
                style={{
                  position: "relative",
                  zIndex: 2,
                  justifyContent: "space-around",
                  width: "100%",
                }}
              >
                <span className="trend-badge">3.0</span>
                <span className="trend-badge negative">-1.5</span>
                <span className="trend-badge">4.5</span>
                <span className="trend-badge negative">-0.5</span>
              </div>
            </div>

            <div className="glass-card leaf-breakdown-card">
              <h3 className="streak-card-title">Breakdown</h3>
              <div className="leaf-list">
                <div className="leaf-item">
                  <div className="leaf-label-group">
                    <svg
                      className="leaf-icon-svg"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2C6.5 2 2 6.5 2 12c0 2.8 1.1 5.3 3 7.1V22h3v-2.1c.6.1 1.3.1 2 .1 5.5 0 10-4.5 10-10C22 6.5 17.5 2 12 2Z" />
                    </svg>
                    <span className="leaf-name">Transport</span>
                  </div>
                  <span className="leaf-pct">40%</span>
                </div>

                <div className="leaf-item">
                  <div className="leaf-label-group">
                    <svg
                      className="leaf-icon-svg"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2C6.5 2 2 6.5 2 12c0 2.8 1.1 5.3 3 7.1V22h3v-2.1c.6.1 1.3.1 2 .1 5.5 0 10-4.5 10-10C22 6.5 17.5 2 12 2Z" />
                    </svg>
                    <span className="leaf-name">Home Energy</span>
                  </div>
                  <span className="leaf-pct">20%</span>
                </div>

                <div className="leaf-item">
                  <div className="leaf-label-group">
                    <svg
                      className="leaf-icon-svg"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2C6.5 2 2 6.5 2 12c0 2.8 1.1 5.3 3 7.1V22h3v-2.1c.6.1 1.3.1 2 .1 5.5 0 10-4.5 10-10C22 6.5 17.5 2 12 2Z" />
                    </svg>
                    <span className="leaf-name">Food</span>
                  </div>
                  <span className="leaf-pct">20%</span>
                </div>

                <div className="leaf-item">
                  <div className="leaf-label-group">
                    <svg
                      className="leaf-icon-svg"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2C6.5 2 2 6.5 2 12c0 2.8 1.1 5.3 3 7.1V22h3v-2.1c.6.1 1.3.1 2 .1 5.5 0 10-4.5 10-10C22 6.5 17.5 2 12 2Z" />
                    </svg>
                    <span className="leaf-name">Shopping</span>
                  </div>
                  <span className="leaf-pct">10%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <h2 className="quick-log-section-title">Quick Log</h2>
        <div className="quick-log-grid">
          <button
            type="button"
            className="quick-log-pill"
            onClick={() => handleQuickLog("Logged a walk", 0.9)}
          >
            <div className="pill-info">
              <span className="pill-title">Logged a walk</span>
              <span className="pill-co2">-0.9 kg CO2e</span>
            </div>
            <div className="pill-plus">+</div>
          </button>

          <button
            type="button"
            className="quick-log-pill"
            onClick={() => handleQuickLog("Ate vegan meal", 3.7)}
          >
            <div className="pill-info">
              <span className="pill-title">Ate vegan</span>
              <span className="pill-co2">-3.7 kg CO2e</span>
            </div>
            <div className="pill-plus">+</div>
          </button>

          <button
            type="button"
            className="quick-log-pill"
            onClick={() => handleQuickLog("Recycled waste", 0.6)}
          >
            <div className="pill-info">
              <span className="pill-title">Recycled</span>
              <span className="pill-co2">-0.6 kg CO2e</span>
            </div>
            <div className="pill-plus">+</div>
          </button>

          <button
            type="button"
            className="quick-log-pill quick-log-full-width"
            onClick={() => handleQuickLog("Second-hand clothing shopping", 2.8)}
          >
            <div className="pill-info">
              <span className="pill-title">Second-hand clothing shopping</span>
              <span className="pill-co2">-2.8 kg CO2e</span>
            </div>
            <div className="pill-plus">+</div>
          </button>
        </div>
      </section>
    </main>
  );
});
