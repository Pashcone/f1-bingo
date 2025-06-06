import { Component } from '@angular/core';
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
  constructor(private service: BingoService, private router: Router) {
    this.activeUser = this.service.getActiveUser()!;
  }

  redirect() {
    this.router.navigate(['bingo']);
  }

}
