import { Component, ElementRef, HostListener } from '@angular/core';
import { BingoService } from '../../services/bingo/bingo.service';
import { Router } from '@angular/router';
import { BingoGameComponent } from '../bingo-game/bingo-game.component';
import { User } from '../../models/user.type';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  activeUser?: User;
  menuOpen = false;
  constructor(private service: BingoService, private router: Router, private eRef: ElementRef) {
    this.activeUser = this.service.getActiveUser()!;
  }

   @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (this.menuOpen && !this.eRef.nativeElement.contains(event.target)) {
      this.menuOpen = false;
    }
  }

  redirect() {
    this.router.navigate(['bingo']);
  }

  redirectToRulesPage() {
    this.router.navigate(['/rules']);
  }

  redirectToHome(){
    this.router.navigate(['/home']);
  }

  redirectToLeaderboardPage() {
    this.router.navigate(['/leaderboard'])
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

}
