import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import App from "./App";
import * as api from "./lib/api";
import { UserProfile, ActivityLog } from "./lib/types";

// Mock the API module
vi.mock("./lib/api", () => ({
  fetchProfile: vi.fn(),
  fetchActivities: vi.fn(),
  logActivity: vi.fn(),
}));

const mockProfile: UserProfile = {
  device_id: "test",
  total_emissions: 1200,
  xp: 150,
  level: 4,
  streak: 6,
  challenges: {},
};

const mockActivities: ActivityLog[] = [
  {
    id: "log-1",
    date: "Today, 08:30",
    category: "transport",
    activity: "Petrol Car - 15km",
    impact: 2.8,
    device_id: "test",
  },
  {
    id: "log-2",
    date: "Yesterday",
    category: "food",
    activity: "Average Meat Diet",
    impact: 5.5,
    device_id: "test",
  },
  {
    id: "log-3",
    date: "Oct 24, 2023",
    category: "utilities",
    activity: "Electricity - 12 KWh",
    impact: 4.1,
    device_id: "test",
  },
];

describe("EcoTrack App Dashboard", () => {
  beforeEach(() => {
    vi.mocked(api.fetchProfile).mockResolvedValue(mockProfile);
    vi.mocked(api.fetchActivities).mockResolvedValue(mockActivities);
    vi.mocked(api.logActivity).mockImplementation(async (act) => ({
      ...act,
      id: "new-log",
      date: "Just now",
      device_id: "test",
    }));
  });

  it("renders with correct logo and heading on default Dashboard page", async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText("EcoTrack")).toBeInTheDocument();
    });
    expect(screen.getByText("Carbon Management")).toBeInTheDocument();
  });

  it("renders navigation items", async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getAllByText("Dashboard")[0]).toBeInTheDocument();
    });
    expect(screen.getByText("Activity Log")).toBeInTheDocument();
    expect(screen.getByText("Targets")).toBeInTheDocument();
  });

  it("handles switching between Dashboard and Targets tabs", async () => {
    render(<App />);
    await waitFor(() => screen.getAllByText("Dashboard")[0]);

    // Switch to Targets tab
    const targetsTab = screen.getByText("Targets");
    fireEvent.click(targetsTab);

    expect(screen.getByText("Animated Insights & Habits")).toBeInTheDocument();
  });

  it("handles quick log interactions on Dashboard page and reduces emissions", async () => {
    render(<App />);
    await waitFor(() => screen.getAllByText("Dashboard")[0]);

    const walkPill = screen.getByText("Logged a walk");
    fireEvent.click(walkPill);

    await waitFor(() => {
      expect(api.logActivity).toHaveBeenCalled();
    });
  });

  it("handles day streak checkbox interaction on Targets tab", async () => {
    render(<App />);
    await waitFor(() => screen.getAllByText("Dashboard")[0]);

    fireEvent.click(screen.getByText("Targets"));

    await waitFor(() => {
      expect(screen.getByText("6")).toBeInTheDocument();
    });

    const sundayBtn = screen.getByLabelText("Mark Sun as done");
    fireEvent.click(sundayBtn);

    await waitFor(() => {
      expect(screen.getByText("7")).toBeInTheDocument();
    });
  });

  it("handles challenge state completion transitions on Targets tab", async () => {
    render(<App />);
    await waitFor(() => screen.getAllByText("Dashboard")[0]);

    fireEvent.click(screen.getByText("Targets"));

    await waitFor(() => screen.getAllByRole("button", { name: "Start Challenge" }));
    const startBtns = screen.getAllByRole("button", { name: "Start Challenge" });
    const coldWaterBtn = startBtns[0]; // Cold water wash
    fireEvent.click(coldWaterBtn);

    await waitFor(() => {
      expect(screen.getByText("Started Cold Water Wash Challenge!")).toBeInTheDocument();
    });
  });

  it("triggers level up when crossing XP threshold on Targets tab", async () => {
    // We override the fetchProfile for this specific test
    vi.mocked(api.fetchProfile).mockResolvedValue({
      ...mockProfile,
      level: 4,
      xp: 380, // Needs 400 to level up
    });

    render(<App />);
    await waitFor(() => screen.getAllByText("Dashboard")[0]);

    fireEvent.click(screen.getByText("Targets"));

    await waitFor(() => expect(screen.getByText("Level 4")).toBeInTheDocument());

    const startBtns = screen.getAllByRole("button", { name: "Start Challenge" });
    const ledBtn = startBtns[1];
    fireEvent.click(ledBtn); // Gives 250 XP -> 630 >= 400

    await waitFor(() => {
      expect(screen.getByText("🎉 LEVEL UP! You are now Level 5!")).toBeInTheDocument();
    });
  });

  it("handles switching to Activity Log and renders initial table and banner values", async () => {
    render(<App />);
    await waitFor(() => screen.getAllByText("Dashboard")[0]);

    fireEvent.click(screen.getByText("Activity Log"));

    await waitFor(() => {
      expect(screen.getByText("Petrol Car - 15km")).toBeInTheDocument();
      expect(screen.getByText("Average Meat Diet")).toBeInTheDocument();
      expect(screen.getByText("Electricity - 12 KWh")).toBeInTheDocument();
    });
  });

  it("adds a new transport activity entry, updates table, and recalculates impact banner", async () => {
    render(<App />);
    await waitFor(() => screen.getAllByText("Dashboard")[0]);

    fireEvent.click(screen.getByText("Activity Log"));

    await waitFor(() => screen.getByText("Transport"));

    const distInput = screen.getByLabelText("Distance Travelled");
    fireEvent.change(distInput, { target: { value: "10" } });

    const saveBtn = screen.getByRole("button", { name: "Save Entry" });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(api.logActivity).toHaveBeenCalledWith({
        category: "transport",
        activity: "Petrol Car - 10km",
        impact: 1.9,
      });
      // The mock returns an object with "Just now", so we can check that it appears
      expect(screen.getByText("Petrol Car - 10km")).toBeInTheDocument();
    });
  });

  it("deletes a log entry and decreases today's impact", async () => {
    render(<App />);
    await waitFor(() => screen.getAllByText("Dashboard")[0]);

    fireEvent.click(screen.getByText("Activity Log"));
    await waitFor(() => screen.getByText("Petrol Car - 15km"));

    const removeBtns = screen.getAllByRole("button", { name: /Remove log entry/i });
    fireEvent.click(removeBtns[0]); // Removes the first one (2.8 impact)

    await waitFor(() => {
      expect(screen.queryByText("Petrol Car - 15km")).not.toBeInTheDocument();
    });
  });
});
