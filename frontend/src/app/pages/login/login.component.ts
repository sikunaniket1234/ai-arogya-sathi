import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <span class="dot"></span>
          <h1>AI Arogya Sathi</h1>
          <p>Sign in to your health companion</p>
        </div>

        <div class="error" *ngIf="error">{{ error }}</div>

        <form (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>Email</label>
            <input type="email" [(ngModel)]="email" name="email" required placeholder="you@example.com">
          </div>
          <div class="form-group">
            <label>Password</label>
            <input type="password" [(ngModel)]="password" name="password" required placeholder="Enter password">
          </div>
          <button type="submit" class="btn btn-primary full-width" [disabled]="loading">
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>

        <p class="auth-footer">
          Don't have an account? <a routerLink="/register">Register here</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 80vh;
    }
    .auth-card {
      background: white;
      border: 1px solid var(--line);
      border-radius: 12px;
      padding: 32px;
      width: 100%;
      max-width: 400px;
    }
    .auth-header {
      text-align: center;
      margin-bottom: 24px;
    }
    .auth-header h1 {
      font-size: 1.5rem;
      margin: 12px 0 4px;
    }
    .auth-header p {
      color: var(--muted);
      font-size: 0.9rem;
    }
    .dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: var(--coral);
      display: inline-block;
    }
    .full-width {
      width: 100%;
      text-align: center;
    }
    .error {
      background: #fff0f0;
      border: 1px solid #ffcccc;
      color: #cc0000;
      padding: 10px;
      border-radius: 6px;
      margin-bottom: 16px;
      font-size: 0.9rem;
    }
    .auth-footer {
      text-align: center;
      margin-top: 16px;
      font-size: 0.9rem;
      color: var(--muted);
    }
    .auth-footer a {
      color: var(--marigold);
      text-decoration: none;
    }
  `],
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit() {
    this.loading = true;
    this.error = '';
    this.auth.login(this.email, this.password).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.error || 'Login failed. Please try again.';
      },
    });
  }
}
