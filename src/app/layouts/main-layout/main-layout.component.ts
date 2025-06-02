import { Component, input, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { BingoService } from '../../shared/services/bingo/bingo.service';

@Component({
  selector: 'app-main-layout',
  imports: [RouterModule, HeaderComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent implements OnInit {
  constructor(private service: BingoService) {}

  ngOnInit(): void {
    this.service.loadAllData();
  }
}
