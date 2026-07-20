import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-community',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page">
      <div class="section-header">
        <div>
          <h1>Community Health</h1>
          <p class="sub">Government schemes, blood banks, vaccination camps and health alerts</p>
        </div>
      </div>

      <!-- Outbreak Alerts -->
      <div class="outbreak-bar" *ngIf="outbreaks.length > 0">
        <div class="outbreak-header">
          <span class="outbreak-icon">&#9888;</span>
          <strong>Active Health Alerts ({{ outbreaks.length }})</strong>
        </div>
        <div class="alert-list">
          <div class="alert-item" *ngFor="let o of outbreaks" [class]="'alert-' + o.severity">
            <div class="alert-top">
              <span class="alert-disease">{{ o.disease }}</span>
              <span class="sev-tag" [class]="'sev-' + o.severity">{{ o.severity | uppercase }}</span>
            </div>
            <div class="alert-region">{{ o.region }}</div>
            <div class="alert-msg">{{ o.message }}</div>
            <div class="alert-src">Source: {{ o.source }}</div>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs">
        <button class="tab" [class.active]="activeTab === 'schemes'" (click)="activeTab = 'schemes'">
          Health Schemes
        </button>
        <button class="tab" [class.active]="activeTab === 'blood'" (click)="activeTab = 'blood'">
          Blood Banks
        </button>
        <button class="tab" [class.active]="activeTab === 'camps'" (click)="activeTab = 'camps'">
          Vaccination Camps
        </button>
      </div>

      <!-- Health Schemes -->
      <div *ngIf="activeTab === 'schemes'">
        <div class="filter-bar">
          <input type="text" [(ngModel)]="schemeFilter.state" placeholder="State (e.g. Maharashtra)" class="filter-input">
          <input type="number" [(ngModel)]="schemeFilter.age" placeholder="Age" class="filter-input small" min="0" max="150">
          <input type="text" [(ngModel)]="schemeFilter.condition" placeholder="Condition" class="filter-input">
          <button class="btn btn-primary btn-sm" (click)="filterSchemes()">Search</button>
        </div>
        <div class="content-list">
          <div class="card scheme-card" *ngFor="let s of filteredSchemes">
            <div class="scheme-top">
              <span class="scheme-type" [class]="'type-' + s.scheme_type">{{ formatType(s.scheme_type) }}</span>
              <span class="scheme-provider">{{ s.provider | titlecase }}</span>
            </div>
            <h3 class="scheme-name">
              <a [routerLink]="['/community/scheme', s.id]">{{ s.name }}</a>
            </h3>
            <p class="scheme-desc">{{ s.description | slice:0:140 }}{{ s.description.length > 140 ? '...' : '' }}</p>
            <div class="scheme-footer">
              <span *ngIf="s.eligible === true" class="badge badge-success">&#10003; Likely Eligible</span>
              <span *ngIf="s.eligible === false && s.eligibility_reasons?.length" class="badge badge-danger">
                &#10007; {{ s.eligibility_reasons[0] }}
              </span>
              <a *ngIf="s.link" [href]="s.link" target="_blank" class="scheme-link">Official Site &rarr;</a>
            </div>
          </div>
        </div>
        <div class="empty" *ngIf="filteredSchemes.length === 0">
          <p>No schemes found. Try adjusting your filters.</p>
        </div>
      </div>

      <!-- Blood Banks -->
      <div *ngIf="activeTab === 'blood'">
        <div class="filter-bar">
          <input type="text" [(ngModel)]="bloodFilter.city" placeholder="City (e.g. Mumbai)" class="filter-input">
          <select [(ngModel)]="bloodFilter.blood_type" class="filter-input">
            <option value="">All Blood Types</option>
            <option *ngFor="let bt of bloodTypes" [value]="bt">{{ bt }}</option>
          </select>
          <button class="btn btn-primary btn-sm" (click)="filterBloodBanks()">Search</button>
        </div>
        <div class="content-list">
          <div class="card blood-card" *ngFor="let b of filteredBanks">
            <strong class="blood-name">{{ b.name }}</strong>
            <span class="blood-address">{{ b.address }}, {{ b.city }}, {{ b.state }}</span>
            <span class="blood-phone" *ngIf="b.phone">&#9742; {{ b.phone }}</span>
            <div class="blood-types">
              <span class="bt-label">Available:</span>
              <span class="bt-tag" *ngFor="let bt of b.blood_available" [class.highlight]="bt === bloodFilter.blood_type">
                {{ bt }}
              </span>
            </div>
          </div>
        </div>
        <div class="empty" *ngIf="filteredBanks.length === 0">
          <p>No blood banks found. Try a different city.</p>
        </div>
      </div>

      <!-- Vaccination Camps -->
      <div *ngIf="activeTab === 'camps'">
        <div class="filter-bar">
          <input type="text" [(ngModel)]="campFilter.city" placeholder="City" class="filter-input">
          <button class="btn btn-primary btn-sm" (click)="filterCamps()">Search</button>
        </div>
        <div class="content-list">
          <div class="card camp-card" *ngFor="let c of filteredCamps">
            <div class="camp-date">
              <span class="camp-day">{{ c.camp_date | date:'dd' }}</span>
              <span class="camp-month">{{ c.camp_date | date:'MMM' }}</span>
            </div>
            <div class="camp-info">
              <div class="camp-name">{{ c.name }}</div>
              <div class="camp-address">{{ c.address }}, {{ c.city }}</div>
              <div class="camp-vaccines">
                <span class="vaccine-tag" *ngFor="let v of c.vaccines">{{ v }}</span>
              </div>
              <div class="camp-meta">
                <span *ngIf="c.is_free" class="badge badge-success">Free</span>
                <span class="age-info">Ages: {{ c.age_group }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="empty" *ngIf="filteredCamps.length === 0">
          <p>No upcoming vaccination camps found.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { padding-bottom: 40px; }
    .sub { color: var(--muted); font-size: 0.88rem; margin-top: 2px; }

    /* Outbreak */
    .outbreak-bar {
      background: linear-gradient(135deg, #fff5f5, #fff0e6);
      border: 1px solid #f5c6cb;
      border-radius: 10px;
      padding: 14px 16px;
      margin-bottom: 20px;
    }
    .outbreak-header {
      display: flex; align-items: center; gap: 8px; margin-bottom: 10px;
    }
    .outbreak-icon { font-size: 1.2rem; color: var(--coral); }
    .alert-list { display: grid; gap: 8px; }
    .alert-item {
      padding: 10px 12px; background: white; border-radius: 8px;
      border-left: 3px solid var(--muted);
    }
    .alert-critical { border-left-color: #c0392b; }
    .alert-high { border-left-color: #e67e22; }
    .alert-medium { border-left-color: #f39c12; }
    .alert-low { border-left-color: #27ae60; }
    .alert-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px; }
    .alert-disease { font-weight: 700; font-size: 0.88rem; }
    .sev-tag {
      font-size: 0.65rem; padding: 2px 7px; border-radius: 8px;
      font-weight: 700; letter-spacing: 0.4px;
    }
    .sev-critical { background: #c0392b; color: white; }
    .sev-high { background: #e67e22; color: white; }
    .sev-medium { background: #f39c12; color: white; }
    .sev-low { background: #27ae60; color: white; }
    .alert-region { font-size: 0.78rem; color: var(--muted); margin-bottom: 2px; }
    .alert-msg { font-size: 0.82rem; line-height: 1.4; margin-bottom: 2px; }
    .alert-src { font-size: 0.72rem; color: var(--muted); font-style: italic; }

    /* Content lists */
    .content-list { display: grid; gap: 10px; }

    /* Scheme */
    .scheme-top {
      display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;
    }
    .scheme-type {
      font-size: 0.68rem; padding: 2px 8px; border-radius: 8px;
      font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px;
    }
    .type-insurance { background: #eaf4ff; color: #2563eb; }
    .type-subsidy { background: #f0fdf4; color: #16a34a; }
    .type-free_treatment { background: #fef3c7; color: #d97706; }
    .type-screening { background: #f3e8ff; color: #9333ea; }
    .scheme-provider { font-size: 0.75rem; color: var(--muted); }
    .scheme-name { font-size: 0.95rem; margin-bottom: 5px; }
    .scheme-name a { color: var(--ink); text-decoration: none; }
    .scheme-name a:hover { text-decoration: underline; }
    .scheme-desc { font-size: 0.82rem; color: var(--muted); line-height: 1.4; margin-bottom: 8px; }
    .scheme-footer { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
    .scheme-link {
      font-size: 0.8rem; color: var(--marigold); text-decoration: none; font-weight: 500;
      margin-left: auto;
    }

    /* Blood Bank */
    .blood-name { font-size: 0.9rem; display: block; margin-bottom: 3px; }
    .blood-address { font-size: 0.82rem; color: var(--muted); display: block; margin-bottom: 3px; }
    .blood-phone { font-size: 0.82rem; display: block; margin-bottom: 6px; }
    .blood-types { display: flex; flex-wrap: wrap; gap: 5px; align-items: center; }
    .bt-label { font-size: 0.75rem; color: var(--muted); font-weight: 600; }
    .bt-tag {
      padding: 2px 7px; background: var(--paper); border-radius: 5px;
      font-size: 0.78rem; font-weight: 500; border: 1px solid var(--line);
    }
    .bt-tag.highlight { background: #fee2e2; border-color: var(--coral); font-weight: 700; }

    /* Camp */
    .camp-card { display: flex; gap: 14px; }
    .camp-date {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; min-width: 50px;
      background: var(--ink); color: white; border-radius: 8px; padding: 8px;
    }
    .camp-day { font-size: 1.2rem; font-weight: 700; line-height: 1; }
    .camp-month { font-size: 0.65rem; text-transform: uppercase; }
    .camp-info { flex: 1; }
    .camp-name { font-weight: 700; font-size: 0.9rem; margin-bottom: 3px; }
    .camp-address { font-size: 0.82rem; color: var(--muted); margin-bottom: 5px; }
    .camp-vaccines { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 6px; }
    .vaccine-tag {
      padding: 2px 7px; background: #eaf4ff; color: #2563eb;
      border-radius: 5px; font-size: 0.75rem; font-weight: 500;
    }
    .camp-meta { display: flex; gap: 10px; align-items: center; }
    .age-info { font-size: 0.78rem; color: var(--muted); }

    @media (max-width: 600px) {
      .filter-bar { flex-direction: column; }
      .filter-input { min-width: unset; }
      .camp-card { flex-direction: column; }
      .camp-date { flex-direction: row; min-width: unset; gap: 6px; padding: 6px 10px; }
    }
  `]
})
export class CommunityComponent implements OnInit {
  activeTab: 'schemes' | 'blood' | 'camps' = 'schemes';

  schemes: any[] = [];
  filteredSchemes: any[] = [];
  schemeFilter = { state: '', age: null as number | null, condition: '' };

  banks: any[] = [];
  filteredBanks: any[] = [];
  bloodFilter = { city: '', blood_type: '' };
  bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  camps: any[] = [];
  filteredCamps: any[] = [];
  campFilter = { city: '' };

  outbreaks: any[] = [];

  constructor(private api: ApiService) {}

  ngOnInit() { this.loadAll(); }

  loadAll() {
    this.api.getCommunitySchemes().subscribe({ next: (data: any) => { this.schemes = data; this.filteredSchemes = data; } });
    this.api.getBloodBanks().subscribe({ next: (data: any) => { this.banks = data; this.filteredBanks = data; } });
    this.api.getVaccinationCamps().subscribe({ next: (data: any) => { this.camps = data; this.filteredCamps = data; } });
    this.api.getOutbreakAlerts().subscribe({ next: (data: any) => this.outbreaks = data });
  }

  filterSchemes() {
    this.filteredSchemes = this.schemes.filter(s => {
      if (this.schemeFilter.state && !s.state?.toLowerCase().includes(this.schemeFilter.state.toLowerCase())) return false;
      if (this.schemeFilter.condition && !s.eligibility_criteria?.toLowerCase().includes(this.schemeFilter.condition.toLowerCase())) return false;
      return true;
    });
  }

  filterBloodBanks() {
    this.filteredBanks = this.banks.filter(b => {
      if (this.bloodFilter.city && !b.city?.toLowerCase().includes(this.bloodFilter.city.toLowerCase())) return false;
      return true;
    });
  }

  filterCamps() {
    this.filteredCamps = this.camps.filter(c => {
      if (this.campFilter.city && !c.city?.toLowerCase().includes(this.campFilter.city.toLowerCase())) return false;
      return true;
    });
  }

  formatType(type: string): string {
    return type?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || type;
  }
}
