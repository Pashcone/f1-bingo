export type Race = {
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  round: number;
  slug: string;
  localeKey: string;
  sessions: {
    [key in KnownSession]: string; // ISO 8601 date-time strings
  };

  flagImg: string;

};

export type RacesData = {
  races: Race[];
};

type KnownSession = 'fp1' | 'fp2' | 'fp3' | 'qualifying' | 'gp' | 'sprint' | 'sprintQualifying';
