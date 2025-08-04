import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
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
export class BingoGameComponent implements OnInit, OnChanges {
  rules: Rule[] = [];
  activeBingo?: BingoWithRules;
  checkedRules$?: Observable<CheckedRule[]>;
  bingo$?: Observable<BingoWithRules>;
  activeRule: Rule = {} as Rule;
  activeIndex: number = -1;
  constructor(private service: BingoService) {}

  ngOnInit(): void {
    this.service.getBingoForUser();
    this.bingo$ = this.service.activeBingo$;
    this.bingo$.subscribe((e) => {
      this.activeBingo = e;
      console.log('activeBingo', e.rulesIds[0]);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    // if(changes){
    //   this.activeRule = changes['activeRule']?.currentValue || {} as Rule;
    // }
    // this.service.getBingoForUser().pipe(
    //   tap((bingo) => {
    //     this.activeRule = this.activeBingo?.rules
    //   })
    // )
  }

  isRuleChecked(index: number): boolean {
    if(this.activeBingo?.checkedRules[index]) return true;
    return false;
  }

  addCheck(ruleIndex: number) {
    this.activeRule = this.activeBingo!.rules![ruleIndex]
    this.activeIndex = ruleIndex;
  }

  checkRule() {
    this.service.addCheckedRule(this.activeIndex).subscribe();
  }

  unCheckRule() {
    this.service.deleteCheckedRule(this.activeIndex).subscribe();
  }

  closeDialog(){
    this.activeRule = {} as Rule;
    this.activeIndex = -1;
  }

  changeRule() {
    this.activeRule = this.service.replaceRuleInSelected(this.activeRule.id)

  }

}
