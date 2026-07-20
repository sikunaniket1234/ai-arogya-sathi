import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card wide">
        <div class="auth-header">
          <div class="abha-badge">ABHA</div>
          <h1>Create Health Account</h1>
          <p>Register with ABHA (Ayushman Bharat Health Account)</p>
        </div>

        <div class="steps">
          <div class="step" [class.active]="currentStep === 1" [class.done]="currentStep > 1">
            <span class="step-num">{{ currentStep > 1 ? '&#10003;' : '1' }}</span>
            <span class="step-label">Identity</span>
          </div>
          <div class="step-line" [class.done]="currentStep > 1"></div>
          <div class="step" [class.active]="currentStep === 2" [class.done]="currentStep > 2">
            <span class="step-num">{{ currentStep > 2 ? '&#10003;' : '2' }}</span>
            <span class="step-label">Account</span>
          </div>
          <div class="step-line" [class.done]="currentStep > 2"></div>
          <div class="step" [class.active]="currentStep === 3" [class.done]="currentStep > 3">
            <span class="step-num">{{ currentStep > 3 ? '&#10003;' : '3' }}</span>
            <span class="step-label">Address</span>
          </div>
          <div class="step-line" [class.done]="currentStep > 3"></div>
          <div class="step" [class.active]="currentStep === 4">
            <span class="step-num">4</span>
            <span class="step-label">Safety</span>
          </div>
        </div>

        <div class="error" *ngIf="error">{{ error }}</div>

        <!-- Step 1: Identity -->
        <form *ngIf="currentStep === 1" (ngSubmit)="nextStep()">
          <h2 class="step-title">Personal Identity</h2>
          <p class="step-desc">As per your Aadhaar card</p>

          <div class="form-group">
            <label>Full Name <span class="req">*</span></label>
            <input type="text" [(ngModel)]="form.name" name="name" required
              placeholder="As per Aadhaar (e.g. Rajesh Kumar)" [class.invalid]="fieldErrors['name']">
            <span class="field-error" *ngIf="fieldErrors['name']">{{ fieldErrors['name'] }}</span>
          </div>

          <div class="form-group">
            <label>Date of Birth <span class="req">*</span></label>
            <input type="date" [(ngModel)]="form.dob" name="dob" required [max]="maxDob"
              [class.invalid]="fieldErrors['dob']">
            <span class="field-error" *ngIf="fieldErrors['dob']">{{ fieldErrors['dob'] }}</span>
          </div>

          <div class="form-group">
            <label>Gender <span class="req">*</span></label>
            <div class="radio-group">
              <label class="radio-label" [class.selected]="form.gender === 'male'">
                <input type="radio" [(ngModel)]="form.gender" name="gender" value="male"> Male
              </label>
              <label class="radio-label" [class.selected]="form.gender === 'female'">
                <input type="radio" [(ngModel)]="form.gender" name="gender" value="female"> Female
              </label>
              <label class="radio-label" [class.selected]="form.gender === 'other'">
                <input type="radio" [(ngModel)]="form.gender" name="gender" value="other"> Other
              </label>
            </div>
            <span class="field-error" *ngIf="fieldErrors['gender']">{{ fieldErrors['gender'] }}</span>
          </div>

          <div class="form-group">
            <label>Aadhaar Number <span class="req">*</span></label>
            <input type="text" [(ngModel)]="aadhaarDisplay" name="aadhaar" required
              placeholder="12-digit Aadhaar number" maxlength="14"
              (input)="onAadhaarInput()" [class.invalid]="fieldErrors['aadhaar']">
            <span class="aadhaar-hint" *ngIf="form.aadhaar.length === 12">
              Only last 4 digits stored: <strong>**** {{ form.aadhaar.slice(-4) }}</strong>
            </span>
            <span class="field-error" *ngIf="fieldErrors['aadhaar']">{{ fieldErrors['aadhaar'] }}</span>
          </div>

          <button type="submit" class="btn btn-primary full-width">Continue &rarr;</button>
        </form>

        <!-- Step 2: Account -->
        <form *ngIf="currentStep === 2" (ngSubmit)="nextStep()">
          <h2 class="step-title">Account Details</h2>
          <p class="step-desc">Your login credentials</p>

          <div class="form-group">
            <label>Phone Number <span class="req">*</span></label>
            <div class="input-with-prefix">
              <span class="prefix">+91</span>
              <input type="tel" [(ngModel)]="form.phone" name="phone" required
                placeholder="98765 43210" maxlength="10"
                [class.invalid]="fieldErrors['phone']">
            </div>
            <span class="field-error" *ngIf="fieldErrors['phone']">{{ fieldErrors['phone'] }}</span>
          </div>

          <div class="form-group">
            <label>Email Address <span class="req">*</span></label>
            <input type="email" [(ngModel)]="form.email" name="email" required
              placeholder="you@example.com" [class.invalid]="fieldErrors['email']">
            <span class="field-error" *ngIf="fieldErrors['email']">{{ fieldErrors['email'] }}</span>
          </div>

          <div class="form-group">
            <label>Password <span class="req">*</span></label>
            <input type="password" [(ngModel)]="form.password" name="password" required
              placeholder="Min 8 chars, upper + lower + number" [class.invalid]="fieldErrors['password']">
            <div class="password-strength" *ngIf="form.password">
              <div class="strength-bar">
                <div class="strength-fill" [style.width]="passwordStrengthPercent + '%'"
                  [class.weak]="passwordStrength < 2" [class.medium]="passwordStrength === 2"
                  [class.strong]="passwordStrength >= 3"></div>
              </div>
              <span class="strength-label" [class]="strengthLabel">{{ strengthLabel }}</span>
            </div>
            <span class="field-error" *ngIf="fieldErrors['password']">{{ fieldErrors['password'] }}</span>
          </div>

          <div class="form-group">
            <label>Confirm Password <span class="req">*</span></label>
            <input type="password" [(ngModel)]="form.confirmPassword" name="confirmPassword" required
              placeholder="Re-enter password" [class.invalid]="fieldErrors['confirmPassword']">
            <span class="field-error" *ngIf="fieldErrors['confirmPassword']">{{ fieldErrors['confirmPassword'] }}</span>
          </div>

          <div class="btn-row">
            <button type="button" class="btn btn-secondary" (click)="currentStep = 1">&larr; Back</button>
            <button type="submit" class="btn btn-primary">Continue &rarr;</button>
          </div>
        </form>

        <!-- Step 3: Address -->
        <form *ngIf="currentStep === 3" (ngSubmit)="nextStep()">
          <h2 class="step-title">Address & Health</h2>
          <p class="step-desc">For your ABHA health profile</p>

          <div class="form-group">
            <label>State <span class="req">*</span></label>
            <select [(ngModel)]="form.state" name="state" required [class.invalid]="fieldErrors['state']">
              <option value="">Select State / UT</option>
              <option *ngFor="let s of indianStates" [value]="s">{{ s }}</option>
            </select>
            <span class="field-error" *ngIf="fieldErrors['state']">{{ fieldErrors['state'] }}</span>
          </div>

          <div class="form-group">
            <label>District <span class="req">*</span></label>
            <input type="text" [(ngModel)]="form.district" name="district" required
              placeholder="Your district" [class.invalid]="fieldErrors['district']">
            <span class="field-error" *ngIf="fieldErrors['district']">{{ fieldErrors['district'] }}</span>
          </div>

          <div class="form-group">
            <label>Pin Code <span class="req">*</span></label>
            <input type="text" [(ngModel)]="form.pin" name="pin" required
              placeholder="6-digit pin code" maxlength="6"
              [class.invalid]="fieldErrors['pin']">
            <span class="field-error" *ngIf="fieldErrors['pin']">{{ fieldErrors['pin'] }}</span>
          </div>

          <div class="form-group">
            <label>Blood Group</label>
            <select [(ngModel)]="form.blood_group" name="blood_group">
              <option value="">Select (optional)</option>
              <option *ngFor="let bg of bloodGroups" [value]="bg">{{ bg }}</option>
            </select>
          </div>

          <div class="btn-row">
            <button type="button" class="btn btn-secondary" (click)="currentStep = 2">&larr; Back</button>
            <button type="submit" class="btn btn-primary">Continue &rarr;</button>
          </div>
        </form>

        <!-- Step 4: Safety -->
        <form *ngIf="currentStep === 4" (ngSubmit)="onSubmit()">
          <h2 class="step-title">Emergency & Preferences</h2>
          <p class="step-desc">For your safety and health</p>

          <div class="form-group">
            <label>Emergency Contact Name <span class="req">*</span></label>
            <input type="text" [(ngModel)]="form.emergency_name" name="emergency_name" required
              placeholder="Family member or trusted contact"
              [class.invalid]="fieldErrors['emergency_name']">
            <span class="field-error" *ngIf="fieldErrors['emergency_name']">{{ fieldErrors['emergency_name'] }}</span>
          </div>

          <div class="form-group">
            <label>Emergency Contact Phone <span class="req">*</span></label>
            <div class="input-with-prefix">
              <span class="prefix">+91</span>
              <input type="tel" [(ngModel)]="form.emergency_phone" name="emergency_phone" required
                placeholder="10-digit phone number" maxlength="10"
                [class.invalid]="fieldErrors['emergency_phone']">
            </div>
            <span class="field-error" *ngIf="fieldErrors['emergency_phone']">{{ fieldErrors['emergency_phone'] }}</span>
          </div>

          <div class="form-group">
            <label>Preferred Language</label>
            <select [(ngModel)]="form.language" name="language">
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="bn">Bengali</option>
              <option value="ta">Tamil</option>
              <option value="te">Telugu</option>
              <option value="mr">Marathi</option>
              <option value="gu">Gujarati</option>
              <option value="kn">Kannada</option>
            </select>
          </div>

          <div class="terms-check">
            <label class="check-label">
              <input type="checkbox" [(ngModel)]="agreed" name="agreed">
              <span>I agree to the <strong>ABHA Terms of Service</strong> and confirm that the information provided is accurate.
                I understand that my Aadhaar last 4 digits will be stored for identity verification.</span>
            </label>
            <span class="field-error" *ngIf="fieldErrors['agreed']">{{ fieldErrors['agreed'] }}</span>
          </div>

          <div class="btn-row">
            <button type="button" class="btn btn-secondary" (click)="currentStep = 3">&larr; Back</button>
            <button type="submit" class="btn btn-primary" [disabled]="loading">
              {{ loading ? 'Creating Account...' : 'Create ABHA Account' }}
            </button>
          </div>
        </form>

        <p class="auth-footer">
          Already have an account? <a routerLink="/login">Sign in</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      display: flex; justify-content: center; align-items: flex-start;
      padding: 32px 16px; min-height: 80vh;
    }
    .auth-card {
      background: white; border: 1px solid var(--line); border-radius: 14px;
      padding: 32px; width: 100%;
    }
    .auth-card.wide { max-width: 520px; }
    .auth-header { text-align: center; margin-bottom: 20px; }
    .abha-badge {
      display: inline-block; background: linear-gradient(135deg, #1a7a3a, #2ecc71);
      color: white; font-weight: 800; font-size: 0.8rem; padding: 6px 16px;
      border-radius: 20px; letter-spacing: 2px; margin-bottom: 10px;
    }
    .auth-header h1 { font-size: 1.4rem; margin-bottom: 4px; }
    .auth-header p { color: var(--muted); font-size: 0.88rem; }

    .steps {
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 28px; gap: 0;
    }
    .step {
      display: flex; flex-direction: column; align-items: center; gap: 4px;
      opacity: 0.4; transition: opacity 0.3s;
    }
    .step.active, .step.done { opacity: 1; }
    .step-num {
      width: 32px; height: 32px; border-radius: 50%;
      background: var(--paper-dim); color: var(--muted);
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 0.85rem;
    }
    .step.active .step-num { background: var(--ink); color: white; }
    .step.done .step-num { background: #1a7a3a; color: white; }
    .step-label { font-size: 0.72rem; color: var(--muted); font-weight: 500; }
    .step.active .step-label { color: var(--ink); font-weight: 600; }
    .step-line { width: 40px; height: 2px; background: var(--line); margin-bottom: 16px; }
    .step-line.done { background: #1a7a3a; }

    .step-title { font-size: 1.1rem; margin-bottom: 4px; }
    .step-desc { color: var(--muted); font-size: 0.85rem; margin-bottom: 18px; }

    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 5px; }
    .req { color: var(--coral); }
    .form-group input, .form-group select {
      width: 100%; padding: 10px 12px; border: 1px solid var(--line);
      border-radius: 8px; font-size: 0.9rem; box-sizing: border-box;
    }
    .form-group input:focus, .form-group select:focus {
      outline: none; border-color: var(--marigold);
    }
    .form-group input.invalid, .form-group select.invalid { border-color: var(--coral); }
    .field-error { display: block; color: var(--coral); font-size: 0.78rem; margin-top: 4px; }

    .input-with-prefix {
      display: flex; align-items: center;
    }
    .prefix {
      padding: 10px 12px; background: var(--paper-dim); border: 1px solid var(--line);
      border-right: none; border-radius: 8px 0 0 8px; font-size: 0.9rem;
      color: var(--muted); font-weight: 500;
    }
    .input-with-prefix input { border-radius: 0 8px 8px 0; }

    .radio-group { display: flex; gap: 8px; }
    .radio-label {
      display: flex; align-items: center; gap: 6px; padding: 10px 16px;
      border: 1px solid var(--line); border-radius: 8px; cursor: pointer;
      font-size: 0.9rem; transition: all 0.2s;
    }
    .radio-label.selected { border-color: var(--ink); background: var(--paper); }
    .radio-label input { display: none; }

    .aadhaar-hint {
      display: block; font-size: 0.78rem; color: #1a7a3a; margin-top: 4px;
    }

    .password-strength { display: flex; align-items: center; gap: 8px; margin-top: 6px; }
    .strength-bar { flex: 1; height: 4px; background: var(--line); border-radius: 2px; overflow: hidden; }
    .strength-fill { height: 100%; border-radius: 2px; transition: width 0.3s; }
    .strength-fill.weak { background: var(--coral); }
    .strength-fill.medium { background: var(--marigold); }
    .strength-fill.strong { background: #1a7a3a; }
    .strength-label { font-size: 0.75rem; font-weight: 600; }
    .strength-label.weak { color: var(--coral); }
    .strength-label.medium { color: var(--marigold); }
    .strength-label.strong { color: #1a7a3a; }

    .terms-check {
      margin-bottom: 16px; padding: 12px; background: var(--paper); border-radius: 8px;
    }
    .check-label {
      display: flex; gap: 10px; align-items: flex-start; font-size: 0.82rem;
      line-height: 1.4; color: var(--muted); cursor: pointer;
    }
    .check-label input { margin-top: 3px; flex-shrink: 0; }

    .btn-row { display: flex; gap: 10px; margin-top: 8px; }
    .btn-row .btn { flex: 1; }
    .full-width { width: 100%; text-align: center; }

    .error {
      background: #fff0f0; border: 1px solid #ffcccc; color: #cc0000;
      padding: 10px; border-radius: 6px; margin-bottom: 16px; font-size: 0.88rem;
    }
    .auth-footer {
      text-align: center; margin-top: 20px; font-size: 0.88rem; color: var(--muted);
    }
    .auth-footer a { color: var(--marigold); text-decoration: none; }

    @media (max-width: 480px) {
      .auth-card { padding: 20px; }
      .step-label { display: none; }
      .step-line { width: 24px; }
    }
  `],
})
export class RegisterComponent {
  currentStep = 1;
  loading = false;
  error = '';
  fieldErrors: Record<string, string> = {};
  agreed = false;
  maxDob = new Date().toISOString().split('T')[0];
  aadhaarDisplay = '';

  form = {
    name: '',
    dob: '',
    gender: '',
    aadhaar: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    state: '',
    district: '',
    pin: '',
    blood_group: '',
    emergency_name: '',
    emergency_phone: '',
    language: 'en',
  };

  indianStates = [
    "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
    "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
    "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab",
    "Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh",
    "Uttarakhand","West Bengal","Delhi","Jammu and Kashmir","Ladakh",
    "Chandigarh","Puducherry","Andaman and Nicobar Islands","Dadra and Nagar Haveli",
    "Daman and Diu","Lakshadweep"
  ];

  bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  get passwordStrength(): number {
    const p = this.form.password;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return Math.min(s, 3);
  }

  get passwordStrengthPercent(): number {
    return (this.passwordStrength / 3) * 100;
  }

  get strengthLabel(): string {
    const s = this.passwordStrength;
    if (s < 2) return 'Weak';
    if (s === 2) return 'Medium';
    return 'Strong';
  }

  constructor(private auth: AuthService, private router: Router) {}

  onAadhaarInput() {
    const raw = this.aadhaarDisplay.replace(/\D/g, '').slice(0, 12);
    this.form.aadhaar = raw;
    if (raw.length > 8) {
      this.aadhaarDisplay = raw.slice(0, 4) + ' ' + raw.slice(4, 8) + ' ' + raw.slice(8);
    } else if (raw.length > 4) {
      this.aadhaarDisplay = raw.slice(0, 4) + ' ' + raw.slice(4);
    } else {
      this.aadhaarDisplay = raw;
    }
  }

  nextStep() {
    this.fieldErrors = {};
    let valid = true;

    if (this.currentStep === 1) {
      if (!this.form.name.trim() || this.form.name.trim().length < 2) {
        this.fieldErrors['name'] = 'Full name is required (min 2 characters)';
        valid = false;
      }
      if (!this.form.dob) {
        this.fieldErrors['dob'] = 'Date of birth is required';
        valid = false;
      } else {
        const age = Math.floor((Date.now() - new Date(this.form.dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
        if (age < 0 || age > 150) {
          this.fieldErrors['dob'] = 'Please enter a valid date of birth';
          valid = false;
        }
      }
      if (!this.form.gender) {
        this.fieldErrors['gender'] = 'Please select your gender';
        valid = false;
      }
      if (!/^\d{12}$/.test(this.form.aadhaar)) {
        this.fieldErrors['aadhaar'] = 'Aadhaar must be exactly 12 digits';
        valid = false;
      }
    }

    if (this.currentStep === 2) {
      if (!/^[6-9]\d{9}$/.test(this.form.phone)) {
        this.fieldErrors['phone'] = 'Enter a valid 10-digit Indian phone number (starts with 6-9)';
        valid = false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.form.email)) {
        this.fieldErrors['email'] = 'Enter a valid email address';
        valid = false;
      }
      if (this.form.password.length < 8) {
        this.fieldErrors['password'] = 'Password must be at least 8 characters';
        valid = false;
      } else if (!/[A-Z]/.test(this.form.password) || !/[a-z]/.test(this.form.password) || !/[0-9]/.test(this.form.password)) {
        this.fieldErrors['password'] = 'Password must include uppercase, lowercase, and a number';
        valid = false;
      }
      if (this.form.password !== this.form.confirmPassword) {
        this.fieldErrors['confirmPassword'] = 'Passwords do not match';
        valid = false;
      }
    }

    if (this.currentStep === 3) {
      if (!this.form.state) {
        this.fieldErrors['state'] = 'Please select your state';
        valid = false;
      }
      if (!this.form.district.trim()) {
        this.fieldErrors['district'] = 'District is required';
        valid = false;
      }
      if (!/^\d{6}$/.test(this.form.pin)) {
        this.fieldErrors['pin'] = 'Pin code must be exactly 6 digits';
        valid = false;
      }
    }

    if (valid && this.currentStep < 4) {
      this.currentStep++;
    }
  }

  onSubmit() {
    this.fieldErrors = {};
    let valid = true;

    if (!this.form.emergency_name.trim()) {
      this.fieldErrors['emergency_name'] = 'Emergency contact name is required';
      valid = false;
    }
    if (!/^[6-9]\d{9}$/.test(this.form.emergency_phone)) {
      this.fieldErrors['emergency_phone'] = 'Enter a valid 10-digit phone number';
      valid = false;
    }
    if (!this.agreed) {
      this.fieldErrors['agreed'] = 'You must agree to the terms';
      valid = false;
    }

    if (!valid) return;

    this.loading = true;
    this.error = '';

    this.auth.register({
      name: this.form.name.trim(),
      email: this.form.email,
      phone: this.form.phone,
      password: this.form.password,
      dob: this.form.dob,
      gender: this.form.gender,
      aadhaar: this.form.aadhaar,
      state: this.form.state,
      district: this.form.district.trim(),
      pin: this.form.pin,
      blood_group: this.form.blood_group || undefined,
      language_preference: this.form.language,
    }).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.error || err.error?.errors?.[0]?.msg || 'Registration failed.';
      },
    });
  }
}
