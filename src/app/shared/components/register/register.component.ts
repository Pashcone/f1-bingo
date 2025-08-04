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
shownImagePath: string = 'https://i.pinimg.com/736x/8f/3e/21/8f3e21eb5b4c29cdf845378cbbe90f12.jpg';
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

  onImageChange() {
      this.service.checkImage(this.userForm.get('imagePath')?.value).then((exists) => {
            if (!exists) {
              this.shownImagePath = 'https://i.pinimg.com/736x/8f/3e/21/8f3e21eb5b4c29cdf845378cbbe90f12.jpg'; // Default image if the URL is invalid
            }
            else {
              this.shownImagePath = this.userForm.get('imagePath')?.value;
            }
          });
    this.shownImagePath = this.userForm.get('imagePath')?.value || 'https://i.pinimg.com/736x/8f/3e/21/8f3e21eb5b4c29cdf845378cbbe90f12.jpg';
  }

  onSubmit() {
    const newUserName = this.userForm.get('name')?.value;
    const newUserImagePath = this.userForm.get('imagePath')?.value;

    this.service.addUser(newUserName, newUserImagePath).subscribe();
    this.router.navigate(['/select-user/login']);
  }
}
