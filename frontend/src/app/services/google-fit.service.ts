import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

const GOOGLE_FIT_API = 'https://www.googleapis.com/fitness/v1';

const CLIENT_ID = '707907542184-1bb7jlqm4r70nhcrg2acgpksed3fiph0.apps.googleusercontent.com';

const SCOPES = [
  'https://www.googleapis.com/auth/fitness.activity.read',
  'https://www.googleapis.com/auth/fitness.body.read',
  'https://www.googleapis.com/auth/fitness.heart_rate.read',
  'https://www.googleapis.com/auth/fitness.sleep.read',
].join(' ');

export interface FitDataPoint {
  dataType: string;
  value: number | string;
  unit: string;
  timestamp: Date;
}

const POLL_INTERVAL = 5 * 60 * 1000;

@Injectable({ providedIn: 'root' })
export class GoogleFitService {
  private tokenSubject = new BehaviorSubject<string | null>(null);
  connected$ = new BehaviorSubject<boolean>(false);
  syncing$ = new BehaviorSubject<boolean>(false);
  fitData$ = new BehaviorSubject<FitDataPoint[]>([]);
  autoPollEnabled$ = new BehaviorSubject<boolean>(false);

  private clientId = CLIENT_ID;
  private pollTimer: any = null;

  constructor(private http: HttpClient) {
    this.tryRestoreSession();
    const savedPoll = localStorage.getItem('google_fit_auto_poll');
    if (savedPoll === 'true') {
      this.autoPollEnabled$.next(true);
      if (this.connected$.value) this.startAutoPoll();
    }
  }

  private tryRestoreSession() {
    const savedToken = localStorage.getItem('google_fit_token');
    const expiry = localStorage.getItem('google_fit_expiry');
    if (savedToken && expiry && Date.now() < parseInt(expiry)) {
      this.tokenSubject.next(savedToken);
      this.connected$.next(true);
    } else {
      localStorage.removeItem('google_fit_token');
      localStorage.removeItem('google_fit_expiry');
    }
  }

  setClientId(clientId: string) {
    this.clientId = clientId;
  }

