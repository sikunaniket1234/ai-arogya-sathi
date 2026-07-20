import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface BLEDevice {
  id: string;
  name: string;
  device: any;
  server: any;
  characteristics: Map<string, any>;
}

export interface VitalReading {
  type: string;
  value: number;
  unit: string;
  timestamp: Date;
  deviceId: string;
}

const HEALTH_SERVICE_UUID = 'heart_rate';
const HEART_RATE_MEASUREMENT_UUID = 'heart_rate_measurement';
const BLOOD_PRESSURE_SERVICE_UUID = 'blood_pressure';
const BLOOD_PRESSURE_MEASUREMENT_UUID = 'blood_pressure_measurement';
const TEMPERATURE_SERVICE_UUID = 'health_thermometer';
const TEMPERATURE_MEASUREMENT_UUID = 'temperature_measurement';
const PULSE_OX_SERVICE_UUID = 'pulse_oximeter';
const PLX_MEASUREMENT_UUID = 'plx_spot_check_measurement';

@Injectable({ providedIn: 'root' })
export class BluetoothService {
  private device: BLEDevice | null = null;
  private vitalSubject = new BehaviorSubject<VitalReading | null>(null);
  private connectedSubject = new BehaviorSubject<boolean>(false);
  private scanningSubject = new BehaviorSubject<boolean>(false);

  vital$ = this.vitalSubject.asObservable();
  connected$ = this.connectedSubject.asObservable();
  scanning$ = this.scanningSubject.asObservable();

  isSupported = typeof navigator !== 'undefined' && 'bluetooth' in navigator;

  constructor(private zone: NgZone) {}

  async requestDevice(): Promise<BLEDevice | null> {
    if (!this.isSupported) {
      console.warn('Web Bluetooth not supported');
      return null;
    }

    try {
      this.scanningSubject.next(true);

      const device = await (navigator as any).bluetooth.requestDevice({
        filters: [
          { services: [HEALTH_SERVICE_UUID] },
          { services: [BLOOD_PRESSURE_SERVICE_UUID] },
          { services: [TEMPERATURE_SERVICE_UUID] },
          { services: [PULSE_OX_SERVICE_UUID] },
        ],
        optionalServices: [
          'battery_service',
          'device_information',
        ]
      });

      console.log('Device found:', device.name);

      const server = await device.gatt.connect();

      const bleDevice: BLEDevice = {
        id: device.id,
        name: device.name || 'Unknown Device',
        device,
        server,
        characteristics: new Map()
      };

      this.device = bleDevice;
      this.connectedSubject.next(true);

      device.addEventListener('gattserverdisconnected', () => {
        this.zone.run(() => {
          this.connectedSubject.next(false);
          this.device = null;
        });
      });

      await this.subscribeToServices(bleDevice);

      return bleDevice;
    } catch (error) {
      console.error('Bluetooth connection failed:', error);
      return null;
    } finally {
      this.scanningSubject.next(false);
    }
  }

  private async subscribeToServices(device: BLEDevice): Promise<void> {
    try {
      const heartRateService = await device.server.getPrimaryService(HEALTH_SERVICE_UUID);
      const hrCharacteristic = await heartRateService.getCharacteristic(HEART_RATE_MEASUREMENT_UUID);
      await hrCharacteristic.startNotifications();

      hrCharacteristic.addEventListener('characteristicvaluechanged', (event: any) => {
        this.zone.run(() => {
          const reading = this.parseHeartRate(event.target.value);
          this.vitalSubject.next({
            type: 'heart_rate',
            value: reading,
            unit: 'bpm',
            timestamp: new Date(),
            deviceId: device.id
          });
        });
      });

      device.characteristics.set('heart_rate', hrCharacteristic);
    } catch (e) {
      console.log('Heart rate service not available');
    }

    try {
      const bpService = await device.server.getPrimaryService(BLOOD_PRESSURE_SERVICE_UUID);
      const bpCharacteristic = await bpService.getCharacteristic(BLOOD_PRESSURE_MEASUREMENT_UUID);
      await bpCharacteristic.startNotifications();

      bpCharacteristic.addEventListener('characteristicvaluechanged', (event: any) => {
        this.zone.run(() => {
          const bp = this.parseBloodPressure(event.target.value);
          this.vitalSubject.next({
            type: 'blood_pressure',
            value: bp.systolic,
            unit: `/${bp.diastolic} mmHg`,
            timestamp: new Date(),
            deviceId: device.id
          });
        });
      });

      device.characteristics.set('blood_pressure', bpCharacteristic);
    } catch (e) {
      console.log('Blood pressure service not available');
    }

    try {
      const tempService = await device.server.getPrimaryService(TEMPERATURE_SERVICE_UUID);
      const tempCharacteristic = await tempService.getCharacteristic(TEMPERATURE_MEASUREMENT_UUID);
      await tempCharacteristic.startNotifications();

      tempCharacteristic.addEventListener('characteristicvaluechanged', (event: any) => {
        this.zone.run(() => {
          const temp = this.parseTemperature(event.target.value);
          this.vitalSubject.next({
            type: 'temperature',
            value: temp,
            unit: '°C',
            timestamp: new Date(),
            deviceId: device.id
          });
        });
      });

      device.characteristics.set('temperature', tempCharacteristic);
    } catch (e) {
      console.log('Temperature service not available');
    }
  }

  private parseHeartRate(data: DataView): number {
    const flags = data.getUint8(0);
    const is16Bit = flags & 0x01;
    return is16Bit ? data.getUint16(1, true) : data.getUint8(1);
  }

  private parseBloodPressure(data: DataView): { systolic: number; diastolic: number } {
    const systolic = data.getUint16(1, true);
    const diastolic = data.getUint16(3, true);
    return { systolic, diastolic };
  }

  private parseTemperature(data: DataView): number {
    const flags = data.getUint8(0);
    const tempC = data.getFloat32(1, true);
    return Math.round(tempC * 10) / 10;
  }

  disconnect(): void {
    if (this.device?.device.gatt.connected) {
      this.device.device.gatt.disconnect();
    }
    this.device = null;
    this.connectedSubject.next(false);
  }

  getDeviceName(): string {
    return this.device?.name || 'No device connected';
  }
}
