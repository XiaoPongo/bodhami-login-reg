// src/app/student-reg/student-reg.component.ts
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-student-reg',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './student-reg.component.html',
  styleUrls: ['./student-reg.component.css']
})
export class StudentRegComponent implements OnInit {
  form!: FormGroup;
  error: string = '';
  success: string = '';
  showPassword = false; // Property to track password visibility

  constructor(private authService: AuthService) {}

  countries: string[] = [
    'Afghanistan','Albania','Algeria','Andorra','Angola','Argentina','Australia','Austria',
    'Bangladesh','Belgium','Bhutan','Brazil','Canada','China','Denmark','Egypt','Finland','France',
    'Germany','Greece','Hungary','Iceland','India','Indonesia','Iran','Iraq','Ireland','Israel',
    'Italy','Japan','Kenya','Luxembourg','Malaysia','Mexico','Nepal','Netherlands','New Zealand',
    'Nigeria','Norway','Pakistan','Philippines','Poland','Portugal','Qatar','Russia','Saudi Arabia',
    'Singapore','South Africa','South Korea','Spain','Sri Lanka','Sweden','Switzerland','Thailand',
    'Turkey','UAE','UK','USA','Vietnam','Zimbabwe'
  ];

  ngOnInit() {
    this.form = new FormGroup({
      firstName: new FormControl('', [
        Validators.required, Validators.minLength(2), Validators.pattern(/^[a-zA-Z ]+$/)
      ]),
      lastName: new FormControl('', [
        Validators.required, Validators.minLength(2), Validators.pattern(/^[a-zA-Z ]+$/)
      ]),
      email: new FormControl('', [Validators.required, Validators.email]),
      country: new FormControl('India', [Validators.required]),
      phone: new FormControl('', [
        Validators.required, Validators.pattern(/^\d{10}$/)
      ]),
      password: new FormControl('', [
        Validators.required,
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/)
      ]),
      postalCode: new FormControl('', [
        Validators.required, Validators.pattern(/^\d{6}$/)
      ]),
      accept: new FormControl(false, [Validators.requiredTrue])
    });
  }
  
  // Method to toggle password visibility
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  // ✅ Easy getters
  get firstName() { return this.form.get('firstName') as FormControl; }
  get lastName() { return this.form.get('lastName') as FormControl; }
  get email() { return this.form.get('email') as FormControl; }
  get country() { return this.form.get('country') as FormControl; }
  get phone() { return this.form.get('phone') as FormControl; }
  get password() { return this.form.get('password') as FormControl; }
  get postalCode() { return this.form.get('postalCode') as FormControl; }
  get accept() { return this.form.get('accept') as FormControl; }

  // ✅ Signup logic
  async onSubmit() {
    if (this.form.invalid) return;

    try {
      const { user } = await this.authService.register(
        this.email.value,
        this.password.value,
        {
          role: 'student',
          firstName: this.firstName.value,
          lastName: this.lastName.value,
          country: this.country.value,
          phone: this.phone.value,
          postalCode: this.postalCode.value
        }
      );

      if (user) {
        this.success = 'Registration successful! You can now login.';
        this.error = '';
        this.form.reset();
      }
    } catch (err: any) {
      this.error = err.message || 'Registration failed.';
      this.success = '';
    }
  }

  // ✅ Mark control touched on input
  onInput(controlName: string) {
    const control = this.form.get(controlName);
    if (control) control.markAsTouched();
  }
}
