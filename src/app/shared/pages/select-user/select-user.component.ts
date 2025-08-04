import { Component } from '@angular/core';
import { BingoService } from '../../services/bingo/bingo.service';
import { User } from '../../models/user.type';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-select-user',
  imports: [RouterModule],
  templateUrl: './select-user.component.html',
  styleUrl: './select-user.component.scss',
})
export class SelectUserComponent {
  isRegister = false;
  users: User[] = [];

  constructor(private service: BingoService, private router: Router) {
    this.service.users$.subscribe((users) => {
      this.users = users;
    });
  }

  selectUser(user: string) {
    this.service.selectUser(user);
    this.router.navigate(['/']);
  }

  register() {
    this.isRegister = !this.isRegister;
  }
}
