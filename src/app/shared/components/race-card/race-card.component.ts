import { race } from 'rxjs';
import { Component, Input } from '@angular/core';
import { Race } from '../../models/race.type';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-race-card',
  imports: [CommonModule],
  templateUrl: './race-card.component.html',
  styleUrl: './race-card.component.scss',
})
export class RaceCardComponent {
  @Input() race?: Race;
  @Input() active: boolean = false;

  extractDateParts(dateStr: string): { monthAbbr: string; day: string } {
    const date = new Date(dateStr);

    const monthAbbr = date.toLocaleString('en-US', { month: 'short' }); // e.g., "Apr"
    const day = String(date.getDate()).padStart(2, '0'); // "04" instead of 4

    return { monthAbbr, day };
  }

  capitalizeFirstLetter(str: string): string {
  return str
    .replace(/-/g, ' ') // Replace hyphens with spaces
    .split(' ')         // Split into words
    .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize first letter
    .join(' ');         // Join back into a string
}
}
