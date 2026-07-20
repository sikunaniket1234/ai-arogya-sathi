import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-scheme-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="scheme-detail-page" *ngIf="scheme">
      <a routerLink="/community" class="back-link">&larr; Back to Community</a>

      <div class="scheme-header card">
        <span class="scheme-type" [class]="'type-' + scheme.scheme_type">{{ formatType(scheme.scheme_type) }}</span>
        <span class="scheme-provider">{{ scheme.provider | titlecase }} Level Scheme</span>
        <h1>{{ scheme.name }}</h1>
        <p class="scheme-desc">{{ scheme.description }}</p>
        <a *ngIf="scheme.link" [href]="scheme.link" target="_blank" class="btn btn-primary">
          Visit Official Website &rarr;
        </a>
      </div>

      <div class="eligibility-checker card">
        <h2>Eligibility Checker</h2>
        <p class="checker-desc">Enter your details to check if you may be eligible for this scheme.</p>
        <form (ngSubmit)="checkEligibility()">
          <div class="grid-3">
            <div class="form-group">
              <label>Age</label>
              <input type="number" [(ngModel)]="checkForm.age" name="age" placeholder="Your age" min="0" max="150">
            </div>
            <div class="form-group">
              <label>State</label>
              <select [(ngModel)]="checkForm.state" name="state">
                <option value="">All States</option>
                <option *ngFor="let s of indianStates" [value]="s">{{ s }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Medical Condition</label>
              <input type="text" [(ngModel)]="checkForm.condition" name="condition" placeholder="e.g. Diabetes">
            </div>
          </div>
          <button type="submit" class="btn btn-primary">Check Eligibility</button>
        </form>

        <div class="result-box" *ngIf="eligibilityResult !== null">
          <div class="result-icon" [class]="eligibilityResult ? 'eligible' : 'not-eligible'">
            {{ eligibilityResult ? '&#10003;' : '&#10007;' }}
          </div>
          <div class="result-text">
            <strong>{{ eligibilityResult ? 'You may be eligible!' : 'You may not be eligible' }}</strong>
            <p *ngIf="eligibilityResult">
              Based on your inputs, you appear to meet the basic eligibility criteria for this scheme.
              Please visit the official website or contact the scheme helpline for final verification.
            </p>
            <p *ngIf="!eligibilityResult && reasons.length > 0">
              {{ reasons[0] }}
            </p>
            <p *ngIf="!eligibilityResult">
              Consider checking other schemes that may match your profile.
            </p>
          </div>
        </div>
      </div>

      <div class="scheme-info card" *ngIf="scheme.eligibility_criteria">
        <h2>Eligibility Criteria</h2>
        <div class="criteria-grid">
          <div class="criteria-item" *ngIf="scheme.eligibility_criteria.min_age">
            <span class="crit-label">Minimum Age</span>
            <span class="crit-value">{{ scheme.eligibility_criteria.min_age }} years</span>
          </div>
          <div class="criteria-item" *ngIf="scheme.eligibility_criteria.max_age">
            <span class="crit-label">Maximum Age</span>
            <span class="crit-value">{{ scheme.eligibility_criteria.max_age }} years</span>
          </div>
          <div class="criteria-item" *ngIf="scheme.eligibility_criteria.max_income">
            <span class="crit-label">Annual Income Limit</span>
            <span class="crit-value">Rs {{ scheme.eligibility_criteria.max_income | number }}</span>
          </div>
          <div class="criteria-item" *ngIf="scheme.eligibility_criteria.bpl_only">
            <span class="crit-label">Category</span>
            <span class="crit-value">Below Poverty Line (BPL)</span>
          </div>
          <div class="criteria-item" *ngIf="scheme.eligibility_criteria.conditions?.length">
            <span class="crit-label">Relevant Conditions</span>
            <span class="crit-value">{{ scheme.eligibility_criteria.conditions.join(', ') }}</span>
          </div>
        </div>
      </div>

      <div class="scheme-info card" *ngIf="scheme.states?.length && scheme.states[0] !== '{}'">
        <h2>Available In</h2>
        <div class="state-tags">
          <span class="state-tag" *ngFor="let s of scheme.states">{{ s }}</span>
        </div>
      </div>
    </div>

    <div class="loading-state" *ngIf="loading">
      <p>Loading scheme details...</p>
    </div>
  `,
  styles: [`
    .scheme-detail-page { padding-bottom: 40px; }
    .back-link {
      display: inline-block; margin-bottom: 16px;
      color: var(--ink-text); text-decoration: none; font-size: 0.9rem;
    }
    .back-link:hover { text-decoration: underline; }

    .scheme-header { margin-bottom: 20px; }
    .scheme-type {
      display: inline-block; font-size: 0.72rem; padding: 3px 10px;
      border-radius: 10px; font-weight: 600; text-transform: uppercase;
      letter-spacing: 0.3px; margin-bottom: 10px;
    }
    .type-insurance { background: #eaf4ff; color: #2563eb; }
    .type-subsidy { background: #f0fdf4; color: #16a34a; }
    .type-free_treatment { background: #fef3c7; color: #d97706; }
    .type-screening { background: #f3e8ff; color: #9333ea; }
    .scheme-provider { font-size: 0.82rem; color: var(--muted); margin-left: 8px; }
    .scheme-header h1 { font-size: 1.3rem; margin: 8px 0 10px; }
    .scheme-desc { font-size: 0.92rem; color: var(--muted); line-height: 1.5; margin-bottom: 12px; }

    .eligibility-checker { margin-bottom: 20px; }
    .eligibility-checker h2 { font-size: 1.1rem; margin-bottom: 4px; }
    .checker-desc { font-size: 0.85rem; color: var(--muted); margin-bottom: 16px; }
    .grid-3 {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 12px; margin-bottom: 12px;
    }
    .form-group label { display: block; font-size: 0.82rem; font-weight: 600; margin-bottom: 4px; }
    .form-group input, .form-group select {
      width: 100%; padding: 8px 12px; border: 1px solid var(--line);
      border-radius: 6px; font-size: 0.88rem;
    }
    .form-group input:focus, .form-group select:focus { outline: none; border-color: var(--marigold); }

    .result-box {
      display: flex; gap: 16px; align-items: flex-start;
      margin-top: 16px; padding: 16px; border-radius: 8px;
    }
    .result-box .eligible { background: #d1fae5; color: #065f46; }
    .result-box .not-eligible { background: #fee2e2; color: #991b1b; }
    .result-icon {
      width: 40px; height: 40px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.2rem; font-weight: 700; flex-shrink: 0;
    }
    .result-text strong { display: block; margin-bottom: 4px; }
    .result-text p { font-size: 0.88rem; color: var(--muted); margin: 0; }

    .scheme-info { margin-bottom: 20px; }
    .scheme-info h2 { font-size: 1.1rem; margin-bottom: 12px; }
    .criteria-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px;
    }
    .criteria-item {
      background: var(--paper); padding: 12px; border-radius: 8px;
    }
    .crit-label { display: block; font-size: 0.75rem; color: var(--muted); text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 4px; }
    .crit-value { font-weight: 600; font-size: 0.95rem; }

    .state-tags { display: flex; flex-wrap: wrap; gap: 8px; }
    .state-tag {
      padding: 6px 14px; background: var(--paper); border-radius: 8px;
      font-size: 0.85rem; border: 1px solid var(--line);
    }

    .loading-state { text-align: center; padding: 60px; color: var(--muted); }
  `]
})
export class HealthSchemeDetailComponent implements OnInit {
  scheme: any = null;
  loading = true;
  checkForm = { age: null as number | null, state: '', condition: '' };
  eligibilityResult: boolean | null = null;
  reasons: string[] = [];

  indianStates = [
    'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
    'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
    'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
    'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
    'Uttarakhand','West Bengal','Delhi','Jammu and Kashmir','Ladakh'
  ];

  constructor(private route: ActivatedRoute, private api: ApiService) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.api.getCommunityScheme(id).subscribe({
        next: (data: any) => { this.scheme = data; this.loading = false; },
        error: () => { this.loading = false; }
      });
    }
  }

  checkEligibility() {
    const criteria = this.scheme.eligibility_criteria || {};
    this.reasons = [];
    let eligible = true;

    if (criteria.min_age && this.checkForm.age && this.checkForm.age < criteria.min_age) {
      eligible = false;
      this.reasons.push(`Minimum age requirement: ${criteria.min_age} years (you entered ${this.checkForm.age})`);
    }
    if (criteria.max_age && this.checkForm.age && this.checkForm.age > criteria.max_age) {
      eligible = false;
      this.reasons.push(`Maximum age limit: ${criteria.max_age} years (you entered ${this.checkForm.age})`);
    }
    if (criteria.bpl_only) {
      eligible = false;
      this.reasons.push('This scheme is only for Below Poverty Line (BPL) families');
    }
    if (criteria.conditions?.length && this.checkForm.condition) {
      const hasMatch = criteria.conditions.some((c: string) =>
        this.checkForm.condition.toLowerCase().includes(c.toLowerCase())
      );
      if (!hasMatch) {
        eligible = false;
        this.reasons.push(`This scheme requires one of: ${criteria.conditions.join(', ')}`);
      }
    }

    this.eligibilityResult = eligible;
  }

  formatType(type: string): string {
    return type.replace(/_/g, ' ');
  }
}
