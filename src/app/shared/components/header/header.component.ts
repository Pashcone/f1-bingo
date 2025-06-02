import { Component } from '@angular/core';
import { BingoService } from '../../services/bingo/bingo.service';
import { Router } from '@angular/router';
import { BingoGameComponent } from '../bingo-game/bingo-game.component';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  activeUserName: string = 'Hello';
  constructor(private service: BingoService, private router: Router) {
    this.activeUserName = this.service.getActiveUser()!.name;
  }

  redirect() {
    this.router.navigate(['bingo']);
    // this.service.generateBingo();
  }

}
