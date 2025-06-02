import { Component, Input } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { BingoService } from '../../services/bingo/bingo.service';

@Component({
  selector: 'app-user-form',
  imports: [ReactiveFormsModule],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss',
})
export class UserFormComponent {
  userForm: FormGroup;
  @Input() isEdit: boolean = false;

  constructor(private fb: FormBuilder, private service: BingoService) {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.userForm.valid) {
      console.log('Form Submitted:', this.userForm.value);
    } else {
      console.log('Form Invalid');
    }
    const newUser = this.userForm.get('name')?.value;

    this.service.addUser(newUser).subscribe();
  }
}
