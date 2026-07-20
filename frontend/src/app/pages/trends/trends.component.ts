import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface ChartConfig {
  title: string;
  icon: string;
  field: string;
  color: string;
  unit: string;
  lowThresh: number;
  highThresh: number;
}

@Component({
  selector: 'app-trends',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="trends-page">
      <a routerLink="/dashboard" class="back-link">&larr; Back to Dashboard</a>
      <h1>Health Trends</h1>
      <p class="sub">Track your vital signs over time</p>

      <div class="period-selector">
        <button *ngFor="let p of periods" [class.active]="selectedPeriod === p.days" (click)="loadTrends(p.days)">
          {{ p.label }}
        </button>
      </div>

      <!-- Health Score + Comparison -->
      <div class="score-row">
        <div class="health-score card" *ngIf="healthScore">
          <div class="score-circle" [class]="getScoreClass(healthScore.score)">
            <span class="score-value">{{ healthScore.score }}</span>
            <span class="score-label">Health Score</span>
          </div>
          <div class="score-details">
            <span class="status-pill" [class]="healthScore.status">{{ healthScore.status | titlecase }}</span>
            <div class="issues" *ngIf="healthScore.issues?.length">
              <span *ngFor="let issue of healthScore.issues" class="issue-tag">{{ issue }}</span>
            </div>
            <span class="last-updated" *ngIf="healthScore.lastUpdated">Last updated: {{ healthScore.lastUpdated | date:'short' }}</span>
          </div>
        </div>

        <!-- Comparison Card -->
        <div class="comparison card" *ngIf="comparison">
          <h3>Period Comparison</h3>
          <div class="comparison-grid">
            <div class="comp-item" *ngFor="let c of comparisonItems">
              <span class="comp-label">{{ c.label }}</span>
              <span class="comp-value">{{ c.current || '--' }} {{ c.unit }}</span>
              <span class="comp-change" *ngIf="c.change !== null" [class]="c.changeClass">
                {{ c.changeIcon }} {{ c.changeText }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Anomaly Alerts -->
      <div class="anomaly-alert card" *ngIf="anomalies.length > 0">
        <h3>&#9888; Anomaly Alerts ({{ anomalies.length }})</h3>
        <div class="anomaly-list">
          <div class="anomaly-item" *ngFor="let a of anomalies">
            <span class="anomaly-date">{{ a.date | date:'mediumDate' }}</span>
            <div class="anomaly-flags">
              <span *ngFor="let f of a.flags" class="anomaly-flag" [class.level-high]="f.level === 'high'">
                {{ f.metric }}: {{ f.value }} {{ f.unit }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Vital Charts -->
      <div class="charts-grid">
        <div class="chart-card card" *ngFor="let cfg of chartConfigs">
          <div class="chart-header">
            <span class="chart-icon">{{ cfg.icon }}</span>
            <h3>{{ cfg.title }}</h3>
            <span class="chart-trend" *ngIf="getTrend(cfg.field)" [class]="getTrend(cfg.field)!.class">
              {{ getTrend(cfg.field)!.arrow }} {{ getTrend(cfg.field)!.text }}
            </span>
          </div>
          <div class="chart-container">
            <canvas [id]="'chart-' + cfg.field"></canvas>
          </div>
          <div class="chart-stats">
            <span>Avg: {{ getStats(cfg.field).avg }} {{ cfg.unit }}</span>
            <span>Min: {{ getStats(cfg.field).min }} {{ cfg.unit }}</span>
            <span>Max: {{ getStats(cfg.field).max }} {{ cfg.unit }}</span>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div class="empty card" *ngIf="trends.length === 0 && !loading">
        <p>No health data available. Start recording vitals in the Health Dashboard.</p>
        <a [routerLink]="['/health', profileId]" class="btn btn-primary">Record Vitals</a>
      </div>
    </div>
  `,
  styles: [`
    .trends-page { padding-bottom: 40px; }
    .back-link {
      display: inline-block; margin-bottom: 12px;
      color: var(--marigold); text-decoration: none; font-size: 0.9rem;
    }
    h1 { font-size: 1.5rem; margin-bottom: 4px; }
    .sub { color: var(--muted); margin-bottom: 16px; }

    .period-selector { display: flex; gap: 8px; margin-bottom: 24px; }
    .period-selector button {
      padding: 8px 16px; border: 1px solid var(--line);
      border-radius: 6px; background: white; cursor: pointer;
      font-size: 0.85rem; transition: all 0.2s;
    }
    .period-selector button.active {
      background: var(--ink); color: white; border-color: var(--ink);
    }

    .score-row {
      display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
      margin-bottom: 20px;
    }
    @media (max-width: 700px) { .score-row { grid-template-columns: 1fr; } }

    .health-score { display: flex; align-items: center; gap: 20px; padding: 20px; }
    .score-circle {
      width: 90px; height: 90px; border-radius: 50%; flex-shrink: 0;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      border: 4px solid var(--green);
    }
    .score-circle.score-fair { border-color: var(--marigold); }
    .score-circle.score-bad { border-color: var(--coral); }
    .score-value { font-size: 1.8rem; font-weight: 700; }
    .score-label { font-size: 0.65rem; color: var(--muted); }
    .score-details { display: flex; flex-direction: column; gap: 6px; }
    .status-pill {
      display: inline-block; width: fit-content;
      padding: 3px 10px; border-radius: 12px;
      font-size: 0.78rem; font-weight: 600;
    }
    .status-pill.good { background: #e6f7ed; color: #1a7a3a; }
    .status-pill.fair { background: #fff8e6; color: #a16207; }
    .status-pill.needs_attention { background: #fff0f0; color: #cc0000; }
    .issues { display: flex; gap: 4px; flex-wrap: wrap; }
    .issue-tag {
      font-size: 0.72rem; padding: 2px 6px;
      background: #fff0f0; border-radius: 4px; color: var(--coral);
    }
    .last-updated { font-size: 0.72rem; color: var(--muted); }

    .comparison { padding: 20px; }
    .comparison h3 { font-size: 0.95rem; margin-bottom: 12px; }
    .comparison-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .comp-item { display: flex; flex-direction: column; gap: 2px; }
    .comp-label { font-size: 0.75rem; color: var(--muted); }
    .comp-value { font-size: 0.95rem; font-weight: 600; }
    .comp-change { font-size: 0.75rem; font-weight: 500; }
    .comp-change.improved { color: #1a7a3a; }
    .comp-change.worsened { color: var(--coral); }
    .comp-change.stable { color: var(--muted); }

    .anomaly-alert { padding: 16px 20px; margin-bottom: 20px; border-left: 4px solid var(--coral); }
    .anomaly-alert h3 { font-size: 0.95rem; margin-bottom: 10px; color: var(--coral); }
    .anomaly-list { max-height: 150px; overflow-y: auto; }
    .anomaly-item {
      display: flex; align-items: center; gap: 12px;
      padding: 6px 0; border-bottom: 1px solid var(--line);
    }
    .anomaly-date { font-size: 0.8rem; color: var(--muted); min-width: 100px; }
    .anomaly-flags { display: flex; gap: 6px; flex-wrap: wrap; }
    .anomaly-flag {
      font-size: 0.75rem; padding: 2px 8px;
      background: #fff8e6; border-radius: 4px; color: #a16207;
    }
    .anomaly-flag.level-high { background: #fff0f0; color: var(--coral); }

    .charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    @media (max-width: 700px) { .charts-grid { grid-template-columns: 1fr; } }

    .chart-card { padding: 16px; }
    .chart-header {
      display: flex; align-items: center; gap: 8px; margin-bottom: 12px;
    }
    .chart-icon { font-size: 1.2rem; }
    .chart-header h3 { font-size: 0.95rem; margin: 0; flex: 1; }
    .chart-trend {
      font-size: 0.78rem; font-weight: 600; padding: 2px 8px;
      border-radius: 10px;
    }
    .chart-trend.improved { background: #e6f7ed; color: #1a7a3a; }
    .chart-trend.worsened { background: #fff0f0; color: var(--coral); }
    .chart-trend.stable { background: var(--paper); color: var(--muted); }
    .chart-container { height: 160px; margin-bottom: 8px; }
    .chart-container canvas { width: 100% !important; height: 100% !important; }
    .chart-stats {
      display: flex; gap: 12px; font-size: 0.78rem; color: var(--muted);
    }

    .empty { text-align: center; padding: 32px; color: var(--muted); }
    .empty .btn { margin-top: 12px; }
  `]
})
export class TrendsComponent implements OnInit, OnDestroy {
  profileId = '';
  trends: any[] = [];
  healthScore: any = null;
  comparison: any = null;
  comparisonItems: any[] = [];
  anomalies: any[] = [];
  loading = true;
  selectedPeriod = 7;
  private charts: Chart[] = [];

  periods = [
    { label: '7 Days', days: 7 },
    { label: '30 Days', days: 30 },
    { label: '90 Days', days: 90 }
  ];

  chartConfigs: ChartConfig[] = [
    { title: 'Heart Rate', icon: '❤️', field: 'avg_heart_rate', color: '#e74c3c', unit: 'bpm', lowThresh: 60, highThresh: 100 },
    { title: 'Blood Pressure (Systolic)', icon: '🩺', field: 'avg_systolic', color: '#8e44ad', unit: 'mmHg', lowThresh: 90, highThresh: 140 },
    { title: 'Blood Pressure (Diastolic)', icon: '🩺', field: 'avg_diastolic', color: '#9b59b6', unit: 'mmHg', lowThresh: 60, highThresh: 90 },
    { title: 'Oxygen Level', icon: '💨', field: 'avg_oxygen', color: '#3498db', unit: '%', lowThresh: 95, highThresh: 100 },
    { title: 'Temperature', icon: '🌡️', field: 'avg_temperature', color: '#e67e22', unit: '°F', lowThresh: 97, highThresh: 100.4 },
    { title: 'Sleep', icon: '😴', field: 'avg_sleep', color: '#2ecc71', unit: 'hrs', lowThresh: 6, highThresh: 9 },
    { title: 'Steps', icon: '🏃', field: 'total_steps', color: '#f39c12', unit: 'steps', lowThresh: 3000, highThresh: 10000 },
  ];

  private statsCache: Record<string, { avg: string; min: string; max: string }> = {};
  private trendCache: Record<string, { class: string; arrow: string; text: string } | null> = {};

  constructor(private route: ActivatedRoute, private api: ApiService) {}

  ngOnInit() {
    this.profileId = this.route.snapshot.paramMap.get('profileId') || '';
    this.loadTrends(7);
    this.loadHealthScore();
    this.loadAnomalies();
  }

  ngOnDestroy() {
    this.charts.forEach(c => c.destroy());
  }

  loadTrends(days: number) {
    this.selectedPeriod = days;
    this.loading = true;
    this.charts.forEach(c => c.destroy());
    this.charts = [];

    this.api.getVitalTrends(this.profileId, days).subscribe({
      next: (data: any) => {
        this.trends = data.trends || [];
        console.log('[Trends] Received data:', JSON.stringify(this.trends, null, 2));
        this.buildCharts();
        this.loading = false;
      },
      error: () => this.loading = false
    });

    this.api.getVitalComparison(this.profileId, days).subscribe({
      next: (data: any) => {
        this.comparison = data;
        this.buildComparison(data);
      }
    });

    this.loadAnomalies();
  }

  loadHealthScore() {
    this.api.getHealthScore(this.profileId).subscribe({
      next: (data: any) => this.healthScore = data,
    });
  }

  loadAnomalies() {
    this.api.getAnomalies(this.profileId, this.selectedPeriod).subscribe({
      next: (data: any) => this.anomalies = data || [],
    });
  }

  buildCharts() {
    if (this.trends.length === 0) return;

    const labels = this.trends.map(t => {
      const d = new Date(t.date);
      return d.toLocaleDateString('en', { day: 'numeric', month: 'short' });
    });

    this.statsCache = {};
    this.trendCache = {};

    for (const cfg of this.chartConfigs) {
      const values = this.trends.map(t => t[cfg.field] ? Number(t[cfg.field]) : null);
      const validValues = values.filter(v => v !== null) as number[];

      if (validValues.length === 0) continue;

      const avg = validValues.reduce((a, b) => a + b, 0) / validValues.length;
      this.statsCache[cfg.field] = {
        avg: avg.toFixed(1),
        min: Math.min(...validValues).toFixed(1),
        max: Math.max(...validValues).toFixed(1),
      };

      if (validValues.length >= 2) {
        const recent = validValues.slice(-3);
        const earlier = validValues.slice(0, Math.max(1, Math.floor(validValues.length / 2)));
        const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
        const earlierAvg = earlier.reduce((a, b) => a + b, 0) / earlier.length;
        const pctChange = earlierAvg !== 0 ? ((recentAvg - earlierAvg) / earlierAvg * 100) : 0;

        const isLower = cfg.field === 'avg_oxygen' || cfg.field === 'avg_sleep' || cfg.field === 'total_steps';
        const improved = isLower ? pctChange > 2 : pctChange < -2;
        const worsened = isLower ? pctChange < -2 : pctChange > 2;

        this.trendCache[cfg.field] = {
          class: improved ? 'improved' : worsened ? 'worsened' : 'stable',
          arrow: improved ? '↑' : worsened ? '↓' : '→',
          text: Math.abs(pctChange).toFixed(0) + '%',
        };
      }

      const canvas = document.getElementById('chart-' + cfg.field) as HTMLCanvasElement;
      if (!canvas) continue;

      const ctx = canvas.getContext('2d');
      if (!ctx) continue;

      const bgColors = values.map(v => {
        if (v === null) return 'transparent';
        if (v < cfg.lowThresh || v > cfg.highThresh) return 'rgba(255, 107, 74, 0.7)';
        return cfg.color + '99';
      });

      const borderColors = values.map(v => {
        if (v === null) return 'transparent';
        if (v < cfg.lowThresh || v > cfg.highThresh) return '#ff6b4a';
        return cfg.color;
      });

      const chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            data: values,
            borderColor: cfg.color,
            backgroundColor: cfg.color + '20',
            borderWidth: 2,
            pointBackgroundColor: bgColors,
            pointBorderColor: borderColors,
            pointRadius: 3,
            pointHoverRadius: 5,
            tension: 0.3,
            fill: true,
            spanGaps: true,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx: any) => ctx.parsed.y !== null ? ctx.parsed.y.toFixed(1) + ' ' + cfg.unit : 'No data'
            }
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { font: { size: 10 }, maxRotation: 45, color: '#6B7A73' }
            },
            y: {
              grid: { color: '#E1D7BA40' },
              ticks: { font: { size: 10 }, color: '#6B7A73' }
            }
          }
        }
      });

      this.charts.push(chart);
    }
  }

  buildComparison(data: any) {
    if (!data?.current) { this.comparisonItems = []; return; }

    const fields = [
      { key: 'avg_hr', label: 'Heart Rate', unit: 'bpm', lower: true },
      { key: 'avg_sys', label: 'Systolic BP', unit: 'mmHg', lower: true },
      { key: 'avg_dia', label: 'Diastolic BP', unit: 'mmHg', lower: true },
      { key: 'avg_o2', label: 'Oxygen', unit: '%', lower: false },
      { key: 'avg_sleep', label: 'Sleep', unit: 'hrs', lower: false },
      { key: 'total_steps', label: 'Steps', unit: 'steps', lower: false },
    ];

    this.comparisonItems = fields.map(f => {
      const cur = data.current?.[f.key];
      const prev = data.previous?.[f.key];
      const curNum = cur != null ? Number(cur) : null;
      const prevNum = prev != null ? Number(prev) : null;
      if (curNum === null || prevNum === null) return { label: f.label, current: curNum !== null ? curNum.toFixed(1) : '--', unit: f.unit, change: null, changeText: '', changeClass: '', changeIcon: '' };

      const diff = curNum - prevNum;
      const pct = prevNum !== 0 ? Math.abs(diff / prevNum * 100) : 0;
      const improved = f.lower ? diff < -0.5 : diff > 0.5;
      const worsened = f.lower ? diff > 0.5 : diff < -0.5;

      return {
        label: f.label,
        current: curNum.toFixed(1),
        unit: f.unit,
        change: diff,
        changeText: (diff > 0 ? '+' : '') + diff.toFixed(1) + ' (' + pct.toFixed(0) + '%)',
        changeClass: improved ? 'improved' : worsened ? 'worsened' : 'stable',
        changeIcon: improved ? '↑' : worsened ? '↓' : '→',
      };
    });
  }

  getStats(field: string) {
    return this.statsCache[field] || { avg: '--', min: '--', max: '--' };
  }

  getTrend(field: string) {
    return this.trendCache[field] || null;
  }

  getScoreClass(score: number): string {
    if (!score) return '';
    if (score >= 80) return 'score-good';
    if (score >= 60) return 'score-fair';
    return 'score-bad';
  }
}
