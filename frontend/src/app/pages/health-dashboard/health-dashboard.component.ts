import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-health-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="health-dashboard">
      <h1>Health Dashboard</h1>
      <p class="sub">Track vitals and health trends</p>

      <div class="vitals-grid">
        <div class="vital-card card" *ngFor="let v of vitals">
          <div class="vital-icon">{{ v.icon }}</div>
          <div class="vital-info">
            <div class="vital-value">{{ v.value || '--' }}</div>
            <div class="vital-label">{{ v.label }}</div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-header">
          <h2>Record Vitals</h2>
        </div>
        <div class="card">
          <form (ngSubmit)="recordVitals()">
            <div class="grid-2">
              <div class="form-group">
                <label>Heart Rate (bpm)</label>
                <input type="number" [(ngModel)]="form.heart_rate" name="hr" placeholder="72">
              </div>
              <div class="form-group">
                <label>Blood Pressure (systolic/diastolic)</label>
                <div class="bp-input">
                  <input type="number" [(ngModel)]="form.blood_pressure_systolic" name="bps" placeholder="120">
                  <span>/</span>
                  <input type="number" [(ngModel)]="form.blood_pressure_diastolic" name="bpd" placeholder="80">
                </div>
              </div>
              <div class="form-group">
                <label>Oxygen Level (%)</label>
                <input type="number" [(ngModel)]="form.oxygen_level" name="o2" placeholder="98" min="0" max="100">
              </div>
              <div class="form-group">
                <label>Temperature (°F)</label>
                <input type="number" [(ngModel)]="form.temperature" name="temp" placeholder="98.6" step="0.1">
              </div>
              <div class="form-group">
                <label>Sleep Hours</label>
                <input type="number" [(ngModel)]="form.sleep_hours" name="sleep" placeholder="7" step="0.5">
              </div>
            </div>
            <button type="submit" class="btn btn-primary" [disabled]="saving">
              {{ saving ? 'Saving...' : 'Record Vitals' }}
            </button>
          </form>
        </div>
      </div>

      <div class="section">
        <h2>Recent Records</h2>
        <div class="empty card" *ngIf="records.length === 0">
          <p>No health records yet. Start tracking your vitals above.</p>
        </div>
        <div class="record-card card" *ngFor="let r of records">
          <div class="record-time">{{ r.recorded_at | date:'medium' }}</div>
          <div class="record-vitals">
            <span *ngIf="r.heart_rate">❤️ {{ r.heart_rate }} bpm</span>
            <span *ngIf="r.blood_pressure_systolic">🩺 {{ r.blood_pressure_systolic }}/{{ r.blood_pressure_diastolic }}</span>
            <span *ngIf="r.oxygen_level">💨 {{ r.oxygen_level }}%</span>
            <span *ngIf="r.temperature">🌡️ {{ r.temperature }}°F</span>
            <span *ngIf="r.sleep_hours">😴 {{ r.sleep_hours }}h</span>
            <span *ngIf="r.steps">🏃 {{ r.steps | number }} steps</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .health-dashboard h1 { font-size: 1.5rem; margin-bottom: 4px; }
    .sub { color: var(--muted); margin-bottom: 20px; }
    .vitals-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: 12px; margin-bottom: 28px;
    }
    .vital-card { display: flex; align-items: center; gap: 12px; }
    .vital-icon { font-size: 1.6rem; }
    .vital-value { font-size: 1.4rem; font-weight: 700; color: var(--ink); }
    .vital-label { font-size: 0.8rem; color: var(--muted); }
    .section { margin-bottom: 28px; }
    .section-header { margin-bottom: 12px; }
    .section-header h2 { font-size: 1.2rem; }
    .bp-input { display: flex; align-items: center; gap: 8px; }
    .bp-input input { flex: 1; }
    .bp-input span { font-size: 1.2rem; font-weight: 700; }
    .empty { text-align: center; color: var(--muted); padding: 24px; }
    .record-card { padding: 14px 18px; }
    .record-time { font-size: 0.8rem; color: var(--muted); margin-bottom: 6px; }
    .record-vitals { display: flex; gap: 16px; flex-wrap: wrap; }
    .record-vitals span { font-size: 0.9rem; }
  `]
})
export class HealthDashboardComponent implements OnInit {
  profileId = '';
  records: any[] = [];
  saving = false;

  vitals = [
    { icon: '❤️', label: 'Heart Rate', value: '--' },
    { icon: '🩺', label: 'Blood Pressure', value: '--' },
    { icon: '💨', label: 'Oxygen Level', value: '--' },
    { icon: '🌡️', label: 'Temperature', value: '--' },
    { icon: '😴', label: 'Sleep', value: '--' },
    { icon: '🏃', label: 'Steps', value: '--' }
  ];

  form: any = {
    heart_rate: null,
    blood_pressure_systolic: null,
    blood_pressure_diastolic: null,
    oxygen_level: null,
    temperature: null,
    sleep_hours: null
  };

  constructor(private route: ActivatedRoute, private api: ApiService) {}

  ngOnInit() {
    this.profileId = this.route.snapshot.paramMap.get('profileId') || '';
    this.loadRecords();
  }

  loadRecords() {
    this.api.getHealthRecords(this.profileId).subscribe({
      next: (data: any) => {
        this.records = data;
        if (data.length > 0) {
          const latest = data[0];
          this.vitals[0].value = latest.heart_rate || '--';
          this.vitals[1].value = latest.blood_pressure_systolic ? `${latest.blood_pressure_systolic}/${latest.blood_pressure_diastolic}` : '--';
          this.vitals[2].value = latest.oxygen_level ? `${latest.oxygen_level}%` : '--';
          this.vitals[3].value = latest.temperature ? `${latest.temperature}°F` : '--';
          this.vitals[4].value = latest.sleep_hours ? `${latest.sleep_hours}h` : '--';
          this.vitals[5].value = latest.steps ? `${latest.steps.toLocaleString()}` : '--';
        }
      },
      error: () => {}
    });
  }

  recordVitals() {
    this.saving = true;
    this.api.addHealthRecord(this.profileId, this.form).subscribe({
      next: () => {
        this.saving = false;
        this.form = { heart_rate: null, blood_pressure_systolic: null, blood_pressure_diastolic: null, oxygen_level: null, temperature: null, sleep_hours: null };
        this.loadRecords();
      },
      error: () => this.saving = false
    });
  }
}
