import { Component, OnInit } from '@angular/core';
import { SelectUserComponent } from '../../shared/pages/select-user/select-user.component';
import { BingoService } from '../../shared/services/bingo/bingo.service';

@Component({
  selector: 'app-auth-layout',
  imports: [SelectUserComponent],
  templateUrl: './auth-layout.component.html',
  styleUrl: './auth-layout.component.scss',
})
export class AuthLayoutComponent implements OnInit {
  constructor(private service: BingoService) {}
  ngOnInit(): void {
    this.service.loadUsers();
  }
}
