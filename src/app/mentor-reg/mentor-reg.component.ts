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

  // ✅ Expose getters so template can use firstName.invalid, etc.
  get firstName() { return this.form.get('firstName') as FormControl; }
  get lastName() { return this.form.get('lastName') as FormControl; }
  get email() { return this.form.get('email') as FormControl; }
  get country() { return this.form.get('country') as FormControl; }
  get phone() { return this.form.get('phone') as FormControl; }
  get password() { return this.form.get('password') as FormControl; }
  get postalCode() { return this.form.get('postalCode') as FormControl; }
  get accept() { return this.form.get('accept') as FormControl; }

  // ✅ Signup action
  async onSubmit() {
    if (this.form.invalid) {
      this.error = 'Please fix the errors in the form.';
      this.success = '';
      this.form.markAllAsTouched();
      return;
    }
  
    const { email, password } = this.form.value;
  
    try {
      const { user, error } = await this.authService.register(email, password, 'mentor');
      if (error) {
        this.error = error.message || 'Signup failed';
        this.success = '';
      } else {
        this.success = '✅ Signup successful! Check your email for verification.';
        this.error = '';
        alert(this.success); // optional popup
        console.log('Signup success:', user);
      }
    } catch (err) {
      console.error(err);
      this.error = 'Something went wrong. Try again.';
      this.success = '';
    }
  }  

  // ✅ Mark field as touched when user types (for validation feedback)
  onInput(controlName: string) {
    const control = this.form.get(controlName);
    if (control) {
      control.markAsTouched();
    }
  }
}
