import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth.service';  // ✅ import your service

@Component({
  selector: 'app-mentor-reg',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './mentor-reg.component.html',
  styleUrls: ['./mentor-reg.component.css']
})
export class MentorRegComponent implements OnInit {
  form!: FormGroup;

  constructor(private authService: AuthService) {}  // ✅ inject here

  countries: string[] = [/* ... your full list ... */];

  ngOnInit() {
    this.form = new FormGroup({
      firstName: new FormControl('', [Validators.required, Validators.minLength(2), Validators.pattern(/^[a-zA-Z ]+$/)]),
      lastName: new FormControl('', [Validators.required, Validators.minLength(2), Validators.pattern(/^[a-zA-Z ]+$/)]),
      email: new FormControl('', [Validators.required, Validators.email]),
      country: new FormControl('India', [Validators.required]),
      phone: new FormControl('', [Validators.required, Validators.pattern(/^\d{10}$/)]),
      password: new FormControl('', [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/)]),
      postalCode: new FormControl('', [Validators.required, Validators.pattern(/^\d{6}$/)]),
      accept: new FormControl(false, [Validators.requiredTrue])
    });
  }

  async onSubmit() {
    if (this.form.valid) {
      const { email, password } = this.form.value;

      const { user, error } = await this.authService.register(email, password);

      if (error) {
        console.error('Signup failed:', error.message);
      } else {
        console.log('Signup success:', user);
      }
    }
  }

  onInput(controlName: string) {
    const control = this.form.get(controlName);
    if (control) {
      control.markAsTouched();
    }
  }
}
