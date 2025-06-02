import { Component, OnInit } from '@angular/core';
import { BingoService } from '../../services/bingo/bingo.service';
import { BingoWithRules, CheckedRule, Rule } from '../../models/bingo.type';
import { CommonModule } from '@angular/common';
import { Observable, tap } from 'rxjs';

@Component({
  selector: 'app-bingo-game',
  imports: [CommonModule],
  templateUrl: './bingo-game.component.html',
  styleUrl: './bingo-game.component.scss',
})
export class BingoGameComponent implements OnInit {
  rules: Rule[] = [];
  activeBingo?: BingoWithRules;
  checkedRules$?: Observable<CheckedRule[]>;
  bingo$?: Observable<BingoWithRules>;
  constructor(private service: BingoService) {}

  ngOnInit(): void {
    this.service.getBingoForUser();
    this.bingo$ = this.service.activeBingo$;
    this.checkedRules$ = this.service.checkedRules$;
    this.bingo$.subscribe((e) => {
      this.activeBingo = e;
    });
    this.checkedRules$.subscribe();
  }

  isRuleChecked(ruleId: string): boolean {
    const checked = this.activeBingo?.checkedRules?.find(
      (e) => e.ruleId === ruleId
    );
    if (checked) return true;
    return false;
  }

  addCheck(rule: Rule) {
    const check = this.service.addCheckedRule(rule.id).subscribe();
  }


}
