import { Component, Input, input } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { BingoService } from '../../services/bingo/bingo.service';

@Component({
  selector: 'app-rule-form',
  imports: [ReactiveFormsModule],
  templateUrl: './rule-form.component.html',
  styleUrl: './rule-form.component.scss',
})
export class RuleFormComponent {
  ruleForm: FormGroup;
  @Input() isEdit: boolean = false;

  constructor(private fb: FormBuilder, private service: BingoService) {
    this.ruleForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', [Validators.required]],
      isJoker: [false],
    });
  }

  onSubmit() {
    if (this.ruleForm.valid) {
      console.log('Form Submitted:', this.ruleForm.value);
    } else {
      console.log('Form Invalid');
    }
    console.log(this.ruleForm.get('name')?.value);

    const newRule = {
      id: this.service.generateRandomId(),
      name: this.ruleForm.get('name')?.value,
      description: this.ruleForm.get('description')?.value,
    };

    this.service.addRule(newRule).subscribe();
  }
}
