import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BingoService } from '../../services/bingo/bingo.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
userForm: FormGroup;
  @Input() isEdit: boolean = false;

  constructor(
    private fb: FormBuilder,
    private service: BingoService,
    private router: Router
  ) {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      imagePath: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.userForm.valid) {
      console.log('Form Submitted:', this.userForm.value);
    } else {
      console.log('Form Invalid');
    }
    const newUserName = this.userForm.get('name')?.value;
    const newUserImagePath = this.userForm.get('imagePath')?.value;

    this.service.addUser(newUserName, newUserImagePath).subscribe();
    this.router.navigate(['/select-user/login']);
  }
}
