export type Bingo = {
  id?: string;
  raceId: number;
  userId: string;
  rulesIds: string[];
  checkedRules: boolean[];
  type: BingoType;
  year: number;
  lastChecked: Date[];
  win?: Date;
  refreshNumber: number;
};

export type BingoWithRules = Bingo & {
  rules?: Rule[];
  replacedRules?: string[];
};

export type Rule = {
  id: string;
  name: string;
  description: string;
  jokerUserId?: string;
};

export type CheckedRule = {
  id: string;
  ruleId: string;
  bingoId: string;
};

export type BingoType = 'QUALY' | 'RACE' | 'SQUALY' | 'SPRINT';
