/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import { useState, useEffect, useCallback, useMemo } from "react";

import { fetchProfile, fetchActivities, logActivity } from "./lib/api";
import type { ActivityLog, UserProfile, Challenge } from "./lib/types";

import { Sidebar } from "./components/Sidebar";
import { MyOverviewTab } from "./components/MyOverviewTab";
import { ActivityLogTab } from "./components/ActivityLogTab";
import { MyGoalsTab } from "./components/MyGoalsTab";
import { ToastNotification } from "./components/ToastNotification";

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
  const triggerToast = useCallback((message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  }, []);

  // Handle XP addition and Level up check
  const addXp = useCallback((amount: number) => {
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
  }, [triggerToast]);

  // Toggle streak checkmarks (Targets view)
  const handleDayClick = useCallback((index: number) => {
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
  }, [checkedDays, addXp, triggerToast]);

  // Handle challenge buttons action
  const handleChallengeAction = useCallback((id: string, xpAward: number, currentStatus: string) => {
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
  }, [addXp, triggerToast]);

  // Dashboard Page Quick Log interaction handler
  const handleQuickLog = useCallback(async (activityName: string, co2SavedKg: number) => {
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
  }, [addXp, triggerToast]);

  // Activity Log Page submission handler
  const handleSaveEntry = useCallback(async (e: React.FormEvent) => {
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

      calculatedImpact = Number((utilityUsage) ? (usageNum * factor) : 0);
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
  }, [activeEntryTab, distance, vehicleType, utilityUsage, utilityType, dietType, addXp, triggerToast]);

  // Remove activity log
  const handleRemoveLog = useCallback((id: string, impact: number) => {
    setLoggedActivities((prev) => prev.filter((item) => item.id !== id));
    triggerToast(`Removed log entry! Reduced today's impact by ${impact} kg CO2e.`);
  }, [triggerToast]);

  // Helper calculations for Levels (Targets view)
  const totalNeededForLevel = nextLevelXp - currentLevelMinXp;
  const currentProgressXp = Math.max(0, xp - currentLevelMinXp);
  const progressPercentage = Math.min(100, (currentProgressXp / totalNeededForLevel) * 100);
  const xpToNextLevel = Math.max(0, nextLevelXp - xp);

  const weekdays = useMemo(() => ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], []);

  if (!profile) {
    return (
      <div style={{ color: "white", padding: "2rem" }}>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === "dashboard" && (
        <MyOverviewTab
          totalEmissions={totalEmissions}
          breakdownPct={breakdownPct}
          handleQuickLog={handleQuickLog}
        />
      )}

      {activeTab === "activity" && (
        <ActivityLogTab
          activeEntryTab={activeEntryTab}
          setActiveEntryTab={setActiveEntryTab}
          vehicleType={vehicleType}
          setVehicleType={setVehicleType}
          distance={distance}
          setDistance={setDistance}
          utilityType={utilityType}
          setUtilityType={setUtilityType}
          utilityUsage={utilityUsage}
          setUtilityUsage={setUtilityUsage}
          dietType={dietType}
          setDietType={setDietType}
          handleSaveEntry={handleSaveEntry}
          loggedActivities={loggedActivities}
          handleRemoveLog={handleRemoveLog}
          todayImpact={todayImpact}
        />
      )}

      {activeTab === "targets" && (
        <MyGoalsTab
          streakCount={streakCount}
          weekdays={weekdays}
          checkedDays={checkedDays}
          handleDayClick={handleDayClick}
          level={level}
          xp={xp}
          nextLevelXp={nextLevelXp}
          progressPercentage={progressPercentage}
          xpToNextLevel={xpToNextLevel}
          challenges={challenges}
          handleChallengeAction={handleChallengeAction}
        />
      )}

      <ToastNotification message={toastMessage} />
    </div>
  );
}
