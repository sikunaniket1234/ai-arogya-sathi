import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-profiles',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page">
      <div class="section-header">
        <h1>Family Profiles</h1>
        <button class="btn btn-primary btn-sm" (click)="showForm = !showForm">
          {{ showForm ? 'Cancel' : '+ Add Member' }}
        </button>
      </div>

      <!-- Add/Edit Form -->
      <div class="form-card card" *ngIf="showForm">
        <h3>{{ editingId ? 'Edit Profile' : 'Add Family Member' }}</h3>
        <form (ngSubmit)="saveProfile()">
          <div class="form-grid">
            <div class="form-group">
              <label>Name</label>
              <input type="text" [(ngModel)]="form.name" name="name" required placeholder="Full name">
            </div>
            <div class="form-group">
              <label>Age</label>
              <input type="number" [(ngModel)]="form.age" name="age" min="0" max="150" placeholder="Age">
            </div>
            <div class="form-group">
              <label>Blood Group</label>
              <select [(ngModel)]="form.blood_group" name="blood_group">
                <option value="">Select</option>
                <option *ngFor="let bg of bloodGroups" [value]="bg">{{ bg }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Gender</label>
              <select [(ngModel)]="form.gender" name="gender">
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>Medical Conditions</label>
            <input type="text" [(ngModel)]="conditionsText" name="conditions" placeholder="e.g. Diabetes, Hypertension (comma separated)">
          </div>
          <div class="form-group">
            <label>Allergies</label>
            <input type="text" [(ngModel)]="allergiesText" name="allergies" placeholder="e.g. Penicillin, Peanuts (comma separated)">
          </div>
          <div class="form-grid">
            <div class="form-group">
              <label>Emergency Contact Name</label>
              <input type="text" [(ngModel)]="form.emergency_contact_name" name="ec_name" placeholder="Contact name">
            </div>
            <div class="form-group">
              <label>Emergency Contact Phone</label>
              <input type="tel" [(ngModel)]="form.emergency_contact_phone" name="ec_phone" placeholder="Phone number">
            </div>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary" [disabled]="saving">
              {{ saving ? 'Saving...' : (editingId ? 'Update Profile' : 'Add Member') }}
            </button>
          </div>
        </form>
      </div>

      <!-- Empty State -->
      <div class="empty" *ngIf="profiles.length === 0 && !loading">
        <div class="empty-icon">&#128100;</div>
        <p>No family profiles yet.</p>
        <button class="btn btn-primary btn-sm" (click)="showForm = true">Add Your First Member</button>
      </div>

      <!-- Profile List -->
      <div class="profile-grid">
        <div class="profile-card" *ngFor="let p of profiles">
          <div class="profile-header">
            <div class="profile-avatar" [style.background]="getAvatarColor(p.name)">{{ p.name.charAt(0) }}</div>
            <div class="profile-info">
              <strong>{{ p.name }}</strong>
              <span>{{ p.age }} yrs &middot; {{ p.gender || 'N/A' }} &middot; {{ p.blood_group || 'N/A' }}</span>
            </div>
          </div>

          <div class="profile-details" *ngIf="p.conditions?.length || p.allergies?.length">
            <div class="detail-row" *ngIf="p.conditions?.length">
              <span class="detail-label">Conditions:</span>
              <span>{{ p.conditions.join(', ') }}</span>
            </div>
            <div class="detail-row" *ngIf="p.allergies?.length">
              <span class="detail-label">Allergies:</span>
              <span>{{ p.allergies.join(', ') }}</span>
            </div>
          </div>

          <div class="profile-emergency" *ngIf="p.emergency_contact_name">
            <span class="detail-label">Emergency:</span>
            {{ p.emergency_contact_name }} &mdash; {{ p.emergency_contact_phone }}
          </div>

          <div class="profile-actions">
            <a [routerLink]="['/symptom', p.id]" class="action-btn primary">&#9837; Symptom Check</a>
            <a [routerLink]="['/medical-card', p.id]" class="action-btn">&#128179; Medical Card</a>
            <button class="action-btn" (click)="editProfile(p)">&#9998; Edit</button>
            <button class="action-btn danger" (click)="deleteProfile(p.id)">&#10005; Delete</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { padding-bottom: 40px; }

    .form-card h3 { margin-bottom: 16px; font-size: 1.1rem; }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
    }
    .form-actions {
      margin-top: 8px;
    }

    .empty {
      text-align: center;
      padding: 48px 20px;
    }
    .empty-icon {
      font-size: 2.5rem;
      margin-bottom: 12px;
      opacity: 0.4;
    }
    .empty p {
      margin-bottom: 14px;
    }

    .profile-grid {
      display: grid;
      gap: 12px;
    }
    .profile-card {
      background: white;
      border: 1px solid var(--line);
      border-radius: 12px;
      padding: 18px;
      transition: box-shadow 0.2s;
    }
    .profile-card:hover { box-shadow: 0 2px 8px rgba(14,31,27,0.06); }

    .profile-header {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 14px;
    }
    .profile-avatar {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1.1rem;
      flex-shrink: 0;
    }
    .profile-info {
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    .profile-info strong { font-size: 0.95rem; }
    .profile-info span { font-size: 0.82rem; color: var(--muted); }

    .profile-details {
      margin-bottom: 10px;
      font-size: 0.85rem;
      color: var(--muted);
    }
    .detail-row {
      display: flex;
      gap: 6px;
      margin-bottom: 4px;
    }
    .detail-label {
      font-weight: 600;
      color: var(--ink-text);
      flex-shrink: 0;
    }

    .profile-emergency {
      font-size: 0.85rem;
      color: var(--muted);
      margin-bottom: 14px;
      padding: 8px 12px;
      background: rgba(255,107,74,0.04);
      border-radius: 6px;
      border-left: 3px solid var(--coral);
    }

    .profile-actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    .action-btn {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 6px 12px;
      font-size: 0.78rem;
      font-weight: 500;
      color: var(--ink-text);
      background: var(--paper);
      border: 1px solid var(--line);
      border-radius: 6px;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.15s;
    }
    .action-btn:hover {
      background: var(--paper-dim);
      border-color: var(--marigold);
    }
    .action-btn.primary {
      background: var(--marigold);
      color: var(--ink);
      border-color: var(--marigold);
      font-weight: 600;
    }
    .action-btn.danger {
      color: var(--coral);
    }
    .action-btn.danger:hover {
      background: rgba(255,107,74,0.06);
      border-color: var(--coral);
    }

    @media (max-width: 600px) {
      .form-grid { grid-template-columns: 1fr; }
      .profile-actions { flex-direction: column; }
      .action-btn { justify-content: center; }
    }
  `],
})
export class ProfilesComponent implements OnInit {
  profiles: any[] = [];
  loading = true;
  showForm = false;
  saving = false;
  editingId: string | null = null;
  conditionsText = '';
  allergiesText = '';
  bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  private avatarColors = ['#0E1F1B', '#16302A', '#2563EB', '#9333EA', '#0891B2', '#059669', '#D97706', '#DC2626'];

  form: any = {
    name: '', age: null, blood_group: '', gender: '',
    emergency_contact_name: '', emergency_contact_phone: '',
  };

  constructor(private api: ApiService) {}

  ngOnInit() { this.loadProfiles(); }

  getAvatarColor(name: string): string {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return this.avatarColors[Math.abs(hash) % this.avatarColors.length];
  }

  loadProfiles() {
    this.loading = true;
    this.api.getProfiles().subscribe({
      next: (data: any) => { this.profiles = data; this.loading = false; },
      error: () => (this.loading = false),
    });
  }

  editProfile(p: any) {
    this.editingId = p.id;
    this.form = { ...p };
    this.conditionsText = p.conditions?.join(', ') || '';
    this.allergiesText = p.allergies?.join(', ') || '';
    this.showForm = true;
  }

  saveProfile() {
    this.saving = true;
    const data = {
      ...this.form,
      conditions: this.conditionsText ? this.conditionsText.split(',').map((s: string) => s.trim()) : [],
      allergies: this.allergiesText ? this.allergiesText.split(',').map((s: string) => s.trim()) : [],
    };
    const req = this.editingId
      ? this.api.updateProfile(this.editingId, data)
      : this.api.createProfile(data);
    req.subscribe({
      next: () => {
        this.showForm = false;
        this.editingId = null;
        this.resetForm();
        this.loadProfiles();
        this.saving = false;
      },
      error: () => (this.saving = false),
    });
  }

  deleteProfile(id: string) {
    if (!confirm('Delete this profile? This cannot be undone.')) return;
    this.api.deleteProfile(id).subscribe(() => this.loadProfiles());
  }

  private resetForm() {
    this.form = { name: '', age: null, blood_group: '', gender: '', emergency_contact_name: '', emergency_contact_phone: '' };
    this.conditionsText = '';
    this.allergiesText = '';
  }
}
