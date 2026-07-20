import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-medical-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="medical-card-page" *ngIf="card">
      <div class="card-top">
        <a routerLink="/profiles" class="back-link">&larr; Back to Profiles</a>
        <button class="btn btn-secondary" (click)="printCard()">Print Card</button>
      </div>

      <div class="card-container" id="printable-card">
        <div class="medical-id-card">
          <div class="card-header-bar">
            <span class="card-logo">&#10010;</span>
            <div class="card-title">
              <strong>MEDICAL ID CARD</strong>
              <span>AI Arogya Sathi</span>
            </div>
          </div>

          <div class="card-body">
            <div class="card-left">
              <div class="qr-section">
                <img *ngIf="qrDataUrl" [src]="qrDataUrl" class="qr-image" alt="Medical QR Code">
                <span class="qr-hint">Scan for full medical info</span>
              </div>
            </div>
            <div class="card-right">
              <div class="field-row name-row">{{ card.name }}</div>
              <div class="field-grid">
                <div class="field">
                  <span class="field-label">Age</span>
                  <span class="field-value">{{ card.age || '--' }}</span>
                </div>
                <div class="field">
                  <span class="field-label">Gender</span>
                  <span class="field-value">{{ card.gender || '--' }}</span>
                </div>
                <div class="field blood-field">
                  <span class="field-label">Blood Group</span>
                  <span class="field-value blood-value">{{ card.blood || '--' }}</span>
                </div>
              </div>

              <div class="field" *ngIf="card.conditions?.length">
                <span class="field-label">Conditions</span>
                <span class="field-value conditions">{{ card.conditions.join(', ') }}</span>
              </div>

              <div class="field" *ngIf="card.allergies?.length">
                <span class="field-label">Allergies</span>
                <span class="field-value allergies">{{ card.allergies.join(', ') }}</span>
              </div>

              <div class="field" *ngIf="card.medications?.length">
                <span class="field-label">Medications</span>
                <span class="field-value medications">{{ card.medications.join(', ') }}</span>
              </div>

              <div class="emergency-row">
                <span class="emergency-label">EMERGENCY CONTACT</span>
                <span class="emergency-name">{{ card.emergency?.name }}</span>
                <span class="emergency-phone">{{ card.emergency?.phone }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card-info" *ngIf="!fromToken">
        <h3>How to Use Your Medical Card</h3>
        <ul>
          <li>Print this card and keep it in your wallet</li>
          <li>Share the QR code link so family members can scan it</li>
          <li>In emergencies, medical personnel can scan the QR code to see your conditions, allergies, and emergency contact</li>
          <li>The QR code works with any phone camera — no app needed</li>
        </ul>
      </div>
    </div>

    <div class="loading-state" *ngIf="loading">
      <p>Loading medical card...</p>
    </div>

    <div class="error-state" *ngIf="error">
      <p>{{ error }}</p>
      <a routerLink="/profiles" class="btn btn-secondary">Back to Profiles</a>
    </div>
  `,
  styles: [`
    .medical-card-page { padding-bottom: 40px; }
    .card-top {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 24px;
    }
    .back-link { color: var(--ink-text); text-decoration: none; font-size: 0.9rem; }
    .back-link:hover { text-decoration: underline; }

    .card-container { display: flex; justify-content: center; margin-bottom: 32px; }

    .medical-id-card {
      width: 100%; max-width: 600px;
      border: 2px solid var(--ink); border-radius: 14px;
      overflow: hidden; background: white;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }
    .card-header-bar {
      display: flex; align-items: center; gap: 12px;
      background: var(--ink); color: white;
      padding: 14px 20px;
    }
    .card-logo { font-size: 1.8rem; }
    .card-title { display: flex; flex-direction: column; }
    .card-title strong { font-size: 1rem; letter-spacing: 2px; }
    .card-title span { font-size: 0.75rem; opacity: 0.8; }

    .card-body {
      display: flex; gap: 20px; padding: 20px;
    }
    .card-left { flex-shrink: 0; }
    .qr-section { text-align: center; }
    .qr-image { width: 140px; height: 140px; border-radius: 8px; border: 1px solid #ddd; }
    .qr-hint { display: block; font-size: 0.7rem; color: var(--muted); margin-top: 4px; }

    .card-right { flex: 1; min-width: 0; }
    .name-row { font-size: 1.3rem; font-weight: 700; margin-bottom: 10px; color: var(--ink); }
    .field-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 12px; }
    .field { margin-bottom: 8px; }
    .field-label {
      display: block; font-size: 0.68rem; text-transform: uppercase;
      letter-spacing: 0.5px; color: var(--muted); font-weight: 600; margin-bottom: 2px;
    }
    .field-value { font-size: 0.88rem; font-weight: 500; }
    .blood-value {
      font-size: 1.2rem; font-weight: 700; color: var(--coral);
    }
    .conditions { color: #a16207; }
    .allergies { color: #c0392b; }
    .medications { color: #2980b9; }

    .emergency-row {
      margin-top: 12px; padding-top: 10px;
      border-top: 2px solid var(--coral);
      display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
    }
    .emergency-label {
      font-size: 0.7rem; font-weight: 700; color: var(--coral);
      letter-spacing: 1px;
    }
    .emergency-name { font-weight: 600; font-size: 0.9rem; }
    .emergency-phone { font-weight: 700; font-size: 1rem; color: var(--coral); }

    .card-info {
      max-width: 600px; margin: 0 auto;
      background: var(--paper); padding: 20px; border-radius: 10px;
    }
    .card-info h3 { font-size: 1rem; margin-bottom: 12px; }
    .card-info li { font-size: 0.88rem; color: var(--muted); margin-bottom: 6px; }

    .loading-state, .error-state {
      text-align: center; padding: 60px 20px; color: var(--muted);
    }
    .error-state .btn { margin-top: 12px; }

    @media print {
      .card-top, .card-info { display: none !important; }
      .medical-id-card { box-shadow: none; border: 1px solid #000; }
    }
  `]
})
export class MedicalCardComponent implements OnInit {
  card: any = null;
  qrDataUrl: string = '';
  loading = true;
  error = '';
  fromToken = false;

  constructor(private route: ActivatedRoute, private api: ApiService) {}

  ngOnInit() {
    const token = this.route.snapshot.paramMap.get('token');
    const profileId = this.route.snapshot.paramMap.get('profileId');

    if (token) {
      this.fromToken = true;
      this.loadByToken(token);
    } else if (profileId) {
      this.loadByProfile(profileId);
    }
  }

  loadByToken(token: string) {
    this.api.getMedicalCardQR(token).subscribe({
      next: (data: any) => {
        this.card = data.card;
        this.qrDataUrl = data.qr;
        this.loading = false;
      },
      error: () => {
        this.error = 'Invalid or expired medical card.';
        this.loading = false;
      }
    });
  }

  loadByProfile(profileId: string) {
    this.api.getMedicalCard(profileId).subscribe({
      next: (data: any) => {
        this.card = data.card;
        this.qrDataUrl = data.qr;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load medical card.';
        this.loading = false;
      }
    });
  }

  printCard() {
    window.print();
  }
}
