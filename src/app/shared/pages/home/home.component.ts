import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BingoService } from '../../services/bingo/bingo.service';
import { Bingo, Rule } from '../../models/bingo.type';
import { Race } from '../../models/race.type';
import { User } from '../../models/user.type';
import { RaceCardComponent } from "../../components/race-card/race-card.component";

@Component({
  selector: 'app-home',
  imports: [RouterModule, CommonModule, RaceCardComponent],
  providers: [RaceCardComponent],
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

 extractDateParts(dateStr: string): { monthAbbr: string, day: string } {
  const date = new Date(dateStr);

  const monthAbbr = date.toLocaleString('en-US', { month: 'short' }); // e.g., "Apr"
  const day = String(date.getDate()).padStart(2, '0'); // "04" instead of 4

  return { monthAbbr, day };
}
}
