import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-emergency',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <!-- Emergency Banner -->
      <div class="emergency-banner">
        <div class="banner-content">
          <h1>&#128680; Emergency Support</h1>
          <p>Quick access to emergency contacts and first aid guidance</p>
        </div>
      </div>

      <!-- SOS Button -->
      <div class="sos-section">
        <button class="sos-button" (click)="triggerSOS()">
          <span class="sos-pulse-ring"></span>
          <span class="sos-pulse-ring delay"></span>
          <span class="sos-text">SOS</span>
        </button>
        <p class="sos-hint">Tap for emergency call options</p>
      </div>

      <!-- SOS Popup -->
      <div class="sos-overlay" *ngIf="showSOSPopup" (click)="closeSOS()">
        <div class="sos-popup" (click)="$event.stopPropagation()">
          <div class="sos-popup-header">
            <div class="sos-popup-icon">&#128680;</div>
            <h2>Emergency Services</h2>
            <p>Choose who to call</p>
          </div>
          <div class="sos-call-grid">
            <a *ngFor="let contact of sosContacts" [href]="'tel:' + contact.number" class="sos-call-card" [style.--accent]="contact.color">
              <span class="sos-call-icon">{{ contact.icon }}</span>
              <span class="sos-call-name">{{ contact.name }}</span>
              <span class="sos-call-number">{{ contact.number }}</span>
            </a>
          </div>
          <button class="sos-close-btn" (click)="closeSOS()">Cancel</button>

          <!-- SOS Steps (collapsible) -->
          <div class="sos-steps-section" *ngIf="emergencyData">
            <button class="sos-steps-toggle" (click)="showSteps = !showSteps">
              {{ showSteps ? '&#9650; Hide' : '&#9660; Show' }} Emergency Steps
            </button>
            <div class="sos-steps-body" *ngIf="showSteps">
              <ol class="sos-steps">
                <li *ngFor="let step of emergencyData.sosWorkflow?.steps">{{ step }}</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      <!-- Contacts Grid -->
      <div class="section" *ngIf="emergencyData">
        <h2 class="section-title">&#128222; Emergency Contacts (India)</h2>
        <div class="contacts-grid">
          <a href="tel:{{ contact.number }}" class="contact-card" *ngFor="let contact of contactsList">
            <span class="contact-icon">{{ contact.icon }}</span>
            <div class="contact-body">
              <strong>{{ contact.name }}</strong>
              <span class="contact-number">{{ contact.number }}</span>
            </div>
          </a>
        </div>
      </div>

      <!-- First Aid -->
      <div class="section" *ngIf="firstAid.length > 0">
        <h2 class="section-title">&#129657; First Aid Guide (Offline)</h2>
        <div class="aid-grid">
          <div class="card aid-card" *ngFor="let aid of firstAid">
            <h3>{{ aid.condition }}</h3>
            <ol>
              <li *ngFor="let step of aid.steps">{{ step }}</li>
            </ol>
          </div>
        </div>
      </div>

      <!-- Nearby Facilities -->
      <div class="section" *ngIf="emergencyData">
        <h2 class="section-title">&#127970; Nearby Facilities</h2>
        <p class="info">{{ emergencyData.nearbyFacilities?.note }}</p>
        <div class="facility-list">
          <div class="card facility-card" *ngFor="let f of emergencyData.nearbyFacilities?.sampleData">
            <strong>{{ f.name }}</strong>
            <span>{{ f.type }} &mdash; {{ f.distance }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { padding-bottom: 40px; }

    /* Banner */
    .emergency-banner {
      background: linear-gradient(135deg, var(--coral), #d63031);
      color: white;
      padding: 28px 24px;
      border-radius: 12px;
      margin-bottom: 20px;
    }
    .banner-content h1 { font-size: 1.5rem; margin-bottom: 4px; }
    .banner-content p { opacity: 0.9; font-size: 0.9rem; }

    /* SOS */
    @keyframes sosPulse { 0% { transform: scale(1); opacity: 0.6; } 100% { transform: scale(2.2); opacity: 0; } }
    .sos-section { text-align: center; margin-bottom: 24px; }
    .sos-button {
      position: relative;
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background: var(--coral);
      color: white;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      border: none;
      transition: transform 0.2s;
    }
    .sos-button:hover { transform: scale(1.08); }
    .sos-button:active { transform: scale(0.95); }
    .sos-pulse-ring {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      border-radius: 50%;
      border: 3px solid var(--coral);
      animation: sosPulse 2s ease-out infinite;
    }
    .sos-pulse-ring.delay { animation-delay: 1s; }
    .sos-text {
      font-size: 1.6rem;
      font-weight: 900;
      letter-spacing: 3px;
      z-index: 1;
    }
    .sos-hint { font-size: 0.82rem; color: var(--muted); margin-top: 10px; }

    /* SOS Popup */
    @keyframes sosSlideUp { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    .sos-overlay {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.6);
      backdrop-filter: blur(6px);
      z-index: 9999;
      display: flex; align-items: center; justify-content: center;
    }
    .sos-popup {
      background: white;
      border-radius: 20px;
      width: 92%; max-width: 440px;
      max-height: 85vh;
      overflow-y: auto;
      animation: sosSlideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    .sos-popup-header {
      background: linear-gradient(135deg, #FF6B4A, #d63031);
      color: white;
      padding: 24px;
      text-align: center;
      border-radius: 20px 20px 0 0;
    }
    .sos-popup-icon { font-size: 3rem; margin-bottom: 8px; }
    .sos-popup-header h2 { font-size: 1.3rem; margin-bottom: 4px; }
    .sos-popup-header p { font-size: 0.88rem; opacity: 0.85; }

    .sos-call-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      padding: 20px;
    }
    .sos-call-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      padding: 16px 10px;
      border-radius: 14px;
      background: var(--paper);
      border: 2px solid var(--line);
      text-decoration: none;
      color: var(--ink-text);
      transition: all 0.2s;
    }
    .sos-call-card:hover {
      border-color: var(--accent, var(--coral));
      background: white;
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(255,107,74,0.15);
    }
    .sos-call-card:active { transform: scale(0.96); }
    .sos-call-icon { font-size: 2rem; }
    .sos-call-name { font-size: 0.82rem; font-weight: 600; }
    .sos-call-number {
      font-size: 1.15rem; font-weight: 800;
      color: var(--coral);
      letter-spacing: 1px;
    }

    .sos-close-btn {
      display: block;
      width: calc(100% - 40px);
      margin: 0 20px 16px;
      padding: 12px;
      border-radius: 10px;
      border: 1px solid var(--line);
      background: var(--paper);
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      color: var(--muted);
      transition: all 0.2s;
    }
    .sos-close-btn:hover { background: white; border-color: var(--coral); color: var(--coral); }

    .sos-steps-section { padding: 0 20px 20px; }
    .sos-steps-toggle {
      width: 100%;
      padding: 10px;
      border-radius: 8px;
      border: 1px dashed var(--line);
      background: transparent;
      font-size: 0.85rem;
      color: var(--muted);
      cursor: pointer;
      transition: all 0.2s;
    }
    .sos-steps-toggle:hover { border-color: var(--coral); color: var(--coral); }
    .sos-steps-body { margin-top: 12px; }
    .sos-steps { padding-left: 20px; }
    .sos-steps li { margin-bottom: 6px; font-size: 0.88rem; line-height: 1.5; }

    /* Sections */
    .section { margin-bottom: 24px; }
    .section-title { font-size: 1.1rem; font-weight: 600; margin-bottom: 12px; }
    .info { color: var(--muted); font-size: 0.85rem; margin-bottom: 10px; font-style: italic; }

    /* Contacts */
    .contacts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 10px;
    }
    .contact-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 16px;
      background: white;
      border: 1px solid var(--line);
      border-radius: 10px;
      text-decoration: none;
      color: inherit;
      transition: all 0.2s;
    }
    .contact-card:hover {
      border-color: var(--coral);
      box-shadow: 0 2px 8px rgba(255,107,74,0.1);
      transform: translateY(-1px);
    }
    .contact-icon { font-size: 1.4rem; }
    .contact-body { display: flex; flex-direction: column; }
    .contact-body strong { font-size: 0.85rem; }
    .contact-number {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--ink);
      margin-top: 2px;
    }

    /* First Aid */
    .aid-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 12px;
    }
    .aid-card h3 {
      font-size: 0.95rem;
      margin-bottom: 8px;
      color: var(--ink);
    }
    .aid-card ol {
      padding-left: 18px;
    }
    .aid-card li {
      font-size: 0.85rem;
      margin-bottom: 4px;
      line-height: 1.5;
    }

    /* Facilities */
    .facility-list { display: grid; gap: 8px; }
    .facility-card {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
    }
    .facility-card strong { font-size: 0.9rem; }
    .facility-card span { font-size: 0.85rem; color: var(--muted); }

    @media (max-width: 600px) {
      .contacts-grid { grid-template-columns: 1fr 1fr; }
      .aid-grid { grid-template-columns: 1fr; }
      .sos-call-grid { grid-template-columns: repeat(2, 1fr); }
    }
  `]
})
export class EmergencyComponent implements OnInit {
  emergencyData: any = null;
  firstAid: any[] = [];
  showSOSPopup = false;
  showSteps = false;

  sosContacts = [
    { name: 'Ambulance', number: '108', icon: '🚑', color: '#EF4444' },
    { name: 'Police', number: '100', icon: '🚔', color: '#3B82F6' },
    { name: 'Fire', number: '101', icon: '🚒', color: '#F97316' },
    { name: 'Disaster', number: '112', icon: '🆘', color: '#8B5CF6' },
    { name: 'Health Helpline', number: '104', icon: '🏥', color: '#10B981' },
    { name: 'Women Helpline', number: '1091', icon: '👩', color: '#EC4899' },
  ];

  contactsList = [
    { name: 'Ambulance', number: '108', icon: '🚑' },
    { name: 'Police', number: '100', icon: '🚔' },
    { name: 'Fire', number: '101', icon: '🚒' },
    { name: 'Health Helpline', number: '104', icon: '📞' },
    { name: 'Women Helpline', number: '1091', icon: '👩' },
    { name: 'Child Helpline', number: '1098', icon: '👶' },
    { name: 'Disaster', number: '112', icon: '⚠️' }
  ];

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getEmergencyData().subscribe({
      next: (data: any) => this.emergencyData = data,
      error: () => {}
    });
    this.api.getFirstAid().subscribe({
      next: (data: any) => this.firstAid = data,
      error: () => {}
    });
  }

  triggerSOS() {
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100, 50, 200]);
    }
    this.showSOSPopup = true;
  }

  closeSOS() {
    this.showSOSPopup = false;
    this.showSteps = false;
  }
}
