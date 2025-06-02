import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { BingoService } from '../../services/bingo/bingo.service';

@Injectable({
  providedIn: 'root',
})
export class UserSelectedGuard implements CanActivate {
  constructor(private service: BingoService, private router: Router) {}

  canActivate(): boolean {
    const user = this.service.getActiveUser();

    console.log(user);
    if (user) {
      return true;
    } else {
      this.router.navigate(['/select-user']);
      return false;
    }
  }
}
