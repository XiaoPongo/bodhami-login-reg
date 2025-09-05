import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-mentor-reg',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MatSnackBarModule],
  templateUrl: './mentor-reg.component.html',
  styleUrls: ['./mentor-reg.component.css']
})
export class MentorRegComponent implements OnInit {
  form!: FormGroup;

  constructor(private authService: AuthService, private snackBar: MatSnackBar) {}

  countries: string[] = ['India', 'United States', 'United Kingdom', 'Canada', 'Australia'];

  ngOnInit() {
    this.form = new FormGroup({
      firstName: new FormControl('', [Validators.required, Validators.minLength(2), Validators.pattern(/^[a-zA-Z ]+$/)]),
      lastName: new FormControl('', [Validators.required, Validators.minLength(2), Validators.pattern(/^[a-zA-Z ]+$/)]),
      email: new FormControl('', [Validators.required, Validators.email]),
      country: new FormControl('India', [Validators.required]),
      phone: new FormControl('', [Validators.required, Validators.pattern(/^\d{10}$/)]),
      password: new FormControl('', [
        Validators.required,
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/)
      ]),
      postalCode: new FormControl('', [Validators.required, Validators.pattern(/^\d{6}$/)]),
      accept: new FormControl(false, [Validators.requiredTrue])
    });
  }

  async onSubmit() {
    if (this.form.invalid) {
      this.snackBar.open('Please fix the errors in the form.', 'Close', { duration: 4000 });
      return;
    }

    const { email, password } = this.form.value;
    const { user, error } = await this.authService.register(email, password, 'mentor');

    if (error) {
      const msg = error.message.includes('already registered')
        ? 'This email is already registered. Please use another one.'
        : error.message;
      this.snackBar.open(msg, 'Close', { duration: 5000, panelClass: 'error-snackbar' });
    } else {
      this.snackBar.open('Signup successful! 🎉 Check your mailbox for verification.', 'Close', {
        duration: 5000,
        panelClass: 'success-snackbar'
      });
      this.form.reset();
    }
  }
}
