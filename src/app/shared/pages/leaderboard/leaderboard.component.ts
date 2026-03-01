import { Component, Input, OnInit } from '@angular/core';
import { BingoService } from '../../services/bingo/bingo.service';

export type BingoType = 'QUALY' | 'RACE' | 'SQUALY' | 'SPRINT';

export type Rule = {
  id: string;
  name: string;
  description: string;
  jokerUserId?: string;
};

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

export type User = {
  id: string;
  name: string;
  wins: Bingo[];
  jokerRulesIds: string[];
  imagePath?: string;
};

type RankedUser = {
  user: User;
  raceId: number;
  bingo?: Bingo;
  bingoAt?: Date;
  checkedCount: number;
  points: number;
};

type SeasonResult = {
  user: User;
  totalPoints: number;
  raceResults: RankedUser[];
};

const POINTS_TABLE = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.scss'],
})
export class LeaderboardComponent implements OnInit {
  @Input() users: User[] = [];
  @Input() bingos: Bingo[] = [];
  @Input() totalRaces = 25;

  seasonResults: SeasonResult[] = [];
  leaderboard: SeasonResult[] = [];

  constructor(private service: BingoService) {}

  ngOnInit() {
    this.service.users$.subscribe((e) => {
      this.users = e;
    });
    this.service.bingos$.subscribe((e) => {
      this.bingos = e;

      this.seasonResults = this.calculateSeason(
        this.users,
        this.bingos,
        this.totalRaces
      );
      this.leaderboard = [...this.seasonResults].sort(
        (a, b) => b.totalPoints - a.totalPoints
      );
    });
  }

  /** Rank a single race */
  private rankRace(
    users: User[],
    bingos: Bingo[],
    raceId: number
  ): RankedUser[] {
    const ranked: RankedUser[] = [];

    for (const user of users) {
      const bingo = bingos.find(
        (b) => b.userId === user.id && b.raceId === raceId
      );
      if (!bingo) continue;

      const checkedCount = bingo.checkedRules.filter(Boolean).length;

      ranked.push({
        user,
        raceId,
        bingo,
        bingoAt: bingo.win,
        checkedCount,
        points: 0,
      });
    }

    ranked.sort((a, b) => {
      if (a.bingoAt && !b.bingoAt) return -1;
      if (!a.bingoAt && b.bingoAt) return 1;

      if (a.bingoAt && b.bingoAt) {
        const aTime = new Date(a.bingoAt).getTime();
        const bTime = new Date(b.bingoAt).getTime();
        return aTime - bTime;
      }

      return b.checkedCount - a.checkedCount;
    });

    ranked.forEach((r, i) => {
      r.points = POINTS_TABLE[i] ?? 0;
    });

    return ranked;
  }

  /** Calculate full season */
  private calculateSeason(
    users: User[],
    bingos: Bingo[],
    totalRaces: number
  ): SeasonResult[] {
    const seasonResults: Map<string, SeasonResult> = new Map();

    for (const user of users) {
      seasonResults.set(user.id, { user, totalPoints: 0, raceResults: [] });
    }

    for (let raceId = 1; raceId <= totalRaces; raceId++) {
      const raceRanking = this.rankRace(users, bingos, raceId);

      for (const r of raceRanking) {
        const result = seasonResults.get(r.user.id)!;
        result.totalPoints += r.points;
        result.raceResults.push(r);
      }
    }

    return Array.from(seasonResults.values()).sort(
      (a, b) => b.totalPoints - a.totalPoints
    );
  }

  /** Race numbers for table headers */
  get raceNumbers(): number[] {
    if (!this.seasonResults.length) return [];
    return Array.from({ length: this.totalRaces }, (_, i) => i + 1);
  }

  /** Get points per race for a user */
  getPointsForRace(userId: string, raceId: number): number {
    const user = this.seasonResults.find((u) => u.user.id === userId);
    const race = user?.raceResults.find((r) => r.raceId === raceId);
    return race?.points ?? 0;
  }
}
