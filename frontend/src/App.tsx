/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import { useState, useEffect } from "react";

import { fetchProfile, fetchActivities, logActivity } from "./lib/api";
import type { ActivityLog, UserProfile } from "./lib/types";

interface Challenge {
  id: string;
  title: string;
  description: string;
  image: string;
  status: "idle" | "started" | "joined" | "accepted" | "completed";
  xpAward: number;
  stat?: string;
  avatars?: string[];
}

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  // Backend state
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loggedActivities, setLoggedActivities] = useState<ActivityLog[]>([]);

  useEffect(() => {
    async function loadData() {
      const p = await fetchProfile();
      const a = await fetchActivities();
      setProfile(p);
      setLoggedActivities(a);
    }
    loadData();
  }, []);

  // Dashboard page specific states
  const totalEmissions = profile ? profile.total_emissions / 1000 : 1.2; // Convert kg to tons
  const [breakdownPct, setBreakdownPct] = useState({
    transport: 40,
    homeEnergy: 30,
    food: 20,
    shopping: 10,
  });

  // Activity Log page specific states
  const [activeEntryTab, setActiveEntryTab] = useState<"transport" | "utilities" | "food">(
    "transport",
  );

  // Form fields
  const [vehicleType, setVehicleType] = useState<string>("Petrol Car");
  const [distance, setDistance] = useState<string>("0.0");
  const [utilityType, setUtilityType] = useState<string>("Electricity");
  const [utilityUsage, setUtilityUsage] = useState<string>("0.0");
  const [dietType, setDietType] = useState<string>("Average Meat Diet");

  // Today's Estimated Impact is the sum of logged activities
  const [todayImpact, setTodayImpact] = useState<number>(12.4);

  // Recalculate todayImpact whenever loggedActivities changes
  useEffect(() => {
    const total = loggedActivities.reduce((sum, item) => sum + item.impact, 0);
    setTodayImpact(Number(total.toFixed(1)));
  }, [loggedActivities]);

  // Streak days state (Mon-Sat checked, Sun unchecked)
  const [checkedDays, setCheckedDays] = useState<boolean[]>([
    true,
    true,
    true,
    true,
    true,
    true,
    false,
  ]);

  const streakCount = profile ? profile.streak : 0;
  const xp = profile ? profile.xp : 0;
  const level = profile ? profile.level : 1;
  const nextLevelXp = level * 100;
  const currentLevelMinXp = (level - 1) * 100;

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Challenges list state (Targets view)
  const [challenges, setChallenges] = useState<Challenge[]>([
    {
      id: "cold-water",
      title: "Cold Water Wash",
      description:
        "About 80% of the energy used by a washing machine goes toward heating the water. Switch to cold water for a month.",
      image: "/assets/cold_water_wash.png",
      status: "idle",
      xpAward: 150,
      avatars: [
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80",
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80",
      ],
    },
    {
      id: "car-free",
      title: "Car-Free Tuesday",
      description:
        "Commit to using public transit, biking, or walking for all your commutes this coming Tuesday. Small builds big impacts.",
      image: "/assets/car_free_tuesday.png",
      status: "idle",
      xpAward: 200,
    },
    {
      id: "led-bulbs",
      title: "Switch to LED Bulbs",
      description:
        "Replacing your home's 5 light fixtures or bulbs kit with models that have earned the Energy Star.",
      image: "/assets/led_bulbs.png",
      status: "idle",
      xpAward: 250,
      stat: "~15kg CO2e/yr",
    },
    {
      id: "plant-based",
      title: "Plant-Based Weekend",
      description:
        "Meat production is a significant driver of emissions. Commit to 100% plant-based meals this Saturday and Sunday.",
      image: "/assets/plant_based_weekend.png",
      status: "idle",
      xpAward: 180,
      avatars: [
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80",
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80",
      ],
    },
  ]);

  // Function to show toast
  const triggerToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Toggle streak checkmarks (Targets view)
  const handleDayClick = (index: number) => {
    const updated = [...checkedDays];
    updated[index] = !updated[index];
    setCheckedDays(updated);

    setProfile((prev) => {
      if (!prev) return prev;
      return { ...prev, streak: updated.filter(Boolean).length };
    });

    if (updated[index]) {
      triggerToast(`Day logged! Keep up the momentum.`);
      addXp(30);
    } else {
      triggerToast("Day unchecked.");
    }
  };

  // Handle XP addition and Level up check
  const addXp = (amount: number) => {
    setProfile((prev) => {
      if (!prev) return prev;
      const newXp = prev.xp + amount;
      const newLevel = newXp >= prev.level * 100 ? prev.level + 1 : prev.level;
      const finalXp = newLevel > prev.level ? 0 : newXp;
      if (newLevel > prev.level) {
        triggerToast(`🎉 LEVEL UP! You are now Level ${newLevel}!`);
      }
      return { ...prev, xp: finalXp, level: newLevel };
    });
  };

  // Handle challenge buttons action
  const handleChallengeAction = (id: string, xpAward: number, currentStatus: string) => {
    setChallenges((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          let nextStatus: Challenge["status"] = "completed";
          let actionLabel = "";

          if (id === "cold-water") {
            nextStatus = currentStatus === "idle" ? "started" : "completed";
            actionLabel =
              nextStatus === "started"
                ? "Started Cold Water Wash Challenge!"
                : "Completed Cold Water Wash! +150 XP";
          } else if (id === "car-free") {
            nextStatus = currentStatus === "idle" ? "accepted" : "completed";
            actionLabel =
              nextStatus === "accepted"
                ? "Accepted Car-Free Tuesday!"
                : "Completed Car-Free Tuesday! +200 XP";
          } else if (id === "led-bulbs") {
            nextStatus = "completed";
            actionLabel = "Completed Switch to LED Bulbs! +250 XP";
          } else if (id === "plant-based") {
            nextStatus = currentStatus === "idle" ? "joined" : "completed";
            actionLabel =
              nextStatus === "joined"
                ? "Joined Plant-Based Weekend!"
                : "Completed Plant-Based Weekend! +180 XP";
          }

          if (nextStatus === "completed") {
            addXp(xpAward);
          } else {
            addXp(50);
          }

          triggerToast(actionLabel);
          return { ...c, status: nextStatus };
        }
        return c;
      }),
    );
  };

  // Dashboard Page Quick Log interaction handler
  const handleQuickLog = async (activityName: string, co2SavedKg: number) => {
    const savedTons = co2SavedKg / 1000;

    // Log to backend
    const act = await logActivity({
      category: "transport", // defaults
      activity: activityName,
      impact: -co2SavedKg, // savings are negative impact
    });

    setLoggedActivities((prev) => [act, ...prev]);

    setProfile((prev) => {
      if (!prev) return prev;
      const newEmissions =
        Math.max(0.1, Number((prev.total_emissions / 1000 - savedTons).toFixed(4))) * 1000;
      return { ...prev, total_emissions: newEmissions };
    });

    addXp(40);

    setBreakdownPct((prev) => {
      if (
        activityName.toLowerCase().includes("walk") ||
        activityName.toLowerCase().includes("transit")
      ) {
        return {
          ...prev,
          transport: Math.max(10, prev.transport - 2),
          shopping: Math.min(30, prev.shopping + 1),
          food: Math.min(30, prev.food + 1),
        };
      } else if (
        activityName.toLowerCase().includes("vegan") ||
        activityName.toLowerCase().includes("plant")
      ) {
        return {
          ...prev,
          food: Math.max(5, prev.food - 3),
          homeEnergy: Math.min(45, prev.homeEnergy + 2),
          transport: Math.min(50, prev.transport + 1),
        };
      } else if (activityName.toLowerCase().includes("recycled")) {
        return {
          ...prev,
          shopping: Math.max(5, prev.shopping - 2),
          food: Math.min(30, prev.food + 2),
        };
      }
      return prev;
    });

    triggerToast(`Logged: "${activityName}"! Saved ${co2SavedKg} kg CO2e. +40 XP`);
  };

  // Activity Log Page submission handler
  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault();

    let activityText = "";
    let calculatedImpact = 0;

    if (activeEntryTab === "transport") {
      const distNum = parseFloat(distance) || 0;
      let factor = 0.187; // Petrol Car default
      if (vehicleType === "Diesel Car") factor = 0.175;
      else if (vehicleType === "Electric Vehicle") factor = 0.05;
      else if (vehicleType === "Motorcycle") factor = 0.11;

      calculatedImpact = Number((distNum * factor).toFixed(1));
      activityText = `${vehicleType} - ${distNum}km`;
    } else if (activeEntryTab === "utilities") {
      const usageNum = parseFloat(utilityUsage) || 0;
      let factor = 0.34; // Electricity
      if (utilityType === "Gas") factor = 0.2;
      else if (utilityType === "Water") factor = 0.05;

      calculatedImpact = Number((usageNum * factor).toFixed(1));
      activityText = `${utilityType} - ${usageNum} ${utilityType === "Water" ? "m³" : "kWh"}`;
    } else if (activeEntryTab === "food") {
      let impact = 5.5; // Average Meat Diet
      if (dietType === "Heavy Meat Diet") impact = 7.2;
      else if (dietType === "Vegetarian") impact = 2.5;
      else if (dietType === "Vegan") impact = 1.5;

      calculatedImpact = impact;
      activityText = dietType;
    }

    const newLog = await logActivity({
      category: activeEntryTab,
      activity: activityText,
      impact: calculatedImpact,
    });

    setLoggedActivities((prev) => [newLog, ...prev]);

    setProfile((prev) => {
      if (!prev) return prev;
      return { ...prev, total_emissions: prev.total_emissions + calculatedImpact };
    });

    addXp(50);
    triggerToast(`Entry saved! Logged ${calculatedImpact} kg CO2e. +50 XP`);
  };

  // Remove activity log
  const handleRemoveLog = (id: string, impact: number) => {
    setLoggedActivities((prev) => prev.filter((item) => item.id !== id));
    triggerToast(`Removed log entry! Reduced today's impact by ${impact} kg CO2e.`);
  };

  // Helper calculations for Levels (Targets view)
  const totalNeededForLevel = nextLevelXp - currentLevelMinXp;
  const currentProgressXp = Math.max(0, xp - currentLevelMinXp);
  const progressPercentage = Math.min(100, (currentProgressXp / totalNeededForLevel) * 100);
  const xpToNextLevel = Math.max(0, nextLevelXp - xp);

  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="dashboard-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="logo-section">
          <h2 className="logo-title">EcoTrack</h2>
          <div className="logo-sub">Carbon Management</div>
        </div>

        <ul className="nav-menu">
          <li
            className={`nav-item ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
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
              <rect x="3" y="3" width="7" height="9" />
              <rect x="14" y="3" width="7" height="5" />
              <rect x="14" y="12" width="7" height="9" />
              <rect x="3" y="16" width="7" height="5" />
            </svg>
            <span>Dashboard</span>
          </li>
          <li
            className={`nav-item ${activeTab === "activity" ? "active" : ""}`}
            onClick={() => setActiveTab("activity")}
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
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
            <span>Activity Log</span>
          </li>
          <li
            className={`nav-item ${activeTab === "targets" ? "active" : ""}`}
            onClick={() => setActiveTab("targets")}
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
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="6" />
              <circle cx="12" cy="12" r="2" />
            </svg>
            <span>Targets</span>
          </li>
        </ul>
      </aside>

      {/* Main Panel Routing */}
      {activeTab === "dashboard" ? (
        /* ========================================== */
        /* Dashboard View                             */
        /* ========================================== */
        <main className="main-content">
          <header className="dashboard-header">
            <h1>Dashboard</h1>
            <p>Here is your carbon footprint overview for this month.</p>
          </header>

          <section className="dashboard-grid">
            <div className="card-row-dashboard-top">
              <div
                className="glass-card emissions-card"
                style={{ backgroundImage: "url('/assets/eco_island.png')" }}
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
                        style={{ height: `${totalEmissions * 50}px` }}
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
                style={{ backgroundImage: "url('/assets/eco_island.png')" }}
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
                    backgroundImage: "url('/assets/leaf_glow_chart.png')",
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
              <div className="quick-log-pill" onClick={() => handleQuickLog("Logged a walk", 0.9)}>
                <div className="pill-info">
                  <span className="pill-title">Logged a walk</span>
                  <span className="pill-co2">-0.9 kg CO2e</span>
                </div>
                <div className="pill-plus">+</div>
              </div>

              <div className="quick-log-pill" onClick={() => handleQuickLog("Ate vegan meal", 3.7)}>
                <div className="pill-info">
                  <span className="pill-title">Ate vegan</span>
                  <span className="pill-co2">-3.7 kg CO2e</span>
                </div>
                <div className="pill-plus">+</div>
              </div>

              <div className="quick-log-pill" onClick={() => handleQuickLog("Recycled waste", 0.6)}>
                <div className="pill-info">
                  <span className="pill-title">Recycled</span>
                  <span className="pill-co2">-0.6 kg CO2e</span>
                </div>
                <div className="pill-plus">+</div>
              </div>

              <div
                className="quick-log-pill quick-log-full-width"
                onClick={() => handleQuickLog("Second-hand clothing shopping", 2.8)}
              >
                <div className="pill-info">
                  <span className="pill-title">Second-hand clothing shopping</span>
                  <span className="pill-co2">-2.8 kg CO2e</span>
                </div>
                <div className="pill-plus">+</div>
              </div>
            </div>
          </section>
        </main>
      ) : activeTab === "activity" ? (
        /* ========================================== */
        /* Activity Log View                          */
        /* ========================================== */
        <main className="main-content">
          <header className="dashboard-header">
            <h1>Editorial Activity Log</h1>
            <p>Record and review your carbon-emitting activities.</p>
          </header>

          <section className="dashboard-grid">
            <div className="activity-grid">
              {/* New Entry Form Card */}
              <div className="glass-card">
                <h3 className="streak-card-title" style={{ marginBottom: "1.2rem" }}>
                  New Entry
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
                  <h3 className="streak-card-title">Recent Logs</h3>
                  <a
                    href="#view-all"
                    className="view-all-link"
                    onClick={(e) => {
                      e.preventDefault();
                      triggerToast("Recent logs view expanded.");
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
                          <td className="log-date">{log.date}</td>
                          <td>
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
                          <td className="log-activity">{log.activity}</td>
                          <td className="log-impact">{log.impact.toFixed(1)}</td>
                          <td>
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
                    <span className="impact-stats-label">Today's Estimated Impact</span>
                    <span className="impact-stats-value">{todayImpact.toFixed(1)} kg CO2e</span>
                  </div>
                </div>
                <h3 className="impact-banner-title">Today's Estimated Impact</h3>
              </div>
            </div>
          </section>
        </main>
      ) : (
        /* ========================================== */
        /* Targets View (from previous implementation)*/
        /* ========================================== */
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
      )}

      {/* Floating toast notification */}
      {toastMessage && (
        <div className="toast-msg">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
