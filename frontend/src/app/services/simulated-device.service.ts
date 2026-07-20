import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, interval, Subscription } from 'rxjs';
import { VitalReading } from './bluetooth.service';

@Injectable({ providedIn: 'root' })
export class SimulatedDeviceService {
  private vitalSubject = new BehaviorSubject<VitalReading | null>(null);
  private runningSubject = new BehaviorSubject<boolean>(false);
  private subscription: Subscription | null = null;

  vital$ = this.vitalSubject.asObservable();
  running$ = this.runningSubject.asObservable();

  private baseVitals = {
    heart_rate: 75,
    systolic: 120,
    diastolic: 80,
    oxygen: 98,
    temperature: 98.4,
  };

  constructor(private zone: NgZone) {}

  start(): void {
    if (this.runningSubject.value) return;

    this.runningSubject.next(true);

    this.subscription = interval(3000).subscribe(() => {
      this.zone.run(() => {
        const vitalType = this.getRandomVitalType();
        const reading = this.generateReading(vitalType);
        this.vitalSubject.next(reading);
      });
    });
  }

  stop(): void {
    this.subscription?.unsubscribe();
    this.subscription = null;
    this.runningSubject.next(false);
  }

  private getRandomVitalType(): string {
    const types = ['heart_rate', 'blood_pressure', 'oxygen', 'temperature'];
    return types[Math.floor(Math.random() * types.length)];
  }

  private generateReading(type: string): VitalReading {
    const now = new Date();

    switch (type) {
      case 'heart_rate':
        return {
          type: 'heart_rate',
          value: this.baseVitals.heart_rate + Math.floor(Math.random() * 11) - 5,
          unit: 'bpm',
          timestamp: now,
          deviceId: 'simulated-001'
        };

      case 'blood_pressure':
        return {
          type: 'blood_pressure',
          value: this.baseVitals.systolic + Math.floor(Math.random() * 11) - 5,
          unit: `/${this.baseVitals.diastolic + Math.floor(Math.random() * 7) - 3} mmHg`,
          timestamp: now,
          deviceId: 'simulated-001'
        };

      case 'oxygen':
        return {
          type: 'oxygen',
          value: Math.min(100, Math.max(94, this.baseVitals.oxygen + Math.floor(Math.random() * 5) - 2)),
          unit: '%',
          timestamp: now,
          deviceId: 'simulated-001'
        };

      case 'temperature':
        return {
          type: 'temperature',
          value: Math.round((this.baseVitals.temperature + (Math.random() * 0.6 - 0.3)) * 10) / 10,
          unit: '°F',
          timestamp: now,
          deviceId: 'simulated-001'
        };

      default:
        return {
          type: 'heart_rate',
          value: 75,
          unit: 'bpm',
          timestamp: now,
          deviceId: 'simulated-001'
        };
    }
  }

  setBaseline(vitals: Partial<typeof this.baseVitals>): void {
    this.baseVitals = { ...this.baseVitals, ...vitals };
  }
}
