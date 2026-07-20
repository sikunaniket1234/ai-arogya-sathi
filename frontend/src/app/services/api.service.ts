import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private auth: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }

  // Profiles
  getProfiles() {
    return this.http.get(`${this.apiUrl}/profiles`, { headers: this.getHeaders() });
  }

  getProfile(id: string) {
    return this.http.get(`${this.apiUrl}/profiles/${id}`, { headers: this.getHeaders() });
  }

  createProfile(data: any) {
    return this.http.post(`${this.apiUrl}/profiles`, data, { headers: this.getHeaders() });
  }

  updateProfile(id: string, data: any) {
    return this.http.put(`${this.apiUrl}/profiles/${id}`, data, { headers: this.getHeaders() });
  }

  deleteProfile(id: string) {
    return this.http.delete(`${this.apiUrl}/profiles/${id}`, { headers: this.getHeaders() });
  }

  // Health Records
  getHealthRecords(profileId: string) {
    return this.http.get(`${this.apiUrl}/health-records/${profileId}`, { headers: this.getHeaders() });
  }

  addHealthRecord(profileId: string, data: any) {
    return this.http.post(`${this.apiUrl}/health-records/${profileId}`, data, { headers: this.getHeaders() });
  }

  // Medicines
  getMedicines(profileId: string) {
    return this.http.get(`${this.apiUrl}/medicines/${profileId}`, { headers: this.getHeaders() });
  }

  addMedicine(profileId: string, data: any) {
    return this.http.post(`${this.apiUrl}/medicines/${profileId}`, data, { headers: this.getHeaders() });
  }

  // Symptoms
  getSymptomHistory(profileId: string) {
    return this.http.get(`${this.apiUrl}/symptoms/${profileId}`, { headers: this.getHeaders() });
  }

  submitSymptom(profileId: string, data: any) {
    return this.http.post(`${this.apiUrl}/symptoms/${profileId}`, data, { headers: this.getHeaders() });
  }

  getSymptomCacheStats() {
    return this.http.get(`${this.apiUrl}/symptoms/cache/stats`, { headers: this.getHeaders() });
  }

  // Reminders
  getActiveMedicines(profileId: string) {
    return this.http.get(`${this.apiUrl}/reminders/active/${profileId}`, { headers: this.getHeaders() });
  }

  markDoseTaken(medicineId: string) {
    return this.http.post(`${this.apiUrl}/reminders/take/${medicineId}`, {}, { headers: this.getHeaders() });
  }

  getAdherence(profileId: string) {
    return this.http.get(`${this.apiUrl}/reminders/adherence/${profileId}`, { headers: this.getHeaders() });
  }

  deleteMedicine(medicineId: string) {
    return this.http.delete(`${this.apiUrl}/medicines/${medicineId}`, { headers: this.getHeaders() });
  }

  // Emergency
  getEmergencyData(lang: string = 'en') {
    return this.http.get(`${this.apiUrl}/emergency?lang=${lang}`, { headers: this.getHeaders() });
  }

  getFirstAid(lang: string = 'en') {
    return this.http.get(`${this.apiUrl}/emergency/first-aid?lang=${lang}`, { headers: this.getHeaders() });
  }

  // Devices
  getSupportedDevices() {
    return this.http.get(`${this.apiUrl}/devices/supported`, { headers: this.getHeaders() });
  }

  syncDeviceData(profileId: string, deviceType: string, dataPoints: any[]) {
    return this.http.post(`${this.apiUrl}/devices/sync/${profileId}`, { device_type: deviceType, data_points: dataPoints }, { headers: this.getHeaders() });
  }

  uploadCSV(profileId: string, csvData: string) {
    return this.http.post(`${this.apiUrl}/devices/upload/${profileId}`, { csv_data: csvData }, { headers: this.getHeaders() });
  }

  // Trends
  getVitalTrends(profileId: string, days: number = 30) {
    return this.http.get<any[]>(`${this.apiUrl}/trends/vitals/${profileId}?days=${days}`, { headers: this.getHeaders() });
  }

  getHealthScore(profileId: string) {
    return this.http.get(`${this.apiUrl}/trends/health-score/${profileId}`, { headers: this.getHeaders() });
  }

  getVitalComparison(profileId: string, days: number = 30) {
    return this.http.get(`${this.apiUrl}/trends/comparison/${profileId}?days=${days}`, { headers: this.getHeaders() });
  }

  getAnomalies(profileId: string, days: number = 30) {
    return this.http.get(`${this.apiUrl}/trends/anomalies/${profileId}?days=${days}`, { headers: this.getHeaders() });
  }

  // Notifications
  getNotifications(unreadOnly: boolean = false) {
    return this.http.get(`${this.apiUrl}/notifications?unread=${unreadOnly}`, { headers: this.getHeaders() });
  }

  markNotificationRead(id: string) {
    return this.http.post(`${this.apiUrl}/notifications/${id}/read`, {}, { headers: this.getHeaders() });
  }

  // Medical Card
  getMedicalCard(profileId: string) {
    return this.http.get(`${this.apiUrl}/medical-card/profile/${profileId}`, { headers: this.getHeaders() });
  }

  getMedicalCardQR(token: string) {
    return this.http.get(`${this.apiUrl}/medical-card/qr/${token}`);
  }

  // Community
  getCommunitySchemes(filters?: { state?: string; age?: number | null; condition?: string; type?: string }) {
    let params = new URLSearchParams();
    if (filters?.state) params.set('state', filters.state);
    if (filters?.age) params.set('age', String(filters.age));
    if (filters?.condition) params.set('condition', filters.condition);
    if (filters?.type) params.set('type', filters.type);
    const qs = params.toString();
    return this.http.get(`${this.apiUrl}/community/schemes${qs ? '?' + qs : ''}`);
  }

  getCommunityScheme(id: string) {
    return this.http.get(`${this.apiUrl}/community/schemes/${id}`);
  }

  getBloodBanks(filters?: { city?: string; blood_type?: string }) {
    let params = new URLSearchParams();
    if (filters?.city) params.set('city', filters.city);
    if (filters?.blood_type) params.set('blood_type', filters.blood_type);
    const qs = params.toString();
    return this.http.get(`${this.apiUrl}/community/blood-banks${qs ? '?' + qs : ''}`);
  }

  getVaccinationCamps(filters?: { city?: string; vaccine?: string }) {
    let params = new URLSearchParams();
    if (filters?.city) params.set('city', filters.city);
    if (filters?.vaccine) params.set('vaccine', filters.vaccine);
    const qs = params.toString();
    return this.http.get(`${this.apiUrl}/community/vaccination-camps${qs ? '?' + qs : ''}`);
  }

  getOutbreakAlerts(state?: string) {
    const qs = state ? `?state=${state}` : '';
    return this.http.get(`${this.apiUrl}/community/outbreaks${qs}`);
  }
}
