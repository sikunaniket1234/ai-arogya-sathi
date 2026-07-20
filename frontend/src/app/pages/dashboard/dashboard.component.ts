import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';

interface SparkData {
  label: string;
  color: string;
  values: number[];
  current: string;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  icon: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dash" [class.loaded]="loaded">
      <!-- Confetti canvas -->
      <canvas *ngIf="showConfetti" #confettiCanvas class="confetti-canvas"></canvas>

      <!-- Hero greeting with gradient -->
      <div class="hero-greeting" [class]="timeOfDay">
        <div class="hero-content">
          <div class="hero-emoji">{{ getGreetingEmoji() }}</div>
          <div class="hero-text">
            <h1>{{ getGreeting() }}, <span class="name-highlight">{{ user?.name || 'Friend' }}</span>!</h1>
            <p class="hero-sub">{{ getGreetingMessage() }}</p>
          </div>
        </div>
        <div class="hero-actions hide-mobile">
          <a routerLink="/profiles" class="hero-btn pulse-btn">
            <span class="btn-icon-inner">➕</span> New Profile
          </a>
          <a routerLink="/emergency" class="hero-btn emergency-hero-btn">
            <span class="btn-icon-inner">⚠</span> SOS
          </a>
        </div>
      </div>

      <!-- Notification toasts -->
      <div class="toast-container" *ngIf="showToast">
        <div class="toast" [class]="'toast-' + toastType" (click)="showToast = false">
          <span class="toast-icon">{{ toastType === 'success' ? '✓' : toastType === 'warning' ? '⚠' : 'ℹ' }}</span>
          <span class="toast-msg">{{ toastMessage }}</span>
          <span class="toast-close">&times;</span>
        </div>
      </div>

      <!-- Animated Stats Row -->
      <div class="stats-row">
        <div class="stat-card gradient-green" (click)="openPopup('profiles')">
          <div class="stat-ring">
            <svg viewBox="0 0 36 36">
              <path class="ring-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
              <path class="ring-fill green" [attr.stroke-dasharray]="getProfileRing() + ', 100'" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
            </svg>
            <div class="ring-emoji">👪</div>
          </div>
          <div class="stat-body">
            <div class="stat-value counter">{{ profiles.length }}</div>
            <div class="stat-label">Family Members</div>
          </div>
          <div class="stat-sparkle">✨</div>
        </div>

        <div class="stat-card" [class]="getScoreGradient(score.score)" *ngFor="let score of healthScores" (click)="openPopup('health-' + score.name)">
          <div class="stat-ring">
            <svg viewBox="0 0 36 36">
              <path class="ring-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
              <path class="ring-fill" [class]="getScoreRingColor(score.score)" [attr.stroke-dasharray]="score.score + ', 100'" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
            </svg>
            <div class="ring-emoji">{{ getScoreEmoji(score.score) }}</div>
          </div>
          <div class="stat-body">
            <div class="stat-value counter" [class]="getScoreClass(score.score)">{{ score.score ?? '--' }}</div>
            <div class="stat-label">{{ score.name }}</div>
          </div>
          <div class="stat-badge" [class]="getScoreBadge(score.score)">{{ getScoreLabel(score.score) }}</div>
        </div>

        <div class="stat-card gradient-blue" *ngIf="healthScores.length === 0" (click)="openPopup('no-data')">
          <div class="stat-ring">
            <svg viewBox="0 0 36 36">
              <path class="ring-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
            </svg>
            <div class="ring-emoji">🩹</div>
          </div>
          <div class="stat-body">
            <div class="stat-value">--</div>
            <div class="stat-label">Start Tracking</div>
          </div>
        </div>
      </div>

      <!-- Quick Actions Grid - Colorful -->
      <div class="section-header">
        <h2>⚡ Quick Actions</h2>
      </div>
      <div class="quick-grid">
        <a *ngIf="profiles.length > 0" [routerLink]="['/symptom', profiles[0].id]" class="quick-card qc-symptom">
          <div class="qc-glow"></div>
          <div class="qc-icon">🩺</div>
          <div class="qc-info">
            <strong>Symptom Check</strong>
            <span>AI-powered analysis</span>
          </div>
          <div class="qc-arrow">➔</div>
        </a>
        <a routerLink="/profiles" class="quick-card qc-profiles">
          <div class="qc-glow"></div>
          <div class="qc-icon">👥</div>
          <div class="qc-info">
            <strong>Family Profiles</strong>
            <span>{{ profiles.length }} members</span>
          </div>
          <div class="qc-arrow">➔</div>
        </a>
        <a routerLink="/devices" class="quick-card qc-devices">
          <div class="qc-glow"></div>
          <div class="qc-icon">⌚</div>
          <div class="qc-info">
            <strong>Connect Device</strong>
            <span>Wearables & sensors</span>
          </div>
          <div class="qc-arrow">➔</div>
        </a>
        <a routerLink="/community" class="quick-card qc-community">
          <div class="qc-glow"></div>
          <div class="qc-icon">🏠</div>
          <div class="qc-info">
            <strong>Community</strong>
            <span>Schemes & camps</span>
          </div>
          <div class="qc-arrow">➔</div>
        </a>
        <a routerLink="/emergency" class="quick-card qc-emergency">
          <div class="qc-glow"></div>
          <div class="qc-icon">🚨</div>
          <div class="qc-info">
            <strong>Emergency</strong>
            <span>SOS & first aid</span>
          </div>
          <div class="qc-arrow">➔</div>
        </a>
      </div>

