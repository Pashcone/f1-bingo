import { Bingo, Rule } from './bingo.type';

export type User = {
  id: string;
  name: string;
  wins: Bingo[];
  jokerRulesIds: string[];
};
