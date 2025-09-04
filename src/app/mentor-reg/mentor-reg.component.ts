import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-mentor-reg',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './mentor-reg.component.html',
  styleUrls: ['./mentor-reg.component.css']
})
export class MentorRegComponent implements OnInit {
  form!: FormGroup;
  error: string = '';
  success: string = '';

  constructor(private authService: AuthService) {}

  countries: string[] = [
    'India', 'United States', 'United Kingdom', 'Canada', 'Australia',
    'Germany', 'France', 'Japan', 'Singapore', 'Brazil'
    // ℹ️ trim your big list for now if you want smaller bundle on Vercel
  ];

  ngOnInit() {
    this.form = new FormGroup({
      firstName: new FormControl('', [
        Validators.required,
        Validators.minLength(2),
        Validators.pattern(/^[a-zA-Z ]+$/)
      ]),
      lastName: new FormControl('', [
        Validators.required,
        Validators.minLength(2),
        Validators.pattern(/^[a-zA-Z ]+$/)
      ]),
      email: new FormControl('', [Validators.required, Validators.email]),
      country: new FormControl('India', [Validators.required]),
      phone: new FormControl('', [
        Validators.required,
        Validators.pattern(/^\d{10}$/)
      ]),
      password: new FormControl('', [
        Validators.required,
        Validators.pattern(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/
        )
      ]),
      postalCode: new FormControl('', [
        Validators.required,
        Validators.pattern(/^\d{6}$/)
      ]),
      accept: new FormControl(false, [Validators.requiredTrue])
    });
  }

  // ✅ Signup
  async onSubmit() {
    if (this.form.invalid) {
      this.error = 'Please fix the errors in the form.';
      return;
    }

    const { email, password } = this.form.value;
    const { user, error } = await this.authService.register(email, password);

    if (error) {
      this.error = error.message || 'Signup failed';
      this.success = '';
    } else {
      this.success = 'Signup successful! 🎉 Check your email for verification.';
      this.error = '';
      console.log('Signup success:', user);
    }
  }

  // ✅ Helper for input highlighting
  onInput(controlName: string) {
    const control = this.form.get(controlName);
    if (control) {
      control.markAsTouched();
    }
  }
}
