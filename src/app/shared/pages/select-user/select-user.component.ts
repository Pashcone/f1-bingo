import { Component } from '@angular/core';
import { BingoService } from '../../services/bingo/bingo.service';
import { User } from '../../models/user.type';
import { Router } from '@angular/router';
import { UserFormComponent } from '../../components/user-form/user-form.component';

@Component({
  selector: 'app-select-user',
  imports: [UserFormComponent],
  templateUrl: './select-user.component.html',
  styleUrl: './select-user.component.scss',
})
export class SelectUserComponent {
  isRegister = false;
  users: User[] = [];

  constructor(private service: BingoService, private router: Router) {
    this.service.users$.subscribe((users) => {
      this.users = users;
      this.selectUser(this.users[0]?.id);
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
