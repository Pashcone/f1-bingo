export type Bingo = {
  id?: string;
  raceId: number;
  userId: string;
  rulesIds: string[];
  type: BingoType;
  year: number;
  win?: boolean;
};

export type BingoWithRules = Bingo & {
  rules?: Rule[];
  checkedRules?: CheckedRule[];
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
