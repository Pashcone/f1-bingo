import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RuleFormComponent } from '../../components/rule-form/rule-form.component';
import { BingoService } from '../../services/bingo/bingo.service';
import { Bingo, Rule } from '../../models/bingo.type';
import { UserFormComponent } from '../../components/user-form/user-form.component';
import { Race } from '../../models/race.type';
import { User } from '../../models/user.type';
import { BingoGameComponent } from '../../components/bingo-game/bingo-game.component';

@Component({
  selector: 'app-home',
  imports: [RouterModule, CommonModule],
  providers: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  constructor(private service: BingoService) {}

  users: User[] = [];
  rules: Rule[] = [];
  races: Race[] = [];
  bingos: Bingo[] = [];

  ngOnInit(): void {
    this.service.users$.subscribe((user: User[]) => {
      this.users = user;
    });

    this.service.rules$.subscribe((rules: Rule[]) => {
      this.rules = rules;
    });

    this.service.races$.subscribe((races: Race[]) => {
      this.races = races;
    });

    this.service.bingos$.subscribe((bingos: Bingo[]) => {
      this.bingos = bingos;
    });
  }

  capitalizeFirstLetter(arr: string) {
    return arr[0].toUpperCase() + arr.slice(1);
  }

  getCSF() {
    this.service.getBingoForUser();
  }

  extractDateParts(dateStr: string): { monthAbbr: string, day: number } {
  const date = new Date(dateStr);

  const monthAbbr = date.toLocaleString('en-US', { month: 'short' }); // "Feb"
  const day = date.getDate(); // 22

  return { monthAbbr, day };
}
}