  connect(): void {
    const redirectUri = window.location.origin + '/auth/google-fit';
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${encodeURIComponent(this.clientId)}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=token&` +
      `scope=${encodeURIComponent(SCOPES)}&` +
      `prompt=consent`;

    const popup = window.open(authUrl, 'google-fit-auth', 'width=500,height=650');

    const pollTimer = setInterval(() => {
      try {
        if (popup?.closed) {
          clearInterval(pollTimer);
          return;
        }
        const href = popup?.location?.href;
        if (href && href.includes('access_token=')) {
          clearInterval(pollTimer);
          const hash = popup.location.hash.substring(1);
          const params = new URLSearchParams(hash);
          const token = params.get('access_token');
          if (token) {
            const expiresIn = parseInt(params.get('expires_in') || '3600');
            this.saveToken(token, expiresIn);
            popup.close();
          }
        }
      } catch (e) {
      }
    }, 500);

    setTimeout(() => {
      clearInterval(pollTimer);
      if (popup && !popup.closed) popup.close();
    }, 120000);
  }

  handleCallback(hash: string) {
    const params = new URLSearchParams(hash.substring(1));
    const token = params.get('access_token');
    if (token) {
      const expiresIn = parseInt(params.get('expires_in') || '3600');
      this.saveToken(token, expiresIn);
    }
  }

  private saveToken(token: string, expiresIn: number) {
    localStorage.setItem('google_fit_token', token);
    localStorage.setItem('google_fit_expiry', String(Date.now() + expiresIn * 1000));
    this.tokenSubject.next(token);
    this.connected$.next(true);
    if (this.autoPollEnabled$.value) this.startAutoPoll();
  }

  disconnect(): void {
    const token = this.tokenSubject.value;
    if (token) {
      fetch(`https://accounts.google.com/o/oauth2/revoke?token=${token}`, { method: 'POST' }).catch(() => {});
    }
    this.stopAutoPoll();
    localStorage.removeItem('google_fit_token');
    localStorage.removeItem('google_fit_expiry');
    this.tokenSubject.next(null);
    this.connected$.next(false);
    this.fitData$.next([]);
  }

  toggleAutoPoll(): void {
    const next = !this.autoPollEnabled$.value;
    this.autoPollEnabled$.next(next);
    localStorage.setItem('google_fit_auto_poll', String(next));
    if (next && this.connected$.value) {
      this.startAutoPoll();
    } else {
      this.stopAutoPoll();
    }
  }

  private startAutoPoll() {
    this.stopAutoPoll();
    console.log('[GoogleFit] Auto-poll started (every 5 min)');
    this.pollTimer = setInterval(() => {
      if (this.connected$.value && !this.syncing$.value) {
        console.log('[GoogleFit] Auto-poll syncing...');
        this.syncAll(7).catch(() => {});
      }
    }, POLL_INTERVAL);
  }

  private stopAutoPoll() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${this.tokenSubject.value}`,
      'Content-Type': 'application/json',
    });
  }

  async syncAll(days: number = 7): Promise<FitDataPoint[]> {
    this.syncing$.next(true);
    try {
      const [heartRate, steps, sleep] = await Promise.all([
        this.getHeartRate(days),
        this.getSteps(days),
        this.getSleep(days),
      ]);
      const all = [...heartRate, ...steps, ...sleep];
      console.log('[GoogleFit] Sync result:', {
        heartRate: heartRate.map(p => p.value),
        steps: steps.map(p => p.value),
        sleep: sleep.map(p => p.value),
      });
      console.log('[GoogleFit] Full fitData points:', all);
      this.fitData$.next(all);
      return all;
    } finally {
      this.syncing$.next(false);
    }
  }

  async getHeartRate(days: number = 7): Promise<FitDataPoint[]> {
    const token = this.tokenSubject.value;
    if (!token) return [];
    const endTime = Date.now();
    const startTime = endTime - days * 24 * 60 * 60 * 1000;
    try {
      const response: any = await this.http.post(
        `${GOOGLE_FIT_API}/users/me/dataset:aggregate`,
        {
          aggregateBy: [{ dataTypeName: 'com.google.heart_rate.bpm' }],
          bucketByTime: { durationMillis: 86400000 },
          startTimeMillis: startTime,
          endTimeMillis: endTime,
        },
        { headers: this.getHeaders() }
      ).toPromise();

      console.log('[GoogleFit] Heart rate buckets:', response.bucket?.length, 'total points:', response.bucket?.reduce((n: number, b: any) => n + b.dataset?.reduce((n2: number, d: any) => n2 + (d.point?.length || 0), 0), 0));
      const points: FitDataPoint[] = [];
      response.bucket?.forEach((bucket: any) => {
        const bucketTime = new Date(parseInt(bucket.startTimeMillis));
        const allVals: number[] = [];
        bucket.dataset?.forEach((dataset: any) => {
          dataset.point?.forEach((point: any) => {
            const val = point.value?.[0];
            const hr = val?.fpVal ?? val?.intVal ?? null;
            if (hr != null && hr > 0) allVals.push(hr);
          });
        });
        if (allVals.length > 0) {
          const avg = Math.round(allVals.reduce((a, b) => a + b, 0) / allVals.length);
          points.push({ dataType: 'heart_rate', value: avg, unit: 'bpm', timestamp: bucketTime });
        }
      });
      return points;
    } catch (error) {
      console.error('Failed to fetch heart rate:', error);
      return [];
    }
  }

  async getSteps(days: number = 7): Promise<FitDataPoint[]> {
    const token = this.tokenSubject.value;
    if (!token) return [];
    const endTime = Date.now();
    const startTime = endTime - days * 24 * 60 * 60 * 1000;
    try {
      const response: any = await this.http.post(
        `${GOOGLE_FIT_API}/users/me/dataset:aggregate`,
        {
          aggregateBy: [{ dataTypeName: 'com.google.step_count.delta' }],
          bucketByTime: { durationMillis: 86400000 },
          startTimeMillis: startTime,
          endTimeMillis: endTime,
        },
        { headers: this.getHeaders() }
      ).toPromise();

      console.log('[GoogleFit] Steps buckets:', response.bucket?.length, 'total points:', response.bucket?.reduce((n: number, b: any) => n + b.dataset?.reduce((n2: number, d: any) => n2 + (d.point?.length || 0), 0), 0));
      const points: FitDataPoint[] = [];
      response.bucket?.forEach((bucket: any) => {
        const bucketTime = new Date(parseInt(bucket.startTimeMillis));
        let totalSteps = 0;
        bucket.dataset?.forEach((dataset: any) => {
          dataset.point?.forEach((point: any) => {
            const val = point.value?.[0];
            const steps = val?.intVal ?? val?.fpVal ?? 0;
            totalSteps += steps;
          });
        });
        if (totalSteps > 0) {
          points.push({ dataType: 'steps', value: Math.round(totalSteps), unit: 'steps', timestamp: bucketTime });
        }
      });
      return points;
    } catch (error) {
      console.error('Failed to fetch steps:', error);
      return [];
    }
  }

  async getSleep(days: number = 7): Promise<FitDataPoint[]> {
    const token = this.tokenSubject.value;
    if (!token) return [];
    const endTime = Date.now();
    const startTime = endTime - days * 24 * 60 * 60 * 1000;
    try {
      const response: any = await this.http.post(
        `${GOOGLE_FIT_API}/users/me/dataset:aggregate`,
        {
          aggregateBy: [{ dataTypeName: 'com.google.sleep.segment' }],
          bucketByTime: { durationMillis: 86400000 },
          startTimeMillis: startTime,
          endTimeMillis: endTime,
        },
        { headers: this.getHeaders() }
      ).toPromise();

      const points: FitDataPoint[] = [];
      response.bucket?.forEach((bucket: any) => {
        const bucketTime = new Date(parseInt(bucket.startTimeMillis));
        let totalMinutes = 0;
        bucket.dataset?.forEach((dataset: any) => {
          dataset.point?.forEach((point: any) => {
            const startNanos = parseInt(point.startTimeNanos);
            const endNanos = parseInt(point.endTimeNanos);
            if (startNanos && endNanos && endNanos > startNanos) {
              totalMinutes += (endNanos - startNanos) / 60000000000;
            }
          });
        });
        const sleepHours = Math.round(totalMinutes / 60 * 10) / 10;
        if (sleepHours > 0) {
          points.push({ dataType: 'sleep', value: sleepHours, unit: 'hours', timestamp: bucketTime });
        }
      });
      return points;
    } catch (error) {
      console.error('Failed to fetch sleep:', error);
      return [];
    }
  }

}
