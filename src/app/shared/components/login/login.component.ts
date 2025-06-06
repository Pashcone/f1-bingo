import { Component } from '@angular/core';
import { User } from '../../models/user.type';
import { Router } from '@angular/router';
import { BingoService } from '../../services/bingo/bingo.service';

@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
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
    console.log('Register clicked');
    this.router.navigate(['select-user/register']);
  }
}
