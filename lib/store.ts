import { create } from 'zustand';

interface FixtureDetails {
  competitionName: string;
  matchName: string;
  startDateUtc: string;
}

interface FixtureStore {
  fixtureDetails: { [key: string]: FixtureDetails };
  setFixtureDetails: (fixtureId: string, details: FixtureDetails) => void;
  getFixtureDetails: (fixtureId: string) => FixtureDetails | null;
}

export const useFixtureStore = create<FixtureStore>((set, get) => ({
  fixtureDetails: {},
  setFixtureDetails: (fixtureId, details) =>
    set((state) => ({
      fixtureDetails: {
        ...state.fixtureDetails,
        [fixtureId]: details,
      },
    })),
  getFixtureDetails: (fixtureId) => get().fixtureDetails[fixtureId] || null,
})); 