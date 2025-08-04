import { Component } from '@angular/core';
import { User } from '../../models/user.type';
import { Router } from '@angular/router';
import { BingoService } from '../../services/bingo/bingo.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  isRegister = false;
  users: User[] = [];

  text: string = 'Jofi is the best!';
  buttonApasat: boolean = false;

  constructor(private service: BingoService, private router: Router) {
    this.service.users$.subscribe((users) => {
      this.users = users;
      this.users.forEach((user) => {
        if (user.imagePath) {
          this.service.checkImage(user.imagePath).then((exists) => {
            if (!exists) {
              user.imagePath = 'https://i.pinimg.com/736x/8f/3e/21/8f3e21eb5b4c29cdf845378cbbe90f12.jpg'; // Default image if the URL is invalid
            }
          });
        }
      });
    });
  }

  selectUser(user: string) {
    this.service.selectUser(user);
    this.router.navigate(['/']);
  }

  register() {
    this.router.navigate(['select-user/register']);
  }
}
