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

  private usersSubject = new BehaviorSubject<User[]>([]);
  private racesSubject = new BehaviorSubject<Race[]>([]);
  private bingosSubject = new BehaviorSubject<Bingo[]>([]);
  private rulesSubject = new BehaviorSubject<Rule[]>([]);
  private checkedRulesSubject = new BehaviorSubject<CheckedRule[]>([]);
  private activeBingoSubject = new BehaviorSubject<BingoWithRules>(
    {} as BingoWithRules
  );

  users$ = this.usersSubject.asObservable();
  races$ = this.racesSubject.asObservable();
  bingos$ = this.bingosSubject.asObservable();
  rules$ = this.rulesSubject.asObservable();
  checkedRules$ = this.checkedRulesSubject.asObservable();
  activeBingo$ = this.activeBingoSubject.asObservable();

  activeSession: Race | null = null;
  activeUser: User | null = null;

  loadAllData() {
    this.loadUsers();
    this.loadRaces();
    this.loadBingos();
    this.loadRules();
  }

  // Users
  loadUsers() {
    this.http.get<User[]>(`${this.apiUrl}/users`).subscribe((data) => {
      this.usersSubject.next(data);
    });
  }

  addUser(user: string): Observable<User> {
    const newId = this.generateRandomId();
    const newUser = { name: user, id: newId, wins: [], jokerRulesIds: [] };
    return this.http.post<User>(`${this.apiUrl}/users`, newUser).pipe(
      tap((data) => {
        this.usersSubject.next([...this.usersSubject.value, data]);
      })
    );
  }

  updateUser(user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/users/${user.id}`, user).pipe(
      tap((updated) => {
        const updatedList = this.usersSubject.value.map((u) =>
          u.id === updated.id ? updated : u
        );
        this.usersSubject.next(updatedList);
      })
    );
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${id}`).pipe(
      tap(() => {
        const updatedList = this.usersSubject.value.filter((u) => u.id !== id);
        this.usersSubject.next(updatedList);
      })
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
      })
    );
  }

  updateRace(race: Race): Observable<Race> {
    return this.http.put<Race>(`${this.apiUrl}/races/${race.id}`, race).pipe(
      tap((updated) => {
        const updatedList = this.racesSubject.value.map((r) =>
          r.id === updated.id ? updated : r
        );
        this.racesSubject.next(updatedList);
      })
    );
  }

  deleteRace(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/races/${id}`).pipe(
      tap(() => {
        const updatedList = this.racesSubject.value.filter((r) => r.id !== id);
        this.racesSubject.next(updatedList);
      })
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
    type: BingoType
  ): void {
    this.http
      .get<Bingo[]>(
        `${this.apiUrl}/bingos?year=${year}&userId=${userId}&raceId=${raceId}&type=${type}`
      )
      .pipe(
        tap((data) => {
          if (data.length) {
            this.activeBingoSubject.next(data[0]);
            this.getRulesForBingo(
              this.activeBingoSubject.value.rulesIds
            ).subscribe((e: Rule[]) => {
              const bingo = { ...this.activeBingoSubject.value, rules: e };
              this.activeBingoSubject.next(bingo);
            });
            this.loadCheckedRules(this.activeBingoSubject.value.id!).subscribe(
              (e: CheckedRule[]) => {
                const bingo = {
                  ...this.activeBingoSubject.value,
                  checkedRules: e,
                };
                this.activeBingoSubject.next(bingo);
              }
            );
          } else {
            this.generateBingo(userId, raceId, year, type).subscribe();
          }
        })
      )
      .subscribe((e) =>
        console.log('this.activeBingoSubject', this.activeBingoSubject.value)
      );
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
            b.id === updated.id ? updated : b
          );
          this.bingosSubject.next(updatedList);
        })
      );
  }

  setBingoToWin(bingoId: string): Observable<Bingo> {
    const bingo = this.activeBingoSubject.value;
    const BingoWithWin = {
      id: bingo.id,
      raceId: bingo.raceId,
      userId: bingo.userId,
      rulesIds: bingo.rulesIds,
      type: bingo.type,
      year: bingo.year,
      win: true,
    };
    return this.http
      .put<Bingo>(`${this.apiUrl}/bingos/${bingoId}`, BingoWithWin)
      .pipe(
        tap((updated) => {
          console.log('updated bingo', updated);
          const updatedList = this.bingosSubject.value.map((b) =>
            b.id === updated.id ? updated : b
          );
          this.bingosSubject.next(updatedList);
        })
      );
  }

  deleteBingo(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/bingos/${id}`).pipe(
      tap(() => {
        const updatedList = this.bingosSubject.value.filter((b) => b.id !== id);
        this.bingosSubject.next(updatedList);
      })
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
          (a, b) => ids.indexOf(a.id) - ids.indexOf(b.id)
        );
      })
    );
  }

  addRule(rule: Partial<Rule>): Observable<Rule> {
    const id = this.generateRandomId();
    const newRule = { ...rule, id };
    return this.http.post<Rule>(`${this.apiUrl}/rules`, newRule).pipe(
      tap((data) => {
        this.rulesSubject.next([...this.rulesSubject.value, data]);
      })
    );
  }

  updateRule(rule: Rule): Observable<Rule> {
    return this.http.put<Rule>(`${this.apiUrl}/rules/${rule.id}`, rule).pipe(
      tap((updated) => {
        const updatedList = this.rulesSubject.value.map((r) =>
          r.id === updated.id ? updated : r
        );
        this.rulesSubject.next(updatedList);
      })
    );
  }

  deleteRule(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/rules/${id}`).pipe(
      tap(() => {
        const updatedList = this.rulesSubject.value.filter((r) => r.id !== id);
        this.rulesSubject.next(updatedList);
      })
    );
  }

  // Checked Rules
  loadCheckedRules(bingoId: string): Observable<CheckedRule[]> {
    return this.http.get<CheckedRule[]>(`${this.apiUrl}/checkedRules`).pipe(
      tap((data) => {
        this.checkedRulesSubject.next(data);
      })
    );
  }

  addCheckedRule(ruleId: string): Observable<CheckedRule> {
    const newCheckedRule: CheckedRule = {
      id: this.generateRandomId(),
      ruleId: ruleId,
      bingoId: this.activeBingoSubject.value.id!,
    };

    return this.http
      .post<CheckedRule>(`${this.apiUrl}/checkedRules`, newCheckedRule)
      .pipe(
        tap((data) => {
          const checkedRules = this.checkedRulesSubject.value;
          this.checkedRulesSubject.next([...checkedRules, data]);
          const bingo = this.activeBingoSubject.value;
          this.activeBingoSubject.next({
            ...bingo,
            checkedRules: this.checkedRulesSubject.value,
          });

          const index = this.activeBingoSubject.value.rules?.findIndex(
            (e) => e.id === ruleId
          );
          console.log('index', index);
          if (
            index !== undefined &&
            index !== -1 &&
            this.activeBingoSubject.value.rules
          ) {
            this.isRowOrColumnChecked(
              this.activeBingoSubject.value.rules,
              index
            );
          }
        })
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
    console.log('activeRace', activeRace);

    console.log(this.activeUser, activeRace, year);
    if (this.activeUser && activeRace && year) {
      this.getBingosByRaceAndUser(
        this.activeUser.id,
        activeRace.id,
        year,
        'RACE'
      );
    }
  }

  generateBingo(
    userId: string,
    raceId: number,
    year: string,
    type: BingoType
  ): Observable<Bingo> {
    const simpleRules = this.rulesSubject.value.filter(
      (e) => e.jokerUserId === undefined
    );
    const jokerRules = this.rulesSubject.value.filter(
      (e) => e.jokerUserId === this.getActiveUser()?.id
    );

    const bingoRules = this.getRandomizedArray(jokerRules, simpleRules);
    const id = this.generateRandomId();

    const newBingo: Bingo = {
      id,
      raceId,
      userId,
      rulesIds: bingoRules.map((e) => e.id),
      type,
      year: Number(year),
    };

    return this.addBingo(newBingo).pipe(
      tap((data) => {
        const newBingoWithRules = { ...newBingo, rules: bingoRules };
        console.log('newBingoWithRules', newBingoWithRules);
        this.activeBingoSubject.next(newBingoWithRules);
      })
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

    console.log(
      'shuffledOne',
      shuffledOne,
      [...shuffledOne, ...selectedFromArrayTwo].sort(() => Math.random() - 0.5)
    );

    return [...shuffledOne, ...selectedFromArrayTwo].sort(
      () => Math.random() - 0.5
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
    const race = races.find((r) => this.isFourDaysAwayFromToday(r.date));
    console.log('isActiveSession', race);
    return race;
  }

  isFourDaysAwayFromToday(dateString: string): boolean {
    console.log('dateString', dateString);
    const MS_PER_DAY = 1000 * 60 * 60 * 24;

    const targetDate = new Date(dateString);
    const today = new Date();

    const targetMidnight = new Date(
      targetDate.getFullYear(),
      targetDate.getMonth(),
      targetDate.getDate()
    );
    const todayMidnight = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    const diffDays =
      (targetMidnight.getTime() - todayMidnight.getTime()) / MS_PER_DAY;

    console.log('diffDays', diffDays, diffDays <= 4 && diffDays >= 0);
    return diffDays <= 4 && diffDays >= 0;
  }

  isRuleChecked(ruleId: string): boolean {
    const checked = this.activeBingoSubject.value.checkedRules?.find(
      (e) => e.ruleId === ruleId
    );
    return !!checked;
  }

  isRowOrColumnChecked(rules: Rule[], index: number): boolean {
    if (rules.length !== 25) {
      throw new Error('Array must contain exactly 25 elements.');
    }

    const row = Math.floor(index / 5);
    const col = index % 5;

    // Check row
    let rowChecked = true;
    for (let i = 0; i < 5; i++) {
      if (!this.isRuleChecked(rules[row * 5 + i].id)) {
        rowChecked = false;
        break;
      }
    }

    // Check column
    let colChecked = true;
    for (let i = 0; i < 5; i++) {
      if (!this.isRuleChecked(rules[i * 5 + col].id)) {
        colChecked = false;
        break;
      }
    }
    if (rowChecked || colChecked) {
      this.setBingoToWin(this.activeBingoSubject.value.id!).subscribe();
      this.activeBingoSubject.next({
        ...this.activeBingoSubject.value,
        win: true,
      });
    }
    return rowChecked || colChecked;
  }
}
