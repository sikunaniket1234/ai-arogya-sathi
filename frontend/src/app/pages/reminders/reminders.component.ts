import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-reminders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="reminders-page">
      <h1>Medicine Reminders</h1>
      <p class="sub">Track and manage medication schedules</p>

      <div class="section">
        <div class="section-header">
          <h2>Active Medicines</h2>
          <button class="btn btn-primary" (click)="showForm = !showForm">
            {{ showForm ? 'Cancel' : '+ Add Medicine' }}
          </button>
        </div>

        <div class="form-card card" *ngIf="showForm">
          <form (ngSubmit)="addMedicine()">
            <div class="grid-2">
              <div class="form-group">
                <label>Medicine Name</label>
                <input type="text" [(ngModel)]="form.medicine_name" name="name" required placeholder="e.g. Paracetamol">
              </div>
              <div class="form-group">
                <label>Dosage</label>
                <input type="text" [(ngModel)]="form.dosage" name="dosage" placeholder="e.g. 500mg">
              </div>
              <div class="form-group">
                <label>Frequency</label>
                <select [(ngModel)]="form.frequency" name="frequency">
                  <option value="once_daily">Once Daily</option>
                  <option value="twice_daily">Twice Daily</option>
                  <option value="thrice_daily">Three Times Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="as_needed">As Needed</option>
                </select>
              </div>
              <div class="form-group">
                <label>Schedule Time</label>
                <input type="time" [(ngModel)]="form.schedule_time" name="time">
              </div>
            </div>
            <button type="submit" class="btn btn-primary" [disabled]="saving">
              {{ saving ? 'Adding...' : 'Add Medicine' }}
            </button>
          </form>
        </div>

        <div class="empty card" *ngIf="medicines.length === 0 && !loading">
          <p>No active medicines. Add a medicine to set up reminders.</p>
        </div>

        <div class="medicine-card card" *ngFor="let m of medicines">
          <div class="medicine-header">
            <div class="medicine-icon">💊</div>
            <div class="medicine-info">
              <strong>{{ m.medicine_name }}</strong>
              <span>{{ m.dosage || 'No dosage set' }} | {{ formatFrequency(m.frequency) }}</span>
              <span *ngIf="m.schedule_time">⏰ {{ m.schedule_time }}</span>
            </div>
            <div class="medicine-actions">
              <button class="btn btn-primary" (click)="markTaken(m.id)">Mark Taken</button>
              <button class="btn btn-danger" (click)="removeMedicine(m.id)">Remove</button>
            </div>
          </div>
        </div>
      </div>

      <div class="section" *ngIf="adherenceStats.length > 0">
        <h2>Adherence Report</h2>
        <div class="stats-grid">
          <div class="stat-card card" *ngFor="let stat of adherenceStats">
            <div class="stat-name">{{ stat.medicine_name }}</div>
            <div class="stat-bar">
              <div class="stat-fill" [style.width.%]="stat.adherence_percent"></div>
            </div>
            <div class="stat-details">
              {{ stat.taken_doses }}/{{ stat.total_doses }} doses
              <span class="stat-percent">{{ stat.adherence_percent }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .reminders-page h1 { font-size: 1.5rem; margin-bottom: 4px; }
    .sub { color: var(--muted); margin-bottom: 20px; }
    .section { margin-bottom: 32px; }
    .section-header {
      display: flex; justify-content: space-between;
      align-items: center; margin-bottom: 16px;
    }
    .section-header h2 { font-size: 1.2rem; }
    .empty { text-align: center; color: var(--muted); padding: 32px; }
    .form-card { margin-bottom: 16px; }
    .medicine-header {
      display: flex; align-items: center; gap: 14px;
    }
    .medicine-icon { font-size: 1.8rem; }
    .medicine-info { flex: 1; display: flex; flex-direction: column; }
    .medicine-info span { font-size: 0.85rem; color: var(--muted); }
    .medicine-actions { display: flex; gap: 8px; }
    .stats-grid { display: grid; gap: 12px; }
    .stat-name { font-weight: 600; margin-bottom: 8px; }
    .stat-bar {
      height: 8px; background: var(--paper-dim);
      border-radius: 4px; overflow: hidden; margin-bottom: 6px;
    }
    .stat-fill {
      height: 100%; background: var(--green);
      border-radius: 4px; transition: width 0.3s;
    }
    .stat-details { font-size: 0.85rem; color: var(--muted); }
    .stat-percent { font-weight: 700; color: var(--ink); margin-left: 8px; }
  `]
})
export class RemindersComponent implements OnInit {
  profileId = '';
  medicines: any[] = [];
  adherenceStats: any[] = [];
  loading = true;
  showForm = false;
  saving = false;

  form = {
    medicine_name: '',
    dosage: '',
    frequency: 'once_daily',
    schedule_time: ''
  };

  constructor(private route: ActivatedRoute, private api: ApiService) {}

  ngOnInit() {
    this.profileId = this.route.snapshot.paramMap.get('profileId') || '';
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.api.getMedicines(this.profileId).subscribe({
      next: (data: any) => { this.medicines = data; this.loading = false; },
      error: () => this.loading = false
    });
    this.api.getAdherence(this.profileId).subscribe({
      next: (data: any) => this.adherenceStats = data,
      error: () => {}
    });
  }

  addMedicine() {
    this.saving = true;
    this.api.addMedicine(this.profileId, this.form).subscribe({
      next: () => {
        this.showForm = false;
        this.saving = false;
        this.form = { medicine_name: '', dosage: '', frequency: 'once_daily', schedule_time: '' };
        this.loadData();
      },
      error: () => this.saving = false
    });
  }

  markTaken(medicineId: string) {
    this.api.markDoseTaken(medicineId).subscribe(() => this.loadData());
  }

  removeMedicine(medicineId: string) {
    if (!confirm('Remove this medicine?')) return;
    this.api.deleteMedicine(medicineId).subscribe(() => this.loadData());
  }

  formatFrequency(freq: string): string {
    const map: any = {
      once_daily: 'Once daily',
      twice_daily: 'Twice daily',
      thrice_daily: 'Three times daily',
      weekly: 'Weekly',
      as_needed: 'As needed'
    };
    return map[freq] || freq;
  }
}
