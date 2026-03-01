import { Injectable, OnInit } from '@angular/core';
import {
  Bingo,
  BingoType,
  BingoWithRules,
  CheckedRule,
  Rule,
} from '../../models/bingo.type';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, map, Observable, race, tap } from 'rxjs';
import { Race } from '../../models/race.type';
import { User } from '../../models/user.type';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BingoService implements OnInit {
  constructor(private http: HttpClient) {}

  apiUrl = environment.apiUrl;

  ngOnInit(): void {
    this.loadAllData();
    this.loadJMK();
  }

  generateRandomId(length: number = 10): string {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;

    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  private racesV2Subject = new BehaviorSubject<any[]>([]);
  racesV2$ = this.racesV2Subject.asObservable();

  loadJMK() {
    this.http
      .get<any>(
        `https://api.openf1.org/v1/sessions?year=2026&session_name=Race`,
      )
      .subscribe((data) => {
        this.racesV2Subject.next(data);
        console.log('data', data);
      });
  }

  private usersSubject = new BehaviorSubject<User[]>([]);
  private racesSubject = new BehaviorSubject<Race[]>([]);
  private bingosSubject = new BehaviorSubject<Bingo[]>([]);
  private rulesSubject = new BehaviorSubject<Rule[]>([]);
  private activeBingoSubject = new BehaviorSubject<BingoWithRules>(
    {} as BingoWithRules,
  );
  private activeSessionChecked = new BehaviorSubject<boolean>(false);

  users$ = this.usersSubject.asObservable();
  races$ = this.racesSubject.asObservable();
  bingos$ = this.bingosSubject.asObservable();
  rules$ = this.rulesSubject.asObservable();
  activeBingo$ = this.activeBingoSubject.asObservable();
  activeSessionChecked$ = this.activeSessionChecked.asObservable();
  activeUser: User | null = null;

  loadAllData() {
    this.loadJMK();
    this.loadUsers();
    this.loadRaces();
    this.loadBingos();
    this.loadRules();
    this.isActiveSession();
  }

  // Users
  loadUsers() {
    this.http.get<User[]>(`${this.apiUrl}/users`).subscribe((data) => {
      this.usersSubject.next(data);
    });
  }

  addUser(user: string, imagePath: string): Observable<User> {
    const newId = this.generateRandomId();
    const newUser = {
      name: user,
      id: newId,
      wins: [],
      jokerRulesIds: [],
      imagePath: imagePath,
    };
    return this.http.post<User>(`${this.apiUrl}/users`, newUser).pipe(
      tap((data) => {
        this.usersSubject.next([...this.usersSubject.value, data]);
        this.activeUser = data;
      }),
    );
  }

  updateUser(user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/users/${user.id}`, user).pipe(
      tap((updated) => {
        const updatedList = this.usersSubject.value.map((u) =>
          u.id === updated.id ? updated : u,
        );
        this.usersSubject.next(updatedList);
      }),
    );
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${id}`).pipe(
      tap(() => {
        const updatedList = this.usersSubject.value.filter((u) => u.id !== id);
        this.usersSubject.next(updatedList);
      }),
    );
  }

  // Races
  loadRaces() {
    this.http.get<Race[]>(`${this.apiUrl}/races`).subscribe((data) => {
      this.racesSubject.next(data);
    });
  }

  addRace(race: Partial<Race>): Observable<Race> {
    return this.http.post<Race>(`${this.apiUrl}/races`, race).pipe(
      tap((data) => {
        this.racesSubject.next([...this.racesSubject.value, data]);
      }),
    );
  }

  updateRace(race: Race): Observable<Race> {
    return this.http.put<Race>(`${this.apiUrl}/races/${race.round}`, race).pipe(
      tap((updated) => {
        const updatedList = this.racesSubject.value.map((r) =>
          r.round === updated.round ? updated : r,
        );
        this.racesSubject.next(updatedList);
      }),
    );
  }

  deleteRace(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/races/${id}`).pipe(
      tap(() => {
        const updatedList = this.racesSubject.value.filter(
          (r) => r.round !== id,
        );
        this.racesSubject.next(updatedList);
      }),
    );
  }

  // Bingos
  loadBingos() {
    this.http.get<Bingo[]>(`${this.apiUrl}/bingos`).subscribe((data) => {
      this.bingosSubject.next(data);
    });
  }

  getBingosByRaceAndUser(
    userId: string,
    raceId: number,
    year: string,
    type: BingoType,
  ): void {
    console.log(
      'asasdas',
      `${this.apiUrl}/bingos?year=${year}&userId=${userId}&raceId=${raceId}&type=${type}`,
    );

    this.http
      .get<Bingo[]>(
        `${this.apiUrl}/bingos?year=${year}&userId=${userId}&raceId=${raceId}&type=${type}`,
      )
      .pipe(
        tap((data) => {
          if (data.length) {
            this.activeBingoSubject.next(data[0]);
            this.getRulesForBingo(
              this.activeBingoSubject.value.rulesIds,
            ).subscribe((e: Rule[]) => {
              const bingo = { ...this.activeBingoSubject.value, rules: e };
              this.activeBingoSubject.next(bingo);
            });
          } else {
            this.generateBingo(userId, raceId, year, type).subscribe();
          }
        }),
      )
      .subscribe();
  }

  addBingo(bingo: Bingo): Observable<Bingo> {
    return this.http.post<Bingo>(`${this.apiUrl}/bingos`, bingo);
  }

  updateBingo(bingo: Partial<Bingo>): Observable<Bingo> {
    return this.http
      .put<Bingo>(`${this.apiUrl}/bingos/${bingo.id}`, bingo)
      .pipe(
        tap((updated) => {
          const updatedList = this.bingosSubject.value.map((b) =>
            b.id === updated.id ? updated : b,
          );
          this.bingosSubject.next(updatedList);
        }),
      );
  }

  setBingoToWin(bingoId: string): Observable<Bingo> {
    const bingo = this.activeBingoSubject.value;
    const date = new Date();
    const BingoWithWin: Bingo = {
      id: bingo.id,
      raceId: bingo.raceId,
      userId: bingo.userId,
      rulesIds: bingo.rulesIds,
      checkedRules: bingo.checkedRules,
      type: bingo.type,
      lastChecked: bingo.lastChecked,
      year: bingo.year,
      win: date,
      refreshNumber: bingo.refreshNumber,
    };
    return this.http
      .put<Bingo>(`${this.apiUrl}/bingos/${bingoId}`, BingoWithWin)
      .pipe(
        tap((updated) => {
          let newBingo = this.activeBingoSubject.value;
          newBingo.win = updated.win;
          this.activeBingoSubject.next(newBingo);

          const updatedList = this.bingosSubject.value.map((b) =>
            b.id === updated.id ? updated : b,
          );
          this.bingosSubject.next(updatedList);
        }),
      );
  }

  setBingoToNotWin(bingoId: string): Observable<Bingo> {
    const bingo = this.activeBingoSubject.value;
    const BingoWithWin: Bingo = {
      id: bingo.id,
      raceId: bingo.raceId,
      userId: bingo.userId,
      rulesIds: bingo.rulesIds,
      checkedRules: bingo.checkedRules,
      type: bingo.type,
      lastChecked: bingo.lastChecked,
      year: bingo.year,
      refreshNumber: bingo.refreshNumber,
    };
    return this.http
      .put<Bingo>(`${this.apiUrl}/bingos/${bingoId}`, BingoWithWin)
      .pipe(
        tap((updated) => {
          const { win, ...newBingo } = this.activeBingoSubject.value;
          this.activeBingoSubject.next(newBingo);
          const updatedList = this.bingosSubject.value.map((b) =>
            b.id === updated.id ? updated : b,
          );
          this.bingosSubject.next(updatedList);
        }),
      );
  }

  deleteBingo(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/bingos/${id}`).pipe(
      tap(() => {
        const updatedList = this.bingosSubject.value.filter((b) => b.id !== id);
        this.bingosSubject.next(updatedList);
      }),
    );
  }

  // Rules
  loadRules() {
    this.http.get<Rule[]>(`${this.apiUrl}/rules`).subscribe((data) => {
      this.rulesSubject.next(data);
    });
  }

  getRulesForBingo(ids: string[]): Observable<Rule[]> {
    return this.http.get<Rule[]>(`${this.apiUrl}/rules`).pipe(
      map((items) => {
        const filteredItems = items.filter((item) => ids.includes(item.id));
        return filteredItems.sort(
          (a, b) => ids.indexOf(a.id) - ids.indexOf(b.id),
        );
      }),
    );
  }

  addRule(rule: Partial<Rule>): Observable<Rule> {
    const id = this.generateRandomId();
    const newRule = { ...rule, id };
    return this.http.post<Rule>(`${this.apiUrl}/rules`, newRule).pipe(
      tap((data) => {
        this.rulesSubject.next([...this.rulesSubject.value, data]);
      }),
    );
  }

  updateRule(rule: Rule): Observable<Rule> {
    return this.http.put<Rule>(`${this.apiUrl}/rules/${rule.id}`, rule).pipe(
      tap((updated) => {
        const updatedList = this.rulesSubject.value.map((r) =>
          r.id === updated.id ? updated : r,
        );
        this.rulesSubject.next(updatedList);
      }),
    );
  }

  deleteRule(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/rules/${id}`).pipe(
      tap(() => {
        const updatedList = this.rulesSubject.value.filter((r) => r.id !== id);
        this.rulesSubject.next(updatedList);
      }),
    );
  }

  addCheckedRule(ruleIndex: number): Observable<Bingo> {
    const { rules, ...bingoPatch } = this.activeBingoSubject.value;
    bingoPatch.lastChecked.push(new Date());
    bingoPatch.checkedRules[ruleIndex] = true;

    return this.http
      .patch<Bingo>(`${this.apiUrl}/bingos/${bingoPatch.id}`, bingoPatch)
      .pipe(
        tap((data) => {
          const bingo = {
            ...this.activeBingoSubject.value,
            checkedRules: data.checkedRules,
          };
          this.activeBingoSubject.next(bingo);
          this.checkIfBingoWin();
        }),
      );
  }

  deleteCheckedRule(ruleIndex: number): Observable<Bingo> {
    const { rules, ...bingoPatch } = this.activeBingoSubject.value;
    bingoPatch.checkedRules[ruleIndex] = false;
    bingoPatch.lastChecked.pop();

    return this.http
      .patch<Bingo>(`${this.apiUrl}/bingos/${bingoPatch.id}`, bingoPatch)
      .pipe(
        tap((data) => {
          const bingo = {
            ...this.activeBingoSubject.value,
            checkedRules: data.checkedRules,
          };
          this.activeBingoSubject.next(bingo);
          this.checkIfBingoWin();
        }),
      );
  }

  // Utils
  getActiveUser(): User | null {
    return this.activeUser;
  }

  selectUser(id: string) {
    const user = this.usersSubject.value.find((u) => u.id === id);
    if (user) this.activeUser = user;
  }

  getBingoForUser() {
    const date = this.getDate();
    const year = date.date.split('-')[0];
    const activeRace = this.isActiveSession();

    console.log('activeRace.round', activeRace);
    if (this.activeUser && activeRace && year) {
      this.getBingosByRaceAndUser(
        this.activeUser.id,
        activeRace.round,
        year,
        'RACE',
      );
    }
  }

  generateBingo(
    userId: string,
    raceId: number,
    year: string,
    type: BingoType,
  ): Observable<Bingo> {
    const simpleRules = this.rulesSubject.value.filter(
      (e) => e.jokerUserId === undefined,
    );
    const jokerRules = this.rulesSubject.value.filter(
      (e) => e.jokerUserId === this.getActiveUser()?.id,
    );

    const bingoRules = this.getRandomizedArray(jokerRules, simpleRules);
    const id = this.generateRandomId();

    const newBingo: Bingo = {
      id,
      raceId,
      userId,
      checkedRules: Array(25).fill(false),
      rulesIds: bingoRules.map((e) => e.id),
      type,
      lastChecked: [],
      year: Number(year),
      refreshNumber: 3,
    };
    console.log('hehehehe', newBingo);

    return this.addBingo(newBingo).pipe(
      tap((data) => {
        const newBingoWithRules = { ...newBingo, rules: bingoRules };
        this.activeBingoSubject.next(newBingoWithRules);
      }),
    );
  }

  getRandomizedArray(arrayOne: Rule[], arrayTwo: Rule[]): Rule[] {
    let shuffledOne: Rule[] = [];
    if (arrayOne.length) {
      shuffledOne = [...arrayOne].sort(() => 0.5 - Math.random()).slice(0, 5);
    }

    const ArrayTwoCount = 25 - shuffledOne.length;

    if (arrayTwo.length < 20) {
      throw new Error('arrayTwo must contain at least 20 items.');
    }

    const shuffledArrayTwo = [...arrayTwo].sort(() => Math.random() - 0.5);
    const selectedFromArrayTwo = shuffledArrayTwo.slice(0, ArrayTwoCount);

    return [...shuffledOne, ...selectedFromArrayTwo].sort(
      () => Math.random() - 0.5,
    );
  }

  getDate(): { date: string; time: string } {
    const now = new Date();
    const gmtPlus2 = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    const year = gmtPlus2.getUTCFullYear();
    const month = String(gmtPlus2.getUTCMonth() + 1).padStart(2, '0');
    const day = String(gmtPlus2.getUTCDate()).padStart(2, '0');

    const hours = String(gmtPlus2.getUTCHours()).padStart(2, '0');
    const minutes = String(gmtPlus2.getUTCMinutes()).padStart(2, '0');
    const seconds = String(gmtPlus2.getUTCSeconds()).padStart(2, '0');

    return {
      date: `${year}-${month}-${day}`,
      time: `${hours}:${minutes}:${seconds}`,
    };
  }

  isActiveSession() {
    const races = this.racesSubject.value;
    const race = races.find((r) => this.isFourDaysAwayFromToday(r.sessions.gp));

    // console.log('race', race);
    if (race) return race;
    return null;
  }

  isFourDaysAwayFromToday(dateString: string): boolean {
    const MS_PER_DAY = 1000 * 60 * 60 * 24;

    const targetDate = new Date(dateString);
    const today = new Date();

    const targetMidnight = new Date(
      targetDate.getFullYear(),
      targetDate.getMonth(),
      targetDate.getDate(),
    );
    const todayMidnight = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );

    const diffDays =
      (targetMidnight.getTime() - todayMidnight.getTime()) / MS_PER_DAY;

    return diffDays <= 4 && diffDays >= 0;
  }

  isBeforeToday(date: string | Date): boolean {
    const givenDate = new Date(date);
    const today = new Date();

    givenDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    return givenDate < today;
  }

  isBeforeOrToday(date: string | Date): boolean {
    const givenDate = new Date(date);
    const today = new Date();

    givenDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    return givenDate <= today;
  }

  checkIfBingoWin() {
    const ok = this.hasTrueLine(this.activeBingoSubject.value.checkedRules);
    if (ok && !this.activeBingoSubject.value.win) {
      this.setBingoToWin(this.activeBingoSubject.value.id!).subscribe(
        (b) => {},
      );
    } else if (!ok && this.activeBingoSubject.value.win) {
      this.setBingoToNotWin(this.activeBingoSubject.value.id!).subscribe(
        (b) => {},
      );
    }
  }

  hasTrueLine(matrix: boolean[]): boolean {
    if (matrix.length !== 25) {
      throw new Error('Matrix must be 5x5 (25 elements)');
    }

    for (let row = 0; row < 5; row++) {
      const start = row * 5;
      if (matrix.slice(start, start + 5).every(Boolean)) {
        return true;
      }
    }

    for (let col = 0; col < 5; col++) {
      if ([0, 1, 2, 3, 4].every((row) => matrix[row * 5 + col])) {
        return true;
      }
    }
    return false;
  }

  checkImage(url: string): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  }

  getWinnersForHomeCard(round: number): User[] {
    if (!round) return [];

    // Filter bingos for this round
    const filteredBingos = this.bingosSubject.value.filter(
      (b) => b.raceId === round,
    );

    // Map to users who actually have a bingo in this round
    const usersWithBingo = filteredBingos
      .map((bingo) =>
        this.usersSubject.value.find((u) => u.id === bingo.userId),
      )
      .filter((u): u is User => u !== undefined); // remove undefined

    // Sort winners first (earliest win), then non-winners by checked rules
    usersWithBingo.sort((a, b) => {
      const bingoA = filteredBingos.find((bingo) => bingo.userId === a.id);
      const bingoB = filteredBingos.find((bingo) => bingo.userId === b.id);

      const winA = bingoA?.win ? new Date(bingoA.win).getTime() : null;
      const winB = bingoB?.win ? new Date(bingoB.win).getTime() : null;

      // Winner vs non-winner
      if (winA && !winB) return -1;
      if (!winA && winB) return 1;

      // Both winners → earliest win first
      if (winA && winB) return winA - winB;

      // Both non-winners → most checked rules first
      const checkedA = bingoA?.checkedRules.filter(Boolean).length ?? 0;
      const checkedB = bingoB?.checkedRules.filter(Boolean).length ?? 0;

      return checkedB - checkedA;
    });

    return usersWithBingo;
  }

  sortByDateDescending(items: any[], dateKey: string): any[] {
    return items.sort((a, b) => {
      const dateA = new Date(a[dateKey]).getTime();
      const dateB = new Date(b[dateKey]).getTime();
      return dateA - dateB;
    });
  }

  calculateWinners() {}

  replaceRuleInSelected(ruleIdToReplace: string): Rule {
    console.log('replaceRuleInSelected', ruleIdToReplace);
    const rules = this.rulesSubject.value || [];
    const selectedRules = this.activeBingoSubject.value.rules || [];
    const index = selectedRules.findIndex(
      (rule) => rule.id === ruleIdToReplace,
    );

    const usedIds = new Set(
      selectedRules.filter((_, idx) => idx !== index).map((rule) => rule.id),
    );
    const candidates = rules.filter((rule) => !usedIds.has(rule.id));
    const availableCandidates = candidates.filter(
      (rule) => rule.id !== ruleIdToReplace,
    );

    const replacement =
      availableCandidates[
        Math.floor(Math.random() * availableCandidates.length)
      ];

    const ruleIds = selectedRules
      .map((rule) => rule.id)
      .map((id) => {
        if (id === ruleIdToReplace) {
          return replacement.id;
        }
        return id;
      });

    const newSelected = [...selectedRules];
    newSelected[index] = replacement;

    const newBingo = {
      id: this.activeBingoSubject.value.id,
      raceId: this.activeBingoSubject.value.raceId,
      userId: this.activeBingoSubject.value.userId,
      checkedRules: this.activeBingoSubject.value.checkedRules,
      rulesIds: ruleIds,
      type: this.activeBingoSubject.value.type,
      lastChecked: this.activeBingoSubject.value.lastChecked,
      year: this.activeBingoSubject.value.year,
      win: this.activeBingoSubject.value.win,
      refreshNumber: this.activeBingoSubject.value.refreshNumber - 1,
    };
    this.updateBingo(newBingo).subscribe((updatedBingo) => {
      const newBingoWithRules: BingoWithRules = {
        ...updatedBingo,
        rules: newSelected,
      };
      this.activeBingoSubject.next(newBingoWithRules);
    });

    return replacement;
  }
}
