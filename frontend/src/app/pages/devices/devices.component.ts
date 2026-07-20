import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { BluetoothService, VitalReading } from '../../services/bluetooth.service';
import { SimulatedDeviceService } from '../../services/simulated-device.service';
import { GoogleFitService, FitDataPoint } from '../../services/google-fit.service';
import { ApiService } from '../../services/api.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-devices',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page">
      <div class="section-header">
        <div>
          <h1>Device Connections</h1>
          <p class="sub">Connect wearables and health devices</p>
        </div>
      </div>

      <!-- Sync target -->
      <div class="sync-bar card">
        <div class="sync-row">
          <label class="hide-mobile">Sync data to:</label>
          <select [(ngModel)]="selectedProfileId" (ngModelChange)="onProfileChange()">
            <option value="">Select a family member</option>
            <option *ngFor="let p of profiles" [value]="p.id">{{ p.name }} ({{ p.age }}y)</option>
          </select>
          <span class="sync-count" *ngIf="syncCount > 0">
            <span class="sync-dot"></span> {{ syncCount }} synced
          </span>
        </div>
        <div class="profile-warning" *ngIf="showProfileWarning">
          Please select a family member before syncing data.
        </div>
      </div>

      <!-- Method Tabs -->
      <div class="method-grid">
        <button class="method-tab" [class.active]="activeMethod === 'ble'" (click)="activeMethod = 'ble'">
          <span class="method-icon">&#128225;</span>
          <span class="method-name">Bluetooth</span>
          <span class="method-status" [class.connected]="bleConnected">{{ bleConnected ? 'Connected' : 'Available' }}</span>
        </button>
        <button class="method-tab" [class.active]="activeMethod === 'google'" (click)="activeMethod = 'google'">
          <span class="method-icon">&#128202;</span>
          <span class="method-name">Google Fit</span>
          <span class="method-status" [class.connected]="googleFitConnected">{{ googleFitConnected ? 'Connected' : 'Available' }}</span>
        </button>
        <button class="method-tab" [class.active]="activeMethod === 'sim'" (click)="activeMethod = 'sim'">
          <span class="method-icon">&#129514;</span>
          <span class="method-name">Simulated</span>
          <span class="method-status" [class.connected]="simRunning">{{ simRunning ? 'Running' : 'Testing' }}</span>
        </button>
      </div>

      <!-- No Device Message -->
      <div class="empty" *ngIf="!isAnyDeviceConnected && activeMethod !== 'sim'">
        <div class="empty-icon">&#128225;</div>
        <p>No device connected</p>
        <span>Select a method above and connect to start receiving vital sign data</span>
      </div>

      <!-- BLE Section -->
      <div class="card" *ngIf="activeMethod === 'ble'">
        <h2 class="card-title">Bluetooth Devices</h2>
        <div class="warning" *ngIf="!bleSupported">
          Web Bluetooth is not supported in this browser. Use Chrome or Edge.
        </div>
        <div class="ble-actions" *ngIf="bleSupported">
          <button class="btn btn-primary" (click)="connectBLE()" [disabled]="bleScanning || bleConnected">
            {{ bleScanning ? 'Scanning...' : bleConnected ? 'Connected' : 'Scan for Devices' }}
          </button>
          <button class="btn btn-danger btn-sm" *ngIf="bleConnected" (click)="disconnectBLE()">Disconnect</button>
        </div>
        <div class="device-list">
          <div class="device-item" *ngFor="let d of bleDevices">
            <span class="device-icon">{{ d.icon }}</span>
            <div class="device-info">
              <strong>{{ d.name }}</strong>
              <span>{{ d.type }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Google Fit Section -->
      <div class="card" *ngIf="activeMethod === 'google'">
        <h2 class="card-title">Google Fit Integration</h2>
        <div class="warning" *ngIf="!googleFitConfigured">
          Google Fit requires configuration. Contact the administrator.
        </div>
        <p class="info" *ngIf="googleFitConfigured">Sync health data from Google Fit, Wear OS, NoiseFit, Fitbit, and compatible devices.</p>
        <div class="fit-actions">
          <button class="btn btn-primary" (click)="connectGoogleFit()" *ngIf="!googleFitConnected" [disabled]="googleFitConnecting">
            {{ googleFitConnecting ? 'Connecting...' : 'Connect Google Fit' }}
          </button>
          <button class="btn btn-danger btn-sm" *ngIf="googleFitConnected" (click)="disconnectGoogleFit()">Disconnect</button>
          <button class="btn btn-outline btn-sm" *ngIf="googleFitConnected" (click)="syncGoogleFitData()" [disabled]="googleFitSyncing">
            {{ googleFitSyncing ? 'Syncing...' : 'Sync Now' }}
          </button>
          <label class="auto-poll-toggle" *ngIf="googleFitConnected">
            <input type="checkbox" [checked]="autoPollEnabled" (change)="toggleAutoPoll()">
            <span class="toggle-slider"></span>
            <span class="toggle-label">Auto-sync (5 min)</span>
          </label>
        </div>

        <!-- Fit Summary -->
        <div class="fit-summary" *ngIf="googleFitConnected && fitSummary">
          <h3>Last 7 Days</h3>
          <div class="summary-grid">
            <div class="summary-card">
              <span class="summary-val">{{ fitSummary.avgHeartRate || '--' }}</span>
              <span class="summary-label">Avg Heart Rate</span>
            </div>
            <div class="summary-card">
              <span class="summary-val">{{ fitSummary.totalSteps || '--' }}</span>
              <span class="summary-label">Total Steps</span>
            </div>
            <div class="summary-card">
              <span class="summary-val">{{ fitSummary.avgSleep || '--' }}</span>
              <span class="summary-label">Avg Sleep (h)</span>
            </div>
            <div class="summary-card">
              <span class="summary-val">{{ fitDataPoints.length }}</span>
              <span class="summary-label">Data Points</span>
            </div>
          </div>
        </div>

        <!-- Fit Data List -->
        <div class="fit-list" *ngIf="googleFitConnected && fitDataPoints.length > 0">
          <h3>Recent Readings</h3>
          <div class="fit-item" *ngFor="let dp of fitDataPoints.slice(-10).reverse()">
            <span class="fit-icon">{{ getFitIcon(dp.dataType) }}</span>
            <span class="fit-value">{{ dp.value }} {{ dp.unit }}</span>
            <span class="fit-type">{{ dp.dataType }}</span>
            <span class="fit-time">{{ dp.timestamp | date:'short' }}</span>
          </div>
        </div>
      </div>

      <!-- Simulated Section -->
      <div class="card" *ngIf="activeMethod === 'sim'">
        <h2 class="card-title">Simulated Device <span class="sim-tag">Testing Only</span></h2>
        <p class="info">Generate realistic vital sign data for testing. No real device needed.</p>
        <div class="sim-actions">
          <button class="btn btn-primary" (click)="startSimulation()" *ngIf="!simRunning">Start Simulation</button>
          <button class="btn btn-danger" (click)="stopSimulation()" *ngIf="simRunning">Stop Simulation</button>
        </div>
        <div class="live-vital" *ngIf="latestVital">
          <span class="live-type">{{ latestVital.type }}</span>
          <span class="live-value">{{ latestVital.value }} {{ latestVital.unit }}</span>
          <span class="live-time">{{ latestVital.timestamp | date:'medium' }}</span>
        </div>
      </div>

      <!-- Live Stream -->
      <div class="card" *ngIf="liveVitals.length > 0">
        <h2 class="card-title">Live Vital Stream</h2>
        <div class="stream-list">
          <div class="stream-item" *ngFor="let v of liveVitals.slice(-8).reverse()">
            <span class="stream-icon">{{ getTypeIcon(v.type) }}</span>
            <span class="stream-value">{{ v.value }} {{ v.unit }}</span>
            <span class="stream-time">{{ v.timestamp | date:'medium' }}</span>
          </div>
        </div>
      </div>

      <!-- Sync Result Popup -->
      <div class="popup-overlay" *ngIf="syncResult" (click)="closeSyncResult()">
        <div class="popup-card" (click)="$event.stopPropagation()">
          <div class="popup-header">
            <span class="popup-icon">&#9989;</span>
            <h2>Sync Complete</h2>
          </div>
          <p class="popup-sub">Data fetched from Google Fit for the last 7 days</p>
          <div class="popup-stats">
            <div class="popup-stat">
              <span class="popup-stat-icon">&#10084;&#65039;</span>
              <div class="popup-stat-info">
                <span class="popup-stat-val">{{ syncResult.avgHeartRate || '--' }}</span>
                <span class="popup-stat-label">Avg Heart Rate (bpm)</span>
              </div>
            </div>
            <div class="popup-stat">
              <span class="popup-stat-icon">&#127939;</span>
              <div class="popup-stat-info">
                <span class="popup-stat-val">{{ syncResult.totalSteps?.toLocaleString() || '--' }}</span>
                <span class="popup-stat-label">Total Steps</span>
              </div>
            </div>
            <div class="popup-stat">
              <span class="popup-stat-icon">&#128164;</span>
              <div class="popup-stat-info">
                <span class="popup-stat-val">{{ syncResult.avgSleep || '--' }}</span>
                <span class="popup-stat-label">Avg Sleep (hours)</span>
              </div>
            </div>
            <div class="popup-stat">
              <span class="popup-stat-icon">&#128202;</span>
              <div class="popup-stat-info">
                <span class="popup-stat-val">{{ syncResult.dataPoints }}</span>
                <span class="popup-stat-label">Data Points Synced</span>
              </div>
            </div>
          </div>
          <div class="popup-actions">
            <button class="btn btn-primary popup-btn" (click)="goToTrends()">View Trends &#8594;</button>
            <button class="btn btn-outline popup-btn" (click)="closeSyncResult()">Close</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { padding-bottom: 40px; }
    .sub { color: var(--muted); font-size: 0.88rem; margin-top: 2px; }

    /* Sync bar */
    .sync-bar { padding: 12px 16px; }
    .sync-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
    .sync-row label { font-size: 0.88rem; font-weight: 600; white-space: nowrap; }
    .sync-row select {
      padding: 7px 12px; border: 1px solid var(--line);
      border-radius: 8px; font-size: 0.88rem; min-width: 180px;
    }
    .sync-count {
      display: flex; align-items: center; gap: 6px;
      font-size: 0.8rem; color: #1a7a3a; font-weight: 500;
    }
    .sync-dot {
      width: 6px; height: 6px; border-radius: 50%;
      background: #1a7a3a;
    }

    /* Method Grid */
    .method-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      margin-bottom: 16px;
    }
    .method-tab {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      padding: 14px 10px;
      background: white;
      border: 2px solid var(--line);
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s;
      text-align: center;
    }
    .method-tab:hover { border-color: var(--muted); }
    .method-tab.active { border-color: var(--marigold); background: rgba(232,163,61,0.03); }
    .method-icon { font-size: 1.4rem; }
    .method-name { font-size: 0.82rem; font-weight: 600; color: var(--ink); }
    .method-status {
      font-size: 0.7rem; padding: 2px 8px; border-radius: 10px;
      background: var(--paper); color: var(--muted);
    }
    .method-status.connected { background: #e6f7ed; color: #1a7a3a; }

    /* Card title */
    .card-title { font-size: 1.05rem; margin-bottom: 12px; }

    /* Warning */
    .warning {
      background: #fff8e6; padding: 12px; border-radius: 8px;
      color: #92400e; font-size: 0.88rem; margin-bottom: 12px;
    }
    .info { color: var(--muted); font-size: 0.88rem; margin-bottom: 12px; }

    /* BLE */
    .ble-actions { display: flex; gap: 8px; margin-bottom: 14px; }
    .client-row { display: flex; gap: 8px; margin-top: 8px; }
    .client-input {
      flex: 1; padding: 8px 12px; border: 1px solid var(--line);
      border-radius: 6px; font-size: 0.88rem;
    }
    .client-input:focus { outline: none; border-color: var(--marigold); }
    .device-list { display: grid; gap: 6px; }
    .device-item {
      display: flex; align-items: center; gap: 12px;
      padding: 10px 12px; background: var(--paper); border-radius: 8px;
    }
    .device-icon { font-size: 1.2rem; }
    .device-info { display: flex; flex-direction: column; }
    .device-info strong { font-size: 0.85rem; }
    .device-info span { font-size: 0.75rem; color: var(--muted); }

    /* Google Fit */
    .fit-actions { display: flex; align-items: center; gap: 8px; margin-bottom: 14px; flex-wrap: wrap; }
    .auto-poll-toggle {
      display: flex; align-items: center; gap: 6px; cursor: pointer;
      font-size: 0.8rem; color: var(--muted); user-select: none;
    }
    .auto-poll-toggle input { display: none; }
    .toggle-slider {
      width: 32px; height: 18px; border-radius: 9px;
      background: #ccc; position: relative; transition: background 0.2s;
    }
    .toggle-slider::after {
      content: ''; position: absolute; top: 2px; left: 2px;
      width: 14px; height: 14px; border-radius: 50%;
      background: white; transition: transform 0.2s;
    }
    .auto-poll-toggle input:checked + .toggle-slider { background: var(--green, #1a7a3a); }
    .auto-poll-toggle input:checked + .toggle-slider::after { transform: translateX(14px); }
    .fit-summary { margin-bottom: 14px; }
    .fit-summary h3 { font-size: 0.88rem; color: var(--muted); margin-bottom: 10px; }
    .summary-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 10px;
    }
    .summary-card {
      display: flex; flex-direction: column; align-items: center;
      padding: 14px 10px; background: var(--paper); border-radius: 8px; text-align: center;
    }
    .summary-val { font-size: 1.3rem; font-weight: 700; color: var(--ink); }
    .summary-label { font-size: 0.72rem; color: var(--muted); margin-top: 2px; }
    .fit-list h3 { font-size: 0.88rem; color: var(--muted); margin-bottom: 10px; }
    .fit-item {
      display: flex; align-items: center; gap: 10px;
      padding: 8px 0; border-bottom: 1px solid var(--line);
    }
    .fit-item:last-child { border-bottom: none; }
    .fit-icon { font-size: 1rem; width: 24px; text-align: center; }
    .fit-value { font-weight: 500; font-size: 0.88rem; min-width: 90px; }
    .fit-type { font-size: 0.78rem; color: var(--muted); }
    .fit-time { font-size: 0.75rem; color: var(--muted); margin-left: auto; }

    /* Simulated */
    .sim-tag {
      display: inline-block; font-size: 0.7rem; padding: 2px 8px;
      background: #fff8e6; color: #92400e; border-radius: 10px;
      font-weight: 600; margin-left: 8px; vertical-align: middle;
    }
    .sim-actions { display: flex; gap: 8px; margin-bottom: 12px; }
    .live-vital {
      display: flex; align-items: center; gap: 14px;
      padding: 12px 14px; background: var(--paper); border-radius: 8px;
    }
    .live-type { font-weight: 600; font-size: 0.85rem; min-width: 80px; text-transform: capitalize; }
    .live-value { font-size: 1.15rem; font-weight: 700; color: var(--ink); }
    .live-time { font-size: 0.75rem; color: var(--muted); margin-left: auto; }

    /* Stream */
    .stream-list { max-height: 250px; overflow-y: auto; }
    .stream-item {
      display: flex; align-items: center; gap: 10px;
      padding: 7px 0; border-bottom: 1px solid var(--line);
    }
    .stream-item:last-child { border-bottom: none; }
    .stream-icon { font-size: 1rem; width: 24px; text-align: center; }
    .stream-value { font-weight: 500; font-size: 0.85rem; }
    .stream-time { font-size: 0.72rem; color: var(--muted); margin-left: auto; }

    /* Empty */
    .empty { text-align: center; padding: 36px 20px; }
    .empty-icon { font-size: 2.5rem; margin-bottom: 8px; opacity: 0.4; }
    .empty p { font-weight: 500; margin-bottom: 4px; }
    .empty span { font-size: 0.85rem; color: var(--muted); }

    @media (max-width: 600px) {
      .method-grid { grid-template-columns: 1fr; }
      .method-tab { flex-direction: row; justify-content: center; gap: 10px; }
      .summary-grid { grid-template-columns: repeat(2, 1fr); }
    }

    /* Profile Warning */
    .profile-warning {
      margin-top: 8px; padding: 8px 12px; border-radius: 6px;
      background: #fff0f0; color: #cc0000; font-size: 0.82rem; font-weight: 500;
    }

    /* Sync Result Popup */
    .popup-overlay {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.5); z-index: 1000;
      display: flex; align-items: center; justify-content: center;
      padding: 20px;
    }
    .popup-card {
      background: white; border-radius: 16px; padding: 28px;
      max-width: 420px; width: 100%; box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    .popup-header {
      display: flex; align-items: center; gap: 10px; margin-bottom: 4px;
    }
    .popup-icon { font-size: 1.6rem; }
    .popup-header h2 { font-size: 1.2rem; margin: 0; }
    .popup-sub { color: var(--muted); font-size: 0.85rem; margin-bottom: 18px; }
    .popup-stats { display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px; }
    .popup-stat {
      display: flex; align-items: center; gap: 12px;
      padding: 12px 14px; background: var(--paper); border-radius: 10px;
    }
    .popup-stat-icon { font-size: 1.3rem; width: 28px; text-align: center; }
    .popup-stat-info { display: flex; flex-direction: column; }
    .popup-stat-val { font-size: 1.15rem; font-weight: 700; color: var(--ink); }
    .popup-stat-label { font-size: 0.75rem; color: var(--muted); }
    .popup-actions { display: flex; gap: 10px; }
    .popup-btn { flex: 1; padding: 10px; font-size: 0.9rem; }
  `]
})
export class DevicesComponent implements OnInit, OnDestroy {
  activeMethod: 'ble' | 'google' | 'sim' = 'ble';

  bleSupported = false;
  bleConnected = false;
  bleScanning = false;
  deviceName = '';

  googleFitConnected = false;
  googleFitConnecting = false;
  googleFitSyncing = false;
  googleFitConfigured = false;
  googleClientId = '';
  fitDataPoints: FitDataPoint[] = [];
  fitSummary: { avgHeartRate: number | null; totalSteps: number | null; avgSleep: number | null } | null = null;
  autoPollEnabled = false;

  simRunning = false;
  latestVital: VitalReading | null = null;
  liveVitals: VitalReading[] = [];

  profiles: any[] = [];
  selectedProfileId = '';
  syncCount = 0;
  showProfileWarning = false;
  syncResult: { avgHeartRate: number | null; totalSteps: number | null; avgSleep: number | null; dataPoints: number } | null = null;
  private pendingReadings: any[] = [];
  private syncTimer: any = null;
  private googleFitSyncedOnce = false;

  get isAnyDeviceConnected(): boolean {
    return this.bleConnected || this.googleFitConnected || this.simRunning;
  }

  bleDevices = [
    { name: 'Pulse Oximeter', type: 'SpO2 + Heart Rate', icon: '💧' },
    { name: 'BP Monitor', type: 'Blood Pressure', icon: '🩺' },
    { name: 'Smart Thermometer', type: 'Body Temperature', icon: '🌡️' },
    { name: 'Fitness Band', type: 'Heart Rate + Steps', icon: '⌚' },
  ];

  private subscriptions: Subscription[] = [];

  constructor(
    private bluetooth: BluetoothService,
    private simulated: SimulatedDeviceService,
    private googleFit: GoogleFitService,
    private api: ApiService,
    private router: Router
  ) {}

  ngOnInit() {
    this.bleSupported = this.bluetooth.isSupported;
    this.loadProfiles();
    this.googleFitConfigured = true;
    this.subscriptions.push(
      this.bluetooth.connected$.subscribe(c => {
        this.bleConnected = c;
        if (c) this.deviceName = this.bluetooth.getDeviceName();
      }),
      this.bluetooth.scanning$.subscribe(s => this.bleScanning = s),
      this.bluetooth.vital$.subscribe(v => {
        if (v) { this.addVital(v); this.syncReading(v); }
      }),
      this.googleFit.connected$.subscribe(c => {
        this.googleFitConnected = c;
      }),
      this.googleFit.autoPollEnabled$.subscribe(v => {
        this.autoPollEnabled = v;
      }),
      this.googleFit.fitData$.subscribe(data => {
        this.fitDataPoints = data;
        this.computeSummary(data);
      }),
      this.simulated.running$.subscribe(r => this.simRunning = r),
      this.simulated.vital$.subscribe(v => {
        if (v) { this.addVital(v); this.syncReading(v); }
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
    if (this.syncTimer) clearInterval(this.syncTimer);
  }

  loadProfiles() {
    this.api.getProfiles().subscribe({
      next: (data: any) => {
        this.profiles = data || [];
        if (this.profiles.length === 1) this.selectedProfileId = this.profiles[0].id;
      }
    });
  }

  onProfileChange() { this.syncCount = 0; this.showProfileWarning = false; }

  private addVital(vital: VitalReading) {
    this.latestVital = vital;
    this.liveVitals.push(vital);
    if (this.liveVitals.length > 50) this.liveVitals.shift();
  }

  private syncReading(vital: VitalReading) {
    if (!this.selectedProfileId) return;
    const record: any = { timestamp: vital.timestamp.toISOString() };
    switch (vital.type) {
      case 'heart_rate': record.heart_rate = vital.value; break;
      case 'blood_pressure': {
        const parts = String(vital.value).split('/');
        record.systolic = parseInt(parts[0]);
        record.diastolic = parseInt(parts[1]) || 80;
        break;
      }
      case 'oxygen': record.oxygen_level = vital.value; break;
      case 'temperature': record.temperature = vital.value; break;
    }
    this.pendingReadings.push(record);
    this.debouncedSync();
  }

  private syncGoogleFitToBackend(data: FitDataPoint[]) {
    if (!this.selectedProfileId || data.length === 0) return;
    const readingsByDate = new Map<string, any>();
    for (const dp of data) {
      const dateKey = dp.timestamp.toISOString().split('T')[0];
      if (!readingsByDate.has(dateKey)) readingsByDate.set(dateKey, { timestamp: dp.timestamp.toISOString(), _hrValues: [] as number[], _stepsTotal: 0, _sleepMax: 0 });
      const rec = readingsByDate.get(dateKey)!;
      switch (dp.dataType) {
        case 'heart_rate':
          rec._hrValues.push(Number(dp.value));
          rec.heart_rate = Math.round(rec._hrValues.reduce((a: number, b: number) => a + b, 0) / rec._hrValues.length);
          break;
        case 'sleep':
          rec._sleepMax = Math.max(rec._sleepMax, Number(dp.value));
          rec.sleep_hours = rec._sleepMax;
          break;
        case 'steps':
          rec._stepsTotal += Number(dp.value);
          rec.steps = Math.round(rec._stepsTotal);
          break;
        case 'blood_pressure':
          if (typeof dp.value === 'string' && dp.value.includes('/')) {
            const [sys, dia] = dp.value.split('/').map(Number);
            rec.systolic = sys;
            rec.diastolic = dia;
          }
          break;
      }
    }
    const records = Array.from(readingsByDate.values()).map(r => {
      const { _hrValues, _stepsTotal, _sleepMax, ...clean } = r;
      return clean;
    });
    this.api.syncDeviceData(this.selectedProfileId, 'google_fit', records).subscribe({
      next: () => { this.syncCount += records.length; },
      error: (err) => { console.error('Google Fit sync to backend failed:', err); }
    });
  }

  private debouncedSync() {
    if (this.syncTimer) return;
    this.syncTimer = setTimeout(() => {
      this.syncTimer = null;
      if (this.pendingReadings.length === 0 || !this.selectedProfileId) return;
      const batch = [...this.pendingReadings];
      this.pendingReadings = [];
      this.api.syncDeviceData(this.selectedProfileId, 'ble_device', batch).subscribe({
        next: () => { this.syncCount += batch.length; },
        error: () => { this.pendingReadings.push(...batch); }
      });
    }, 3000);
  }

  async connectBLE() { await this.bluetooth.requestDevice(); }
  disconnectBLE() { this.bluetooth.disconnect(); }

  configureGoogleFit() {
    if (this.googleClientId.trim()) {
      localStorage.setItem('google_fit_client_id', this.googleClientId.trim());
      this.googleFit.setClientId(this.googleClientId.trim());
      this.googleFitConfigured = true;
    }
  }

  async connectGoogleFit() {
    this.googleFitConnecting = true;
    this.googleFit.connect();
    setTimeout(() => { this.googleFitConnecting = false; }, 5000);
  }

  disconnectGoogleFit() {
    this.googleFit.disconnect();
    this.fitDataPoints = [];
    this.fitSummary = null;
  }

  toggleAutoPoll() {
    this.googleFit.toggleAutoPoll();
  }

  async syncGoogleFitData() {
    if (!this.selectedProfileId) {
      this.showProfileWarning = true;
      return;
    }
    this.showProfileWarning = false;
    this.googleFitSyncing = true;
    await this.googleFit.syncAll(7);
    this.googleFitSyncing = false;

    if (this.fitDataPoints.length > 0) {
      this.syncGoogleFitToBackend(this.fitDataPoints);
    }

    if (this.fitSummary) {
      this.syncResult = {
        ...this.fitSummary,
        dataPoints: this.fitDataPoints.length,
      };
    }
  }

  closeSyncResult() {
    this.syncResult = null;
  }

  goToTrends() {
    this.syncResult = null;
    this.router.navigate(['/trends', this.selectedProfileId]);
  }

  private computeSummary(data: FitDataPoint[]) {
    if (!data.length) { this.fitSummary = null; return; }
    const hr = data.filter(d => d.dataType === 'heart_rate');
    const steps = data.filter(d => d.dataType === 'steps');
    const sleep = data.filter(d => d.dataType === 'sleep');
    this.fitSummary = {
      avgHeartRate: hr.length ? Math.round(hr.reduce((s, d) => s + Number(d.value), 0) / hr.length) : null,
      totalSteps: steps.length ? steps.reduce((s, d) => s + Number(d.value), 0) : null,
      avgSleep: sleep.length ? Math.round(sleep.reduce((s, d) => s + Number(d.value), 0) / sleep.length * 10) / 10 : null,
    };
  }

  getFitIcon(type: string): string {
    const icons: any = { heart_rate: '❤️', steps: '🏃', sleep: '😴', blood_pressure: '🩺' };
    return icons[type] || '📊';
  }

  startSimulation() { this.simulated.start(); }
  stopSimulation() { this.simulated.stop(); }

  getTypeIcon(type: string): string {
    const icons: any = { heart_rate: '❤️', blood_pressure: '🩺', oxygen: '💨', temperature: '🌡️' };
    return icons[type] || '📊';
  }
}
