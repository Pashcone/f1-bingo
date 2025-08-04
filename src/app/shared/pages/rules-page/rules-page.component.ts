import { Component } from '@angular/core';
import { BingoService } from '../../services/bingo/bingo.service';
import { User } from '../../models/user.type';
import { Router, RouterModule } from '@angular/router';
import { Rule } from '../../models/bingo.type';
import { RuleFormComponent } from "../../components/rule-form/rule-form.component";

@Component({
  selector: 'app-rules-page',
  imports: [RouterModule, RuleFormComponent, RuleFormComponent],
  templateUrl: './rules-page.component.html',
  styleUrl: './rules-page.component.scss',
})
export class RulesPageComponent {
  isRegister = false;
  activeUser: User | null = null;
  rules: Rule[] = [];

  constructor(private service: BingoService, private router: Router) {
    this.service.rules$.subscribe((rules) => {
      this.rules = rules;
    });
    this.activeUser = this.service.getActiveUser();
  }

  selectUser(user: string) {
    this.service.selectUser(user);
    this.router.navigate(['/']);
  }

  register() {
    this.isRegister = !this.isRegister;
  }

  getRuleCount(){
    return this.rules.filter(r => !r.jokerUserId).length;
  }
}
