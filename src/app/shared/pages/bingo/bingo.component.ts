import { Component } from '@angular/core';
import { BingoGameComponent } from '../../components/bingo-game/bingo-game.component';
import { CheckedRule, Rule } from '../../models/bingo.type';
import { BingoService } from '../../services/bingo/bingo.service';

@Component({
  selector: 'app-bingo',
  imports: [BingoGameComponent],
  templateUrl: './bingo.component.html',
  styleUrl: './bingo.component.scss',
})
export class BingoComponent {
  ruleMatrix: Rule[] = [];
  checkMatrix: CheckedRule[] = [];

  constructor(private service: BingoService) {}
}
