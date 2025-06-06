export type Race = {
  id: number;
  round: number;
  date: string;
  time: string;
  grandPrixId: string;
  officialName: string;
  qualifyingFormat: 'KNOCKOUT';
  sprintQualifyingFormat?: 'SPRINT_SHOOTOUT';
  circuitId: string;
  circuitType: 'RACE' | 'STREET';
  direction: 'CLOCKWISE' | 'ANTI_CLOCKWISE';
  courseLength: number;
  turns: number;
  laps: number;
  distance: number;
  scheduledLaps?: number;
  scheduledDistance?: number;

  freePractice1Date: string;
  freePractice1Time: string;
  freePractice2Date?: string;
  freePractice2Time?: string;
  freePractice3Date?: string;
  freePractice3Time?: string;

  qualifyingDate: string;
  qualifyingTime: string;

  sprintQualifyingDate?: string;
  sprintQualifyingTime?: string;
  sprintRaceDate?: string;
  sprintRaceTime?: string;

  flagImg: string;
  trackImg: string;
};

export type RacesData = {
  races: Race[];
};