      <!-- Family Profiles Section -->
      <div class="section" *ngIf="profiles.length > 0">
        <div class="section-header">
          <h2>🏠 My Family</h2>
          <a routerLink="/profiles" class="btn btn-outline btn-sm">View All →</a>
        </div>
        <div class="family-grid">
          <div class="family-card" *ngFor="let p of profiles; let i = index" [style.animation-delay]="(i * 80) + 'ms'" (click)="openPopup('profile-' + p.id)">
            <div class="family-card-header" [style.background]="getGradient(p.name)">
              <div class="family-avatar-lg" [style.background]="getAvatarColor(p.name)">{{ p.name.charAt(0) }}</div>
              <div class="family-quick-actions">
                <a [routerLink]="['/symptom', p.id]" class="fqa-btn fqa-symptom" title="Symptom Check" (click)="$event.stopPropagation()">🩺</a>
                <a [routerLink]="['/trends', p.id]" class="fqa-btn fqa-trends" title="Health Trends" (click)="$event.stopPropagation()">📈</a>
                <a [routerLink]="['/medical-card', p.id]" class="fqa-btn fqa-card" title="Medical Card" (click)="$event.stopPropagation()">💳</a>
              </div>
            </div>
            <div class="family-card-body">
              <div class="family-name">{{ p.name }}</div>
              <div class="family-meta">
                <span class="meta-chip">{{ p.age }} yrs</span>
                <span class="meta-chip" *ngIf="p.blood_group">{{ p.blood_group }}</span>
                <span class="meta-chip meta-gender">{{ p.gender || 'N/A' }}</span>
              </div>
              <div class="family-tags" *ngIf="p.conditions && p.conditions.length > 0">
                <span class="cond-tag" *ngFor="let c of p.conditions.slice(0, 2)">{{ c }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sparklines Section -->
      <div class="section" *ngIf="hasSparkData">
        <div class="section-header">
          <h2>📈 Vital Trends</h2>
          <span class="header-tag hide-mobile">Last 14 days</span>
        </div>
        <div class="spark-wrapper" *ngFor="let ps of profileSparks">
          <div class="spark-profile" *ngIf="ps.vitals.length > 0">
            <div class="spark-profile-header">
              <div class="spark-profile-dot" [style.background]="getGradient(ps.name)"></div>
              <span class="spark-profile-name">{{ ps.name }}</span>
            </div>
            <div class="spark-grid">
              <div class="spark-card" *ngFor="let s of ps.vitals" [style.border-left-color]="s.color">
                <div class="spark-top">
                  <span class="spark-icon">{{ s.icon }}</span>
                  <span class="spark-trend" [class]="'trend-' + s.trend">
                    {{ getTrendArrow(s.trend) }}
                  </span>
                </div>
                <div class="spark-label" [style.color]="s.color">{{ s.label }}</div>
                <div class="spark-val">{{ s.current }}<span class="spark-unit">{{ s.unit }}</span></div>
                <svg class="spark-svg" viewBox="0 0 120 40" preserveAspectRatio="none">
                  <defs>
                    <linearGradient [attr.id]="getGradId(s.label)" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" [attr.stop-color]="s.color" stop-opacity="0.3"/>
                      <stop offset="100%" [attr.stop-color]="s.color" stop-opacity="0"/>
                    </linearGradient>
                  </defs>
                  <polygon [attr.fill]="'url(#' + getGradId(s.label) + ')'" [attr.points]="getSparkArea(s.values)" />
                  <polyline fill="none" [attr.stroke]="s.color" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
                    [attr.points]="getSparkPoints(s.values)" />
                  <circle *ngIf="s.values.length > 0" [attr.cx]="120" [attr.cy]="getSparkLastY(s.values)" r="3" [attr.fill]="s.color"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty sparkline state -->
      <div class="section" *ngIf="profiles.length > 0 && profileSparks.length === 0">
        <div class="empty-state">
          <div class="empty-anim">
            <div class="empty-circle c1"></div>
            <div class="empty-circle c2"></div>
            <div class="empty-circle c3"></div>
            <div class="empty-emoji">🩹</div>
          </div>
          <h3>Start Your Health Journey</h3>
          <p>Connect a device or run a symptom check to see health trends here</p>
          <a routerLink="/devices" class="btn btn-primary btn-sm">Connect Device 🔗</a>
        </div>
      </div>

      <!-- Popup Modal -->
      <div class="popup-overlay" *ngIf="popupData" (click)="closePopup()">
        <div class="popup-card" (click)="$event.stopPropagation()">
          <button class="popup-close" (click)="closePopup()">&times;</button>
          <div class="popup-header" [style.background]="popupData.gradient || 'var(--marigold)'">
            <div class="popup-emoji">{{ popupData.emoji }}</div>
            <h3>{{ popupData.title }}</h3>
          </div>
          <div class="popup-body">
            <p>{{ popupData.message }}</p>
            <div class="popup-actions" *ngIf="popupData.actions">
              <a *ngFor="let a of popupData.actions" [routerLink]="a.link" class="popup-btn" [class]="a.class || ''" (click)="closePopup()">
                {{ a.icon }} {{ a.label }}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* ── Confetti ── */
    .confetti-canvas {
      position: fixed;
      top: 0; left: 0;
      width: 100vw; height: 100vh;
      pointer-events: none;
      z-index: 9999;
    }

    /* ── Animations ── */
    @keyframes slideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes popIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
    @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
    @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
    @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
    @keyframes ringPulse { 0%, 100% { filter: drop-shadow(0 0 0px transparent); } 50% { filter: drop-shadow(0 0 8px rgba(111,191,140,0.3)); } }
    @keyframes glowPulse { 0%, 100% { opacity: 0; } 50% { opacity: 1; } }
    @keyframes toastIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    @keyframes popFloat { 0% { transform: scale(0.8) translateY(10px); opacity: 0; } 100% { transform: scale(1) translateY(0); opacity: 1; } }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

    .dash { padding-bottom: 40px; opacity: 0; animation: fadeIn 0.5s ease forwards; }
    .dash.loaded { opacity: 1; }
    .section { animation: slideUp 0.5s ease both; }
    .section:nth-child(2) { animation-delay: 0.1s; }
    .section:nth-child(3) { animation-delay: 0.2s; }
    .section:nth-child(4) { animation-delay: 0.3s; }

    /* ── Hero Greeting ── */
    .hero-greeting {
      border-radius: 16px;
      padding: 28px 24px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      position: relative;
      overflow: hidden;
      animation: popIn 0.4s ease both;
    }
    .hero-greeting.morning {
      background: linear-gradient(135deg, #FDE68A 0%, #FBBF24 30%, #F59E0B 70%, #D97706 100%);
    }
    .hero-greeting.afternoon {
      background: linear-gradient(135deg, #A7F3D0 0%, #34D399 30%, #10B981 70%, #059669 100%);
    }
    .hero-greeting.evening {
      background: linear-gradient(135deg, #C7D2FE 0%, #818CF8 30%, #6366F1 70%, #4338CA 100%);
    }
    .hero-greeting.evening .hero-text,
    .hero-greeting.evening .hero-sub { color: white; }
    .hero-greeting.evening .hero-btn { color: white; border-color: rgba(255,255,255,0.4); }
    .hero-greeting.evening .hero-btn:hover { background: rgba(255,255,255,0.15); }

    .hero-content { display: flex; align-items: center; gap: 16px; }
    .hero-emoji { font-size: 3rem; animation: float 3s ease-in-out infinite; }
    .hero-text h1 { font-size: 1.5rem; font-weight: 700; margin-bottom: 4px; }
    .name-highlight { text-decoration: underline; text-decoration-style: wavy; text-underline-offset: 4px; }
    .hero-sub { font-size: 0.9rem; opacity: 0.85; }
    .hero-actions { display: flex; gap: 10px; flex-shrink: 0; }
    .hero-btn {
      display: flex; align-items: center; gap: 6px;
      padding: 10px 18px; border-radius: 10px;
      border: 2px solid rgba(0,0,0,0.1);
      background: rgba(255,255,255,0.5);
      backdrop-filter: blur(10px);
      color: var(--ink); font-weight: 600; font-size: 0.85rem;
      text-decoration: none;
      transition: all 0.2s;
    }
    .hero-btn:hover { background: rgba(255,255,255,0.8); transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .pulse-btn { animation: pulse 2s ease-in-out infinite; }
    .emergency-hero-btn { background: rgba(255,107,74,0.9) !important; color: white !important; border-color: rgba(255,107,74,0.9) !important; }
    .emergency-hero-btn:hover { background: rgba(255,70,40,1) !important; }
    .btn-icon-inner { font-size: 1rem; }

    /* ── Toast ── */
    .toast-container { position: fixed; top: 20px; right: 20px; z-index: 10000; }
    .toast {
      display: flex; align-items: center; gap: 10px;
      padding: 14px 20px; border-radius: 12px;
      background: white; border: 1px solid var(--line);
      box-shadow: 0 8px 30px rgba(0,0,0,0.15);
      animation: toastIn 0.3s ease;
      cursor: pointer; font-size: 0.88rem;
    }
    .toast-icon { font-size: 1.2rem; }
    .toast-close { margin-left: auto; opacity: 0.4; }

    /* ── Stats Row ── */
    .stats-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 14px; margin-bottom: 28px;
    }
    .stat-card {
      position: relative;
      background: white;
      border: 1px solid var(--line);
      border-radius: 16px;
      padding: 18px;
      display: flex;
      align-items: center;
      gap: 14px;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      overflow: hidden;
      animation: popFloat 0.5s ease both;
    }
    .stat-card:nth-child(1) { animation-delay: 0.05s; }
    .stat-card:nth-child(2) { animation-delay: 0.1s; }
    .stat-card:nth-child(3) { animation-delay: 0.15s; }
    .stat-card:nth-child(4) { animation-delay: 0.2s; }
    .stat-card:hover { transform: translateY(-4px) scale(1.02); box-shadow: 0 8px 24px rgba(0,0,0,0.1); }

    .stat-card.gradient-green { border-left: 4px solid var(--green); }
    .stat-card.gradient-green:hover { background: linear-gradient(135deg, rgba(111,191,140,0.05), rgba(111,191,140,0.02)); }
    .stat-card.gradient-gold { border-left: 4px solid var(--marigold); }
    .stat-card.gradient-coral { border-left: 4px solid var(--coral); }
    .stat-card.gradient-blue { border-left: 4px solid #3B82F6; }
    .stat-card.gradient-purple { border-left: 4px solid #8B5CF6; }

    .stat-ring {
      width: 56px; height: 56px; position: relative;
      animation: ringPulse 3s ease-in-out infinite;
    }
    .stat-ring svg { width: 100%; height: 100%; transform: rotate(-90deg); }
    .ring-bg { fill: none; stroke: #eee; stroke-width: 2.5; }
    .ring-fill { fill: none; stroke: var(--green); stroke-width: 2.5; stroke-linecap: round; transition: stroke-dasharray 1s ease; }
    .ring-fill.green { stroke: var(--green); }
    .ring-fill.gold { stroke: var(--marigold); }
    .ring-fill.coral { stroke: var(--coral); }
    .ring-fill.blue { stroke: #3B82F6; }
    .ring-emoji {
      position: absolute; top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      font-size: 1.3rem;
    }

    .stat-value { font-size: 1.5rem; font-weight: 700; color: var(--ink); line-height: 1.2; }
    .stat-label { font-size: 0.78rem; color: var(--muted); margin-top: 2px; }
    .stat-badge {
      position: absolute; top: 10px; right: 10px;
      padding: 2px 8px; border-radius: 10px;
      font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;
    }
    .badge-excellent { background: #D1FAE5; color: #065F46; }
    .badge-good { background: #E0F2FE; color: #075985; }
    .badge-fair { background: #FEF3C7; color: #92400E; }
    .badge-poor { background: #FEE2E2; color: #991B1B; }
    .stat-sparkle { position: absolute; bottom: 8px; right: 10px; font-size: 0.9rem; opacity: 0.3; }

    .score-good { color: var(--green); }
    .score-fair { color: var(--marigold); }
    .score-bad { color: var(--coral); }

    /* ── Quick Actions ── */
    .quick-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 12px; margin-bottom: 32px;
    }
    .quick-card {
      position: relative;
      display: flex; align-items: center; gap: 12px;
      padding: 16px 18px;
      background: white;
      border: 1px solid var(--line);
      border-radius: 14px;
      text-decoration: none; color: var(--ink-text);
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      overflow: hidden;
      animation: popFloat 0.4s ease both;
    }
    .quick-card:nth-child(1) { animation-delay: 0.05s; }
    .quick-card:nth-child(2) { animation-delay: 0.1s; }
    .quick-card:nth-child(3) { animation-delay: 0.15s; }
    .quick-card:nth-child(4) { animation-delay: 0.2s; }
    .quick-card:nth-child(5) { animation-delay: 0.25s; }
    .quick-card:hover { transform: translateY(-3px) scale(1.02); box-shadow: 0 6px 20px rgba(0,0,0,0.1); }
    .quick-card:active { transform: scale(0.98); }

    .qc-glow {
      position: absolute; top: -20px; right: -20px;
      width: 80px; height: 80px; border-radius: 50%;
      opacity: 0; transition: opacity 0.3s;
    }
    .quick-card:hover .qc-glow { opacity: 1; }

    .qc-symptom { border-left: 4px solid #E8A33D; }
    .qc-symptom .qc-glow { background: radial-gradient(circle, rgba(232,163,61,0.15), transparent); }
    .qc-symptom .qc-icon { background: linear-gradient(135deg, #FEF3C7, #FDE68A); color: #92400E; }

    .qc-profiles { border-left: 4px solid #6FBF8C; }
    .qc-profiles .qc-glow { background: radial-gradient(circle, rgba(111,191,140,0.15), transparent); }
    .qc-profiles .qc-icon { background: linear-gradient(135deg, #D1FAE5, #A7F3D0); color: #065F46; }

    .qc-devices { border-left: 4px solid #3B82F6; }
    .qc-devices .qc-glow { background: radial-gradient(circle, rgba(59,130,246,0.15), transparent); }
    .qc-devices .qc-icon { background: linear-gradient(135deg, #DBEAFE, #BFDBFE); color: #1E40AF; }

    .qc-community { border-left: 4px solid #8B5CF6; }
    .qc-community .qc-glow { background: radial-gradient(circle, rgba(139,92,246,0.15), transparent); }
    .qc-community .qc-icon { background: linear-gradient(135deg, #EDE9FE, #DDD6FE); color: #5B21B6; }

    .qc-emergency { border-left: 4px solid #FF6B4A; }
    .qc-emergency .qc-glow { background: radial-gradient(circle, rgba(255,107,74,0.15), transparent); }
    .qc-emergency .qc-icon { background: linear-gradient(135deg, #FEE2E2, #FECACA); color: #991B1B; }

    .qc-icon {
      width: 44px; height: 44px; border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.3rem; flex-shrink: 0;
    }
    .qc-info strong { display: block; font-size: 0.88rem; font-weight: 600; }
    .qc-info span { font-size: 0.76rem; color: var(--muted); }
    .qc-arrow { margin-left: auto; opacity: 0; transform: translateX(-8px); transition: all 0.2s; font-size: 0.9rem; }
    .quick-card:hover .qc-arrow { opacity: 0.5; transform: translateX(0); }

    /* ── Section headers ── */
    .section { margin-bottom: 32px; animation: slideUp 0.5s ease both; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .section-header h2 { font-size: 1.15rem; font-weight: 600; }
    .header-tag { font-size: 0.75rem; color: var(--muted); background: var(--paper); padding: 4px 12px; border-radius: 12px; border: 1px solid var(--line); }

    /* ── Family Cards ── */
    .family-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 14px;
    }
    .family-card {
      background: white;
      border: 1px solid var(--line);
      border-radius: 16px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      animation: popFloat 0.4s ease both;
    }
    .family-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.1); }

    .family-card-header {
      padding: 18px 16px 14px;
      display: flex; align-items: center; justify-content: space-between;
    }
    .family-avatar-lg {
      width: 52px; height: 52px; border-radius: 50%;
      color: white; display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 1.3rem;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      border: 3px solid rgba(255,255,255,0.5);
    }
    .family-quick-actions { display: flex; gap: 6px; }
    .fqa-btn {
      width: 34px; height: 34px; border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.9rem;
      background: rgba(255,255,255,0.5); backdrop-filter: blur(8px);
      border: 1px solid rgba(255,255,255,0.3);
      transition: all 0.2s; text-decoration: none;
    }
    .fqa-btn:hover { background: rgba(255,255,255,0.9); transform: scale(1.1); }

    .family-card-body { padding: 0 16px 16px; }
    .family-name { font-weight: 700; font-size: 1rem; margin-bottom: 6px; }
    .family-meta { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 8px; }
    .meta-chip {
      padding: 2px 8px; border-radius: 6px;
      font-size: 0.72rem; font-weight: 500;
      background: var(--paper); color: var(--muted);
    }
    .meta-gender { background: #EDE9FE; color: #5B21B6; }
    .family-tags { display: flex; gap: 4px; flex-wrap: wrap; }
    .cond-tag {
      padding: 2px 8px; border-radius: 6px;
      font-size: 0.68rem; font-weight: 500;
      background: #FEF3C7; color: #92400E;
    }

    /* ── Sparklines ── */
    .spark-wrapper { margin-bottom: 18px; }
    .spark-profile-header {
      display: flex; align-items: center; gap: 8px; margin-bottom: 12px;
    }
    .spark-profile-dot { width: 10px; height: 10px; border-radius: 50%; }
    .spark-profile-name { font-size: 0.88rem; font-weight: 600; }
    .spark-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(155px, 1fr));
      gap: 10px;
    }
    .spark-card {
      background: white;
      border: 1px solid var(--line);
      border-left: 3px solid;
      border-radius: 10px;
      padding: 12px;
      transition: all 0.2s;
    }
    .spark-card:hover { box-shadow: var(--shadow-md); transform: translateY(-2px); }
    .spark-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px; }
    .spark-icon { font-size: 0.9rem; }
    .spark-trend { font-size: 0.7rem; }
    .trend-up { color: var(--coral); }
    .trend-down { color: var(--green); }
    .trend-stable { color: var(--muted); }
    .spark-label { font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 2px; }
    .spark-val { font-size: 1.2rem; font-weight: 700; color: var(--ink); margin-bottom: 4px; }
    .spark-unit { font-size: 0.65rem; color: var(--muted); margin-left: 2px; font-weight: 400; }
    .spark-svg { width: 100%; height: 32px; }

    /* ── Empty state ── */
    .empty-state {
      text-align: center; padding: 48px 24px;
      background: white; border: 1px dashed var(--line);
      border-radius: 16px; position: relative;
    }
    .empty-anim { position: relative; width: 80px; height: 80px; margin: 0 auto 20px; }
    .empty-circle {
      position: absolute; border-radius: 50%;
      border: 2px solid var(--marigold); opacity: 0.2;
    }
    .empty-circle.c1 { width: 80px; height: 80px; top: 0; left: 0; animation: spin 8s linear infinite; }
    .empty-circle.c2 { width: 60px; height: 60px; top: 10px; left: 10px; animation: spin 6s linear infinite reverse; border-color: var(--green); }
    .empty-circle.c3 { width: 40px; height: 40px; top: 20px; left: 20px; animation: spin 4s linear infinite; border-color: var(--coral); }
    .empty-emoji { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 1.5rem; }
    .empty-state h3 { font-size: 1.2rem; margin-bottom: 8px; }
    .empty-state p { color: var(--muted); font-size: 0.9rem; margin-bottom: 16px; }

    /* ── Popup ── */
    .popup-overlay {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);
      z-index: 9999; display: flex; align-items: center; justify-content: center;
      animation: fadeIn 0.2s ease;
    }
    .popup-card {
      background: white; border-radius: 20px;
      width: 90%; max-width: 420px;
      overflow: hidden;
      animation: popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      box-shadow: 0 20px 60px rgba(0,0,0,0.2);
    }
    .popup-close {
      position: absolute; top: 12px; right: 16px;
      background: rgba(255,255,255,0.3); border: none;
      width: 32px; height: 32px; border-radius: 50%;
      font-size: 1.2rem; cursor: pointer; color: white;
      display: flex; align-items: center; justify-content: center;
      transition: background 0.2s;
    }
    .popup-close:hover { background: rgba(255,255,255,0.5); }
    .popup-header {
      padding: 24px; text-align: center; color: white;
      position: relative;
    }
    .popup-emoji { font-size: 3rem; margin-bottom: 8px; }
    .popup-header h3 { font-size: 1.2rem; }
    .popup-body { padding: 24px; }
    .popup-body p { color: var(--muted); font-size: 0.9rem; margin-bottom: 16px; line-height: 1.6; }
    .popup-actions { display: flex; flex-direction: column; gap: 8px; }
    .popup-btn {
      display: flex; align-items: center; justify-content: center; gap: 8px;
      padding: 12px; border-radius: 10px; font-weight: 600; font-size: 0.88rem;
      text-decoration: none; color: white; transition: all 0.2s;
    }
    .popup-btn:hover { opacity: 0.85; transform: translateY(-1px); }
    .popup-btn-primary { background: var(--marigold); color: var(--ink); }
    .popup-btn-secondary { background: var(--ink); }
    .popup-btn-danger { background: var(--coral); }
    .popup-btn-info { background: #3B82F6; }

    /* ── Responsive ── */
    @media (max-width: 600px) {
      .hero-greeting { flex-direction: column; text-align: center; padding: 20px 16px; }
      .hero-content { flex-direction: column; gap: 8px; }
      .hero-emoji { font-size: 2.2rem; }
      .hero-text h1 { font-size: 1.2rem; }
      .stats-row { grid-template-columns: repeat(2, 1fr); }
      .quick-grid { grid-template-columns: 1fr; }
      .family-grid { grid-template-columns: 1fr; }
      .spark-grid { grid-template-columns: repeat(2, 1fr); }
    }
  `],
})
export class DashboardComponent implements OnInit {
  user: any;
  profiles: any[] = [];
  healthScores: any[] = [];
  notifications: any[] = [];
  profileSparks: { name: string; vitals: SparkData[] }[] = [];
  timeOfDay = 'morning';
  hasSparkData = false;
  loaded = false;
  showConfetti = false;
  showToast = false;
  toastMessage = '';
  toastType: 'success' | 'warning' | 'info' = 'info';
  popupData: any = null;

  private avatarColors = [
    '#E8A33D', '#6FBF8C', '#2563EB', '#9333EA',
    '#0891B2', '#DC2626', '#059669', '#D97706',
  ];

  private gradients = [
    'linear-gradient(135deg, #FEF3C7, #FDE68A)',
    'linear-gradient(135deg, #D1FAE5, #A7F3D0)',
    'linear-gradient(135deg, #DBEAFE, #BFDBFE)',
    'linear-gradient(135deg, #EDE9FE, #DDD6FE)',
    'linear-gradient(135deg, #FCE7F3, #FBCFE8)',
    'linear-gradient(135deg, #FEE2E2, #FECACA)',
  ];

  private vitalConfig: { key: string; label: string; color: string; unit: string; avg: number; icon: string }[] = [
    { key: 'avg_heart_rate', label: 'Heart Rate', color: '#EF4444', unit: ' bpm', avg: 72, icon: '❤️' },
    { key: 'avg_systolic', label: 'BP Systolic', color: '#8B5CF6', unit: ' mmHg', avg: 120, icon: '🩺' },
    { key: 'avg_diastolic', label: 'BP Diastolic', color: '#A78BFA', unit: ' mmHg', avg: 80, icon: '🩺' },
    { key: 'avg_oxygen', label: 'SpO2', color: '#3B82F6', unit: '%', avg: 97, icon: '💨' },
    { key: 'avg_temperature', label: 'Temp', color: '#F59E0B', unit: '°C', avg: 98.4, icon: '🌡️' },
    { key: 'avg_sleep', label: 'Sleep', color: '#10B981', unit: 'h', avg: 7, icon: '😴' },
  ];

  constructor(private auth: AuthService, private api: ApiService) {}

  ngOnInit() {
    this.user = this.auth.getUser();
    this.setTimeOfDay();
    this.api.getProfiles().subscribe({
      next: (data: any) => {
        this.profiles = data;
        this.loadHealthScores();
        setTimeout(() => this.triggerConfetti(), 600);
      },
      error: () => (this.profiles = []),
    });
    this.api.getNotifications(true).subscribe({
      next: (data: any) => {
        this.notifications = data;
        if (data.length > 0) {
          setTimeout(() => this.showToastNotification(data[0].title + ': ' + data[0].message, 'info'), 1500);
        }
      },
      error: () => {}
    });
    this.loaded = true;
  }

  getGreeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  }

  getGreetingEmoji(): string {
    const h = new Date().getHours();
    if (h < 12) return '🌅';
    if (h < 17) return '☀️';
    return '🌙';
  }

  getGreetingMessage(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Start your day with good health';
    if (h < 17) return 'Stay hydrated and take breaks!';
    return 'Wind down and rest well tonight';
  }

  getScoreEmoji(score: number): string {
    if (score >= 80) return '💪';
    if (score >= 60) return '😊';
    return '😟';
  }

  getTrendArrow(trend: string): string {
    if (trend === 'up') return '▲';
    if (trend === 'down') return '▼';
    return '―';
  }

  setTimeOfDay() {
    const h = new Date().getHours();
    if (h < 12) this.timeOfDay = 'morning';
    else if (h < 17) this.timeOfDay = 'afternoon';
    else this.timeOfDay = 'evening';
  }

  getGradient(name: string): string {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return this.gradients[Math.abs(hash) % this.gradients.length];
  }

  getAvatarColor(name: string): string {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return this.avatarColors[Math.abs(hash) % this.avatarColors.length];
  }

  getProfileRing(): number {
    return Math.min(this.profiles.length * 25, 100);
  }

  getScoreGradient(score: number): string {
    if (score >= 80) return 'gradient-green';
    if (score >= 60) return 'gradient-gold';
    return 'gradient-coral';
  }

  getScoreRingColor(score: number): string {
    if (score >= 80) return 'green';
    if (score >= 60) return 'gold';
    return 'coral';
  }

  getScoreBadge(score: number): string {
    if (score >= 90) return 'badge-excellent';
    if (score >= 75) return 'badge-good';
    if (score >= 60) return 'badge-fair';
    return 'badge-poor';
  }

  getScoreLabel(score: number): string {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Poor';
  }

  getScoreClass(score: number): string {
    if (!score) return '';
    if (score >= 80) return 'score-good';
    if (score >= 60) return 'score-fair';
    return 'score-bad';
  }

  loadHealthScores() {
    for (const p of this.profiles) {
      this.api.getHealthScore(p.id).subscribe({
        next: (score: any) => this.healthScores.push({ name: p.name, ...score }),
        error: () => {}
      });
      this.loadSparklines(p);
    }
  }

  loadSparklines(p: any) {
    this.api.getVitalTrends(p.id, 14).subscribe({
      next: (rows: any[]) => {
        const vitals: SparkData[] = [];
        for (const cfg of this.vitalConfig) {
          const values = rows.map(r => r[cfg.key] != null ? Math.round(Number(r[cfg.key]) * 10) / 10 : null).filter((v): v is number => v != null);
          if (values.length === 0) continue;
          const current = values[values.length - 1];
          const first = values[0];
          const pctChange = first !== 0 ? ((current - first) / first) * 100 : 0;
          let trend: 'up' | 'down' | 'stable' = 'stable';
          if (Math.abs(pctChange) > 5) {
            trend = cfg.key === 'avg_oxygen' ? (current < first ? 'down' : 'up') : (pctChange > 0 ? 'up' : 'down');
          }
          vitals.push({ label: cfg.label, color: cfg.color, values, current: String(current), unit: cfg.unit, trend, icon: cfg.icon });
        }
        this.profileSparks.push({ name: p.name, vitals });
        this.hasSparkData = this.profileSparks.some(ps => ps.vitals.length > 0);
      },
      error: () => {
        this.profileSparks.push({ name: p.name, vitals: [] });
        this.hasSparkData = this.profileSparks.some(ps => ps.vitals.length > 0);
      }
    });
  }

  getGradId(label: string): string {
    return 'grad-' + label.replace(/\s+/g, '-').toLowerCase();
  }

  getSparkPoints(values: number[]): string {
    if (values.length < 2) return '';
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const step = 120 / (values.length - 1);
    return values.map((v, i) => {
      const x = i * step;
      const y = 30 - ((v - min) / range) * 26;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
  }

  getSparkArea(values: number[]): string {
    if (values.length < 2) return '';
    const points = this.getSparkPoints(values);
    const minX = 0;
    const maxX = 120;
    return `${minX},32 ${points} ${maxX},32`;
  }

  getSparkLastY(values: number[]): number {
    if (values.length < 1) return 20;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const current = values[values.length - 1];
    return 30 - ((current - min) / range) * 26;
  }

  triggerConfetti() {
    this.showConfetti = true;
    setTimeout(() => { this.showConfetti = false; }, 3000);
  }

  showToastNotification(message: string, type: 'success' | 'warning' | 'info') {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    setTimeout(() => { this.showToast = false; }, 5000);
  }

  openPopup(key: string) {
    if (key === 'profiles') {
      this.popupData = {
        title: 'Family Members',
        emoji: '👨‍👩‍👧‍👦',
        gradient: 'linear-gradient(135deg, #34D399, #10B981)',
        message: `You have ${this.profiles.length} family member(s) registered. Manage profiles, track health, and keep everyone safe.`,
        actions: [
          { label: 'View All Profiles', link: '/profiles', icon: '👥', class: 'popup-btn-primary' },
          { label: 'Add New Member', link: '/profiles', icon: '➕', class: 'popup-btn-secondary' },
        ]
      };
    } else if (key === 'no-data') {
      this.popupData = {
        title: 'Get Started',
        emoji: '🚀',
        gradient: 'linear-gradient(135deg, #60A5FA, #3B82F6)',
        message: 'Add family profiles and connect devices to see health scores, vital trends, and personalized insights.',
        actions: [
          { label: 'Add Family Profile', link: '/profiles', icon: '👤', class: 'popup-btn-primary' },
          { label: 'Connect Device', link: '/devices', icon: '📡', class: 'popup-btn-info' },
        ]
      };
    } else if (key.startsWith('health-')) {
      const name = key.replace('health-', '');
      const score = this.healthScores.find(s => s.name === name);
      this.popupData = {
        title: `${name}'s Health Score`,
        emoji: score?.score >= 80 ? '💪' : score?.score >= 60 ? '😊' : '😟',
        gradient: score?.score >= 80 ? 'linear-gradient(135deg, #34D399, #10B981)' : score?.score >= 60 ? 'linear-gradient(135deg, #FBBF24, #F59E0B)' : 'linear-gradient(135deg, #FB923C, #EF4444)',
        message: `${name}'s health score is ${score?.score ?? 'N/A'} out of 100. ${score?.score >= 80 ? 'Looking great! Keep up the healthy habits.' : score?.score >= 60 ? 'There\'s room for improvement. Check vital trends for details.' : 'Consider consulting a doctor and tracking vitals regularly.'}`,
        actions: [
          { label: 'View Trends', link: '/trends/' + this.profiles.find(p => p.name === name)?.id, icon: '📈', class: 'popup-btn-primary' },
          { label: 'Symptom Check', link: '/symptom/' + this.profiles.find(p => p.name === name)?.id, icon: '🩺', class: 'popup-btn-secondary' },
        ]
      };
    } else if (key.startsWith('profile-')) {
      const id = key.replace('profile-', '');
      const p = this.profiles.find(pr => pr.id === id);
      if (p) {
        this.popupData = {
          title: p.name,
          emoji: p.gender === 'male' ? '👨' : p.gender === 'female' ? '👩' : '🧑',
          gradient: this.getGradient(p.name),
          message: `Age: ${p.age || 'N/A'} | Blood: ${p.blood_group || 'N/A'} | Gender: ${p.gender || 'N/A'}${p.conditions && p.conditions.length ? '\nConditions: ' + p.conditions.join(', ') : ''}${p.allergies && p.allergies.length ? '\nAllergies: ' + p.allergies.join(', ') : ''}`,
          actions: [
            { label: 'Symptom Check', link: '/symptom/' + id, icon: '🩺', class: 'popup-btn-primary' },
            { label: 'Health Trends', link: '/trends/' + id, icon: '📈', class: 'popup-btn-info' },
            { label: 'Medical Card', link: '/medical-card/' + id, icon: '🪪', class: 'popup-btn-secondary' },
          ]
        };
      }
    }
  }

  closePopup() {
    this.popupData = null;
  }
}
