import { race } from 'rxjs';
import { Component, Input } from '@angular/core';
import { Race } from '../../models/race.type';
import { CommonModule } from '@angular/common';
import { BingoService } from '../../services/bingo/bingo.service';
import { User } from '../../models/user.type';
import { Router } from '@angular/router';

@Component({
  selector: 'app-race-card',
  imports: [CommonModule],
  templateUrl: './race-card.component.html',
  styleUrl: './race-card.component.scss',
})
export class RaceCardComponent {
  @Input() race?: Race;
  @Input() active: boolean = false;
  @Input() winners: User[] = [];
  users : User[] = [];

  constructor(private service: BingoService, private router: Router) {
  }


  wasActive(): boolean {
    // console.log(this.race?.round)
    // console.log(this.service.isBeforeOrToday(this.race?.sessions.gp!))
    return this.service.isBeforeOrToday(this.race?.sessions.gp!);
  }


  extractDateParts(dateStr: string): { monthAbbr: string; day: string } {
    const date = new Date(dateStr);

    const monthAbbr = date.toLocaleString('en-US', { month: 'short' });
    const day = String(date.getDate()).padStart(2, '0');

    return { monthAbbr, day };
  }

  capitalizeFirstLetter(str: string): string {
    return str
      .replace(/-/g, ' ')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }


  getWinners() : User[] {
    this.users = this.service.getWinnersForHomeCard(this.race?.round || 0)
    // console.log(this.users)
    return this.users
  }

  redirectToBingo(){
    this.router.navigate(['/bingo']);
  }
}
