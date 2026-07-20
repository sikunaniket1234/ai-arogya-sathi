import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="landing">
      <!-- NAV -->
      <nav class="top-nav" [class.scrolled]="navScrolled">
        <div class="nav-wrap">
          <a href="/" class="brand"><span class="dot"></span>AI Health Companion</a>
          <div class="nav-links hide-mobile">
            <a href="#about">About</a>
            <a href="#features">Features</a>
            <a href="#modules">Modules</a>
            <a href="#tech">Technology</a>
            <a href="#team">Team</a>
          </div>
          <div class="nav-actions hide-mobile">
            <ng-container *ngIf="!isLoggedIn">
              <a routerLink="/login" class="nav-btn">Sign In</a>
              <a routerLink="/register" class="nav-btn cta">Try Now</a>
            </ng-container>
            <ng-container *ngIf="isLoggedIn">
              <a routerLink="/dashboard" class="nav-btn cta">Dashboard</a>
              <button class="nav-btn" (click)="logout()">Logout</button>
            </ng-container>
          </div>
          <button class="mobile-toggle" (click)="mobileNavOpen = !mobileNavOpen" [class.open]="mobileNavOpen">
            <span></span><span></span><span></span>
          </button>
        </div>
        <div class="mobile-nav" *ngIf="mobileNavOpen">
          <a href="#about" (click)="mobileNavOpen=false">About</a>
          <a href="#features" (click)="mobileNavOpen=false">Features</a>
          <a href="#modules" (click)="mobileNavOpen=false">Modules</a>
          <a href="#tech" (click)="mobileNavOpen=false">Technology</a>
          <a href="#team" (click)="mobileNavOpen=false">Team</a>
          <div class="mob-divider"></div>
          <ng-container *ngIf="!isLoggedIn">
            <a routerLink="/login" (click)="mobileNavOpen=false">Sign In</a>
            <a routerLink="/register" class="mob-cta" (click)="mobileNavOpen=false">Try Now</a>
          </ng-container>
          <ng-container *ngIf="isLoggedIn">
            <a routerLink="/dashboard" class="mob-cta" (click)="mobileNavOpen=false">Go to Dashboard</a>
            <button class="mob-logout" (click)="logout()">Logout</button>
          </ng-container>
        </div>
      </nav>

      <!-- HERO / EXHIBITION BANNER -->
      <header class="hero">
        <div class="hero-bg-glow"></div>
        <div class="wrap">
          <div class="hero-content reveal">
            <!-- Exhibition Badge -->
            <div class="expo-badge">
              <span class="expo-icon">🏆</span>
              <span>SKILL EXPO-2026</span>
            </div>

            <!-- School Info -->
            <div class="school-info">
              <div class="school-name">St. Xavier's Public School</div>
              <div class="school-location">Adikundi Ichhapur, Cuttack</div>
              <div class="school-affiliation">Affiliation No: 1530411</div>
            </div>

            <h1 class="hero-title">AI Health Companion</h1>
            <p class="hero-subtitle">An offline-first, multilingual health companion for Indian families</p>
            <p class="hero-desc">
              AI Health Companion turns symptoms, wearable data, and government health programs into plain-language answers.
              Knows exactly when to say <strong>"see a doctor now."</strong>
            </p>

            <div class="hero-actions">
              <ng-container *ngIf="!isLoggedIn">
                <a routerLink="/register" class="cta-btn primary">Try It Free</a>
                <a routerLink="/login" class="cta-btn ghost">Sign In</a>
              </ng-container>
              <ng-container *ngIf="isLoggedIn">
                <a routerLink="/dashboard" class="cta-btn primary">Open Dashboard</a>
              </ng-container>
            </div>

            <div class="hero-trust">
              <span class="trust-item">&#10003; No data collection</span>
              <span class="trust-item">&#10003; Works offline</span>
              <span class="trust-item">&#10003; Multilingual</span>
            </div>
          </div>

          <!-- Product Mockup -->
          <div class="hero-mockup reveal">
            <div class="mockup-frame">
              <div class="mockup-topbar">
                <span class="mockup-dot red"></span>
                <span class="mockup-dot yellow"></span>
                <span class="mockup-dot green"></span>
                <span class="mockup-title">AI Health Companion</span>
              </div>
              <div class="mockup-content">
                <div class="demo-chat">
                  <div class="demo-msg user" [class.visible]="demoStep >= 0">
                    <span class="msg-avatar">R</span>
                    <div class="msg-bubble">I have had a headache for 3 days and slight fever</div>
                  </div>
                  <div class="demo-msg ai" [class.visible]="demoStep >= 1">
                    <span class="msg-avatar ai-avatar">🤖</span>
                    <div class="msg-bubble ai-bubble">
                      <div class="ai-thinking" *ngIf="demoStep === 1">
                        <span class="think-dot"></span><span class="think-dot"></span><span class="think-dot"></span>
                      </div>
                      <div *ngIf="demoStep >= 2">
                        <strong>Symptom Analysis:</strong><br>
                        Headache + low-grade fever for 3 days could indicate viral infection, tension headache, or early flu.
                        <br><br>
                        <strong>Home Remedies:</strong><br>
                        - Tulsi + ginger tea, rest in a cool room<br>
                        - Stay hydrated, paracetamol if needed
                        <br><br>
                        <span class="ai-action">⚠ See a doctor if fever exceeds 102&#176;F</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Exhibition Details Strip -->
        <div class="expo-strip">
          <div class="wrap">
            <div class="strip-grid">
              <div class="strip-item">
                <span class="strip-icon">🏛</span>
                <div>
                  <div class="strip-label">Venue</div>
                  <div class="strip-value">St. Xavier High School, Barabati</div>
                </div>
              </div>
              <div class="strip-item">
                <span class="strip-icon">🏅</span>
                <div>
                  <div class="strip-label">Exhibition</div>
                  <div class="strip-value">SKILL EXPO-2026</div>
                </div>
              </div>
              <div class="strip-item">
                <span class="strip-icon">📚</span>
                <div>
                  <div class="strip-label">Project</div>
                  <div class="strip-value">AI Health Companion</div>
                </div>
              </div>
              <div class="strip-item">
                <span class="strip-icon">👥</span>
                <div>
                  <div class="strip-label">Class</div>
                  <div class="strip-value">Project Exhibition</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- ABOUT -->
      <section id="about">
        <div class="wrap">
          <div class="section-intro reveal">
            <span class="section-tag">About the Project</span>
            <h2>Why we built this</h2>
            <p>
              In India, millions of families lack easy access to reliable health information.
              AI Health Companion bridges this gap with AI-powered symptom analysis, family health management,
              and emergency support &mdash; all working offline and in local languages.
            </p>
          </div>

          <div class="about-cards reveal">
            <div class="about-card">
              <span class="about-icon">🌎</span>
              <h3>Multilingual</h3>
              <p>Communicates in English, Hindi, and more &mdash; in simple, easy-to-understand language.</p>
            </div>
            <div class="about-card">
              <span class="about-icon">📩</span>
              <h3>Works Offline</h3>
              <p>Critical health features function without internet. Essential for rural connectivity.</p>
            </div>
            <div class="about-card">
              <span class="about-icon">👥</span>
              <h3>Family First</h3>
              <p>Manage health profiles for every family member &mdash; conditions, allergies, medications.</p>
            </div>
            <div class="about-card">
              <span class="about-icon">🛡</span>
              <h3>Safety Engine</h3>
              <p>Automatically detects emergency symptoms and escalates to professional help immediately.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- FEATURES -->
      <section id="features" class="dark-section">
        <div class="wrap">
          <div class="section-intro reveal">
            <span class="section-tag light">Features</span>
            <h2>Everything your family needs</h2>
            <p>From the first "I have a headache" to a scannable emergency card.</p>
          </div>

          <div class="features-grid reveal">
            <div class="feature-card" *ngFor="let f of features; let i = index" [class.highlight]="i === 0">
              <div class="feature-icon" [style.background]="f.bg" [style.color]="f.color">{{ f.icon }}</div>
              <h3>{{ f.title }}</h3>
              <p>{{ f.desc }}</p>
              <span class="feature-tag" *ngIf="f.tag">{{ f.tag }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- HOW IT WORKS -->
      <section id="how-it-works">
        <div class="wrap">
          <div class="section-intro reveal">
            <span class="section-tag">How it works</span>
            <h2>Simple, safe, grounded in facts</h2>
            <p>Every response is sourced from verified medical guidelines.</p>
          </div>

          <div class="flow-grid reveal">
            <div class="flow-card" *ngFor="let step of flowSteps; let i = index">
              <div class="flow-num">{{ (i + 1).toString().padStart(2, '0') }}</div>
              <div class="flow-icon">{{ step.icon }}</div>
              <h3>{{ step.title }}</h3>
              <p>{{ step.desc }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- MODULES -->
      <section id="modules" class="dark-section">
        <div class="wrap">
          <div class="section-intro reveal">
            <span class="section-tag light">Product Modules</span>
            <h2>10 working features</h2>
            <p>Each module is a real, functional component. Click to explore.</p>
          </div>

          <div class="module-grid reveal">
            <div class="module-card" *ngFor="let m of modules; let i = index"
              [class.open]="openModule === i" (click)="toggleModule(i)">
              <div class="module-header">
                <div class="module-left">
                  <span class="module-num">{{ (i + 1).toString().padStart(2, '0') }}</span>
                  <h3>{{ m.title }}</h3>
                </div>
                <span class="module-arrow" [class.rotated]="openModule === i">&#8595;</span>
              </div>
              <div class="module-body">
                <p>{{ m.desc }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- TECHNOLOGY -->
      <section id="tech">
        <div class="wrap">
          <div class="section-intro reveal">
            <span class="section-tag">Technology</span>
            <h2>Modern stack, reliable architecture</h2>
          </div>

          <div class="tech-grid reveal">
            <div class="arch-flow">
              <div class="arch-node" *ngFor="let node of archNodes; let i = index; let last = last">
                <span class="arch-icon">{{ node.icon }}</span>
                <span class="arch-label">{{ node.label }}</span>
                <span class="arch-arrow" *ngIf="!last">&#8595;</span>
              </div>
            </div>

            <div class="stack-cards">
              <div class="stack-card" *ngFor="let s of stackItems">
                <div class="stack-header">
                  <span class="stack-icon">{{ s.icon }}</span>
                  <h4>{{ s.category }}</h4>
                </div>
                <div class="stack-tags">
                  <span *ngFor="let t of s.tags">{{ t }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- TEAM -->
      <section id="team">
        <div class="wrap">
          <div class="section-intro reveal">
            <span class="section-tag">Our Team</span>
            <h2>Built with passion</h2>
            <p>A project exhibition submission.</p>
          </div>

          <div class="team-grid reveal">
            <!-- Mentor Card -->
            <div class="team-card mentor-card">
              <div class="team-role-badge">🎓 Mentor</div>
              <div class="team-avatar mentor-avatar">SB</div>
              <h3>Siddhant Bhatta</h3>
              <p class="team-role-title">Mentor & Guide</p>
              <p class="team-desc">Provided guidance, direction, and support throughout the development of this project.</p>
            </div>

            <!-- Developer Cards -->
            <div class="team-card dev-card">
              <div class="team-role-badge">💻 Developer</div>
              <div class="team-avatar dev-avatar">AN</div>
              <h3>Aryan Nayak</h3>
              <p class="team-role-title">Co-Developer</p>
            </div>

            <div class="team-card dev-card">
              <div class="team-role-badge">💻 Developer</div>
              <div class="team-avatar dev-avatar-2">SR</div>
              <h3>Swayanshu Swastik Routray</h3>
              <p class="team-role-title">Co-Developer</p>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA -->
      <section class="cta-section">
        <div class="wrap">
          <div class="cta-box reveal">
            <h2>Experience AI Health Companion</h2>
            <p>Built for SKILL EXPO-2026 &mdash; See how AI can make health information accessible to every Indian family.</p>
            <div class="cta-actions">
              <ng-container *ngIf="!isLoggedIn">
                <a routerLink="/register" class="cta-btn primary lg">Try It Free</a>
                <a routerLink="/login" class="cta-btn ghost lg">Sign In</a>
              </ng-container>
              <ng-container *ngIf="isLoggedIn">
                <a routerLink="/dashboard" class="cta-btn primary lg">Go to Dashboard</a>
              </ng-container>
            </div>
          </div>
        </div>
      </section>

      <!-- FOOTER -->
      <footer>
        <div class="wrap">
          <div class="footer-top">
            <div class="footer-brand">
              <a href="/" class="brand"><span class="dot"></span>AI Health Companion</a>
              <p>An offline-first health companion built for Indian families.</p>
            </div>
            <div class="footer-links">
              <a href="#about">About</a>
              <a href="#features">Features</a>
              <a href="#modules">Modules</a>
              <a href="#tech">Technology</a>
              <a href="#team">Team</a>
            </div>
          </div>
          <div class="footer-exhibition">
            <div class="footer-expo-badge">SKILL EXPO-2026</div>
            <p>Presented at <strong>St. Xavier High School, Barabati</strong></p>
            <p>By <strong>St. Xavier's Public School, Adikundi Ichhapur, Cuttack</strong> (Affiliation No: 1530411)</p>
          </div>
          <div class="footer-bottom">
            <span>&copy; 2026 AI Health Companion &mdash; SKILL EXPO-2026</span>
            <span>Developed by Aryan Nayak & Swayanshu Swastik Routray</span>
          </div>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .landing {
      background: var(--ink);
      color: var(--paper);
      font-family: var(--font-body);
      overflow-x: hidden;
    }
    .wrap { max-width: 1140px; margin: 0 auto; padding: 0 24px; }

    /* NAV */
    .top-nav {
      position: fixed; top: 0; left: 0; right: 0; z-index: 100;
      background: rgba(14,31,27,0.85);
      backdrop-filter: blur(16px);
      border-bottom: 1px solid rgba(255,255,255,0.06);
      transition: background 0.3s;
    }
    .top-nav.scrolled { background: rgba(14,31,27,0.97); }
    .nav-wrap {
      display: flex; align-items: center; justify-content: space-between;
      height: 60px; max-width: 1140px; margin: 0 auto; padding: 0 24px;
    }
    .brand {
      display: flex; align-items: center; gap: 10px;
      font-family: var(--font-display); font-size: 1.1rem;
      text-decoration: none; color: var(--paper);
    }
    .dot {
      width: 10px; height: 10px; border-radius: 50%;
      background: var(--coral);
      box-shadow: 0 0 0 3px rgba(255,107,74,0.2);
      animation: pulse-dot 2s ease-in-out infinite;
    }
    @keyframes pulse-dot { 0%,100%{transform:scale(1);box-shadow:0 0 0 3px rgba(255,107,74,0.2);} 50%{transform:scale(1.2);box-shadow:0 0 0 6px rgba(255,107,74,0.1);} }
    .nav-links { display: flex; gap: 28px; }
    .nav-links a {
      color: rgba(255,255,255,0.55); text-decoration: none;
      font-size: 0.82rem; font-weight: 500; letter-spacing: 0.01em;
      transition: color 0.2s;
    }
    .nav-links a:hover { color: var(--paper); }
    .nav-actions { display: flex; gap: 8px; align-items: center; }
    .nav-btn {
      padding: 7px 16px; font-size: 0.8rem; font-weight: 500;
      border: 1px solid rgba(255,255,255,0.12); border-radius: 6px;
      color: rgba(255,255,255,0.6); background: transparent;
      text-decoration: none; cursor: pointer; transition: all 0.2s;
    }
    .nav-btn:hover { color: white; border-color: rgba(255,255,255,0.25); }
    .nav-btn.cta {
      background: var(--marigold); color: var(--ink);
      border-color: var(--marigold); font-weight: 600;
    }
    .nav-btn.cta:hover { transform: translateY(-1px); }

    .mobile-toggle {
      display: none; width: 36px; height: 36px;
      flex-direction: column; align-items: center; justify-content: center;
      gap: 5px; background: none; border: none; cursor: pointer; border-radius: 6px;
    }
    .mobile-toggle span {
      display: block; width: 20px; height: 2px; background: white;
      border-radius: 1px; transition: all 0.25s;
    }
    .mobile-toggle.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
    .mobile-toggle.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
    .mobile-toggle.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
    .mobile-nav {
      display: none; flex-direction: column; padding: 8px 24px 16px; gap: 2px;
    }
    .mobile-nav a {
      display: block; padding: 10px 14px; color: rgba(255,255,255,0.6);
      text-decoration: none; font-size: 0.88rem; border-radius: 6px;
    }
    .mobile-nav a:hover { color: white; background: rgba(255,255,255,0.06); }
    .mob-divider { height: 1px; background: rgba(255,255,255,0.08); margin: 6px 0; }
    .mob-cta {
      background: var(--marigold) !important; color: var(--ink) !important;
      font-weight: 600; text-align: center;
    }
    .mob-logout {
      display: block; width: 100%; padding: 10px 14px;
      background: rgba(255,107,74,0.1); color: var(--coral);
      border: 1px solid rgba(255,107,74,0.2); border-radius: 6px;
      font-size: 0.88rem; cursor: pointer; text-align: center;
    }
    @media(max-width: 820px) {
      .nav-links, .nav-actions { display: none; }
      .mobile-toggle { display: flex; }
      .mobile-nav { display: flex; }
    }

    /* HERO */
    .hero {
      position: relative; padding: 100px 0 0;
      background: linear-gradient(180deg, var(--ink) 0%, #0a1a16 100%);
    }
    .hero-bg-glow {
      position: absolute; inset: 0; pointer-events: none;
      background:
        radial-gradient(700px 400px at 80% -5%, rgba(111,191,140,0.12), transparent 60%),
        radial-gradient(500px 300px at 5% 10%, rgba(232,163,61,0.08), transparent 60%);
    }
    .hero .wrap {
      display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center;
      position: relative; z-index: 2;
    }

    /* Exhibition Badge */
    .expo-badge {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 6px 16px; border-radius: 20px;
      background: linear-gradient(135deg, var(--marigold), #d4912a);
      color: var(--ink); font-weight: 700; font-size: 0.82rem;
      letter-spacing: 0.08em; text-transform: uppercase;
      margin-bottom: 16px;
      box-shadow: 0 4px 16px rgba(232,163,61,0.3);
    }
    .expo-icon { font-size: 1.1rem; }

    /* School Info */
    .school-info {
      margin-bottom: 20px; padding: 14px 18px;
      background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
      border-radius: 10px;
    }
    .school-name {
      font-family: var(--font-display); font-size: 1.1rem; color: var(--paper);
      margin-bottom: 2px;
    }
    .school-location {
      font-size: 0.82rem; color: rgba(255,255,255,0.5);
    }
    .school-affiliation {
      font-family: var(--font-mono); font-size: 0.7rem;
      color: var(--marigold); margin-top: 4px; letter-spacing: 0.05em;
    }

    .hero-title {
      font-family: var(--font-display);
      font-size: clamp(2.4rem, 4.5vw, 3.6rem);
      line-height: 1.08; margin-bottom: 12px;
      color: var(--paper);
    }
    .hero-subtitle {
      font-size: 1.1rem; color: var(--green); font-weight: 500;
      margin-bottom: 12px;
    }
    .hero-desc {
      font-size: 1rem; color: rgba(255,255,255,0.5);
      line-height: 1.65; margin-bottom: 28px; max-width: 48ch;
    }
    .hero-desc strong { color: var(--coral); font-weight: 600; }
    .hero-actions { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 24px; }

    .cta-btn {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 13px 28px; border-radius: 8px;
      font-size: 0.88rem; font-weight: 600; text-decoration: none;
      cursor: pointer; border: none; transition: all 0.2s;
    }
    .cta-btn.primary { background: var(--marigold); color: var(--ink); }
    .cta-btn.primary:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(232,163,61,0.3); }
    .cta-btn.ghost {
      border: 1px solid rgba(255,255,255,0.15); color: var(--paper);
      background: transparent;
    }
    .cta-btn.ghost:hover { border-color: rgba(255,255,255,0.3); }
    .cta-btn.lg { padding: 15px 32px; font-size: 0.95rem; }

    .hero-trust { display: flex; gap: 18px; flex-wrap: wrap; }
    .trust-item {
      font-size: 0.78rem; color: rgba(255,255,255,0.4);
      font-family: var(--font-mono);
    }

    /* Mockup */
    .hero-mockup { position: relative; }
    .mockup-frame {
      background: var(--panel);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 16px; overflow: hidden;
      box-shadow: 0 24px 60px rgba(0,0,0,0.4);
    }
    .mockup-topbar {
      display: flex; align-items: center; gap: 6px;
      padding: 10px 14px; background: rgba(0,0,0,0.2);
    }
    .mockup-dot { width: 8px; height: 8px; border-radius: 50%; }
    .mockup-dot.red { background: #ff5f57; }
    .mockup-dot.yellow { background: #ffbd2e; }
    .mockup-dot.green { background: #28c840; }
    .mockup-title {
      margin-left: 8px; font-size: 0.72rem; color: rgba(255,255,255,0.4);
      font-family: var(--font-mono);
    }
    .mockup-content { padding: 20px; min-height: 280px; }

    .demo-chat { display: flex; flex-direction: column; gap: 14px; }
    .demo-msg {
      display: flex; gap: 10px; opacity: 0;
      transform: translateY(10px); transition: all 0.5s ease;
    }
    .demo-msg.visible { opacity: 1; transform: translateY(0); }
    .msg-avatar {
      width: 32px; height: 32px; border-radius: 50%;
      background: var(--marigold); color: var(--ink);
      display: flex; align-items: center; justify-content: center;
      font-size: 0.75rem; font-weight: 700; flex-shrink: 0;
    }
    .ai-avatar { background: var(--green) !important; color: var(--ink) !important; }
    .msg-bubble {
      background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08);
      border-radius: 12px 12px 12px 4px;
      padding: 10px 14px; font-size: 0.85rem; line-height: 1.5;
      color: rgba(255,255,255,0.85); max-width: 85%;
    }
    .ai-bubble {
      border-radius: 12px 12px 12px 4px;
      background: rgba(111,191,140,0.08);
      border-color: rgba(111,191,140,0.15);
    }
    .ai-thinking { display: flex; gap: 4px; padding: 4px 0; }
    .think-dot {
      width: 6px; height: 6px; border-radius: 50%;
      background: var(--green); opacity: 0.4;
      animation: think-pulse 1.2s infinite;
    }
    .think-dot:nth-child(2) { animation-delay: 0.2s; }
    .think-dot:nth-child(3) { animation-delay: 0.4s; }
    @keyframes think-pulse { 0%,80%,100%{opacity:0.2;transform:scale(0.8);} 40%{opacity:1;transform:scale(1.2);} }
    .ai-action {
      display: inline-block; margin-top: 6px; margin-right: 8px;
      font-size: 0.78rem; padding: 3px 8px; border-radius: 4px;
      background: rgba(111,191,140,0.12); color: var(--green);
    }

    /* Exhibition Strip */
    .expo-strip {
      position: relative; z-index: 2;
      margin-top: 60px; border-top: 1px solid rgba(255,255,255,0.06);
      background: rgba(0,0,0,0.15);
    }
    .strip-grid {
      display: grid; grid-template-columns: repeat(4, 1fr);
    }
    .strip-item {
      display: flex; align-items: center; gap: 12px;
      padding: 20px; border-right: 1px solid rgba(255,255,255,0.06);
    }
    .strip-item:last-child { border-right: none; }
    .strip-icon { font-size: 1.4rem; }
    .strip-label {
      font-family: var(--font-mono); font-size: 0.65rem;
      text-transform: uppercase; letter-spacing: 0.1em;
      color: var(--marigold); margin-bottom: 2px;
    }
    .strip-value {
      font-size: 0.82rem; color: rgba(255,255,255,0.7); line-height: 1.3;
    }

    @media(max-width: 900px) {
      .hero .wrap { grid-template-columns: 1fr; gap: 40px; }
      .hero-mockup { order: -1; }
      .strip-grid { grid-template-columns: repeat(2, 1fr); }
      .strip-item:nth-child(2) { border-right: none; }
    }
    @media(max-width: 600px) {
      .strip-grid { grid-template-columns: 1fr; }
      .strip-item { border-right: none; border-bottom: 1px solid rgba(255,255,255,0.06); }
      .strip-item:last-child { border-bottom: none; }
    }

    /* SECTIONS */
    section { padding: 96px 0; }
    .dark-section { background: rgba(0,0,0,0.15); }

    .section-intro { max-width: 600px; margin-bottom: 48px; }
    .section-tag {
      display: inline-block; font-family: var(--font-mono);
      font-size: 0.72rem; text-transform: uppercase;
      letter-spacing: 0.14em; color: var(--marigold); margin-bottom: 12px;
    }
    .section-tag.light { color: var(--marigold); }
    .section-intro h2 {
      font-family: var(--font-display);
      font-size: clamp(1.8rem, 3.2vw, 2.5rem);
      line-height: 1.15; margin-bottom: 14px;
    }
    .section-intro p { font-size: 1rem; color: rgba(255,255,255,0.45); line-height: 1.6; }

    /* ABOUT */
    .about-cards {
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;
    }
    .about-card {
      padding: 24px; border: 1px solid rgba(255,255,255,0.06);
      border-radius: 12px; background: rgba(255,255,255,0.03);
      transition: all 0.25s;
    }
    .about-card:hover {
      transform: translateY(-4px); border-color: rgba(232,163,61,0.3);
      background: rgba(232,163,61,0.03);
    }
    .about-icon { font-size: 1.8rem; display: block; margin-bottom: 12px; }
    .about-card h3 {
      font-family: var(--font-body); font-size: 0.95rem;
      font-weight: 600; margin-bottom: 8px;
    }
    .about-card p {
      font-size: 0.85rem; color: rgba(255,255,255,0.4); line-height: 1.55;
    }
    @media(max-width: 900px) { .about-cards { grid-template-columns: repeat(2, 1fr); } }
    @media(max-width: 600px) { .about-cards { grid-template-columns: 1fr; } }

    /* FEATURES */
    .features-grid {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;
    }
    .feature-card {
      background: white; border: 1px solid var(--line);
      border-radius: 12px; padding: 24px; position: relative;
      transition: all 0.25s;
    }
    .feature-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 32px rgba(14,31,27,0.1);
      border-color: var(--marigold);
    }
    .feature-card.highlight {
      grid-column: span 2;
      background: linear-gradient(135deg, rgba(232,163,61,0.04), rgba(111,191,140,0.04));
      border-color: rgba(232,163,61,0.25);
    }
    .feature-icon {
      width: 44px; height: 44px; border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.3rem; margin-bottom: 14px;
    }
    .feature-card h3 {
      font-family: var(--font-body); font-size: 0.95rem;
      font-weight: 600; margin-bottom: 8px; color: var(--ink-text);
    }
    .feature-card p { font-size: 0.85rem; color: var(--muted); line-height: 1.55; }
    .feature-tag {
      display: inline-block; margin-top: 10px;
      font-family: var(--font-mono); font-size: 0.65rem;
      text-transform: uppercase; letter-spacing: 0.1em;
      color: var(--marigold); padding: 3px 8px;
      background: rgba(232,163,61,0.08); border-radius: 4px;
    }
    @media(max-width: 900px) { .features-grid { grid-template-columns: repeat(2, 1fr); } }
    @media(max-width: 600px) {
      .features-grid { grid-template-columns: 1fr; }
      .feature-card.highlight { grid-column: span 1; }
    }

    /* HOW IT WORKS */
    .flow-grid {
      display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px;
    }
    .flow-card {
      padding: 20px; text-align: center;
      border: 1px solid var(--line);
      border-radius: 10px; background: white;
      transition: all 0.25s; position: relative;
    }
    .flow-card:hover {
      border-color: var(--marigold);
      transform: translateY(-3px);
      box-shadow: 0 8px 24px rgba(14,31,27,0.08);
    }
    .flow-num {
      font-family: var(--font-mono); font-size: 0.65rem;
      color: var(--marigold); margin-bottom: 10px;
    }
    .flow-icon { font-size: 1.6rem; margin-bottom: 10px; }
    .flow-card h3 {
      font-family: var(--font-body); font-size: 0.85rem;
      font-weight: 600; color: var(--ink-text); margin-bottom: 6px;
    }
    .flow-card p { font-size: 0.78rem; color: var(--muted); line-height: 1.5; }
    @media(max-width: 900px) { .flow-grid { grid-template-columns: repeat(3, 1fr); } }
    @media(max-width: 600px) { .flow-grid { grid-template-columns: 1fr 1fr; } }

    /* MODULES */
    .module-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .module-card {
      background: white; border: 1px solid var(--line);
      border-radius: 10px; overflow: hidden;
      cursor: pointer; transition: all 0.2s;
    }
    .module-card:hover { border-color: var(--marigold); }
    .module-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 16px 18px;
    }
    .module-left { display: flex; align-items: center; gap: 10px; }
    .module-num {
      font-family: var(--font-mono); font-size: 0.68rem;
      color: var(--muted); min-width: 20px;
    }
    .module-header h3 {
      font-family: var(--font-body); font-size: 0.88rem;
      font-weight: 600; color: var(--ink-text);
    }
    .module-arrow {
      font-size: 0.9rem; color: var(--muted); transition: transform 0.25s;
    }
    .module-arrow.rotated { transform: rotate(180deg); color: var(--marigold); }
    .module-body {
      max-height: 0; overflow: hidden;
      transition: max-height 0.3s ease, padding 0.3s ease; padding: 0 18px;
    }
    .module-card.open .module-body { max-height: 120px; padding: 0 18px 14px; }
    .module-body p {
      font-size: 0.82rem; color: var(--muted); line-height: 1.55;
      border-top: 1px solid var(--line); padding-top: 12px;
    }
    @media(max-width: 600px) { .module-grid { grid-template-columns: 1fr; } }

    /* TECH */
    .tech-grid {
      display: grid; grid-template-columns: 340px 1fr; gap: 40px; align-items: start;
    }
    .arch-flow {
      display: flex; flex-direction: column; gap: 0; align-items: center;
    }
    .arch-node {
      display: flex; flex-direction: column; align-items: center; gap: 4px;
    }
    .arch-icon {
      font-size: 1.1rem; width: 48px; height: 48px;
      display: flex; align-items: center; justify-content: center;
      background: white; border: 1px solid var(--line); border-radius: 10px;
    }
    .arch-label {
      font-family: var(--font-mono); font-size: 0.75rem; color: var(--muted);
    }
    .arch-arrow { color: var(--marigold); font-size: 0.9rem; padding: 4px 0; opacity: 0.5; }

    .stack-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .stack-card {
      padding: 18px; border: 1px solid var(--line);
      border-radius: 10px; background: white;
    }
    .stack-header { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
    .stack-icon { font-size: 1rem; }
    .stack-header h4 {
      font-family: var(--font-mono); font-size: 0.72rem;
      text-transform: uppercase; letter-spacing: 0.1em; color: var(--marigold);
    }
    .stack-tags { display: flex; flex-wrap: wrap; gap: 6px; }
    .stack-tags span {
      font-size: 0.78rem; padding: 5px 10px; border-radius: 5px;
      background: rgba(14,31,27,0.04); border: 1px solid var(--line);
      color: var(--ink-text);
    }
    @media(max-width: 900px) {
      .tech-grid { grid-template-columns: 1fr; }
      .arch-flow { flex-direction: row; flex-wrap: wrap; justify-content: center; gap: 4px; }
      .arch-arrow { transform: rotate(90deg); }
      .stack-cards { grid-template-columns: 1fr 1fr; }
    }
    @media(max-width: 600px) {
      .arch-flow { gap: 2px; }
      .arch-icon { width: 40px; height: 40px; font-size: 0.95rem; }
      .arch-label { font-size: 0.65rem; }
      .stack-cards { grid-template-columns: 1fr; }
    }

    /* TEAM */
    .team-grid {
      display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px;
      max-width: 100%; overflow: hidden;
    }
    .team-card {
      padding: 32px 24px; border-radius: 14px; text-align: center;
      transition: all 0.25s; position: relative; overflow: hidden;
      word-wrap: break-word; min-width: 0;
    }
    .team-card:hover { transform: translateY(-4px); }
    .mentor-card {
      background: linear-gradient(135deg, var(--marigold), #d4912a);
      color: var(--ink);
      box-shadow: 0 12px 36px rgba(232,163,61,0.3);
    }
    .dev-card {
      background: white; border: 1px solid var(--line); color: var(--ink-text);
    }
    .dev-card:hover {
      border-color: var(--marigold);
      box-shadow: 0 12px 32px rgba(14,31,27,0.1);
    }
    .team-role-badge {
      font-family: var(--font-mono); font-size: 0.68rem;
      text-transform: uppercase; letter-spacing: 0.1em;
      margin-bottom: 16px;
    }
    .mentor-card .team-role-badge { color: rgba(14,31,27,0.6); }
    .dev-card .team-role-badge { color: var(--marigold); }
    .team-avatar {
      width: 56px; height: 56px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.2rem; font-weight: 700; margin: 0 auto 14px;
    }
    .mentor-avatar { background: rgba(14,31,27,0.15); color: var(--ink); }
    .dev-avatar { background: rgba(14,31,27,0.06); color: var(--ink); }
    .dev-avatar-2 { background: rgba(37,99,235,0.1); color: #2563EB; }
    .team-card h3 {
      font-family: var(--font-body); font-size: 1rem;
      font-weight: 700; margin-bottom: 4px;
      overflow-wrap: break-word; hyphens: auto;
    }
    .team-role-title {
      font-size: 0.8rem; margin-bottom: 0;
    }
    .mentor-card .team-role-title { color: rgba(14,31,27,0.7); }
    .dev-card .team-role-title { color: var(--muted); }
    .team-desc {
      font-size: 0.85rem; line-height: 1.55;
    }
    .mentor-card .team-desc { color: rgba(14,31,27,0.7); }
    .dev-card .team-desc { color: var(--muted); }
    @media(max-width: 900px) {
      .team-grid { grid-template-columns: 1fr; max-width: 420px; margin: 0 auto; }
    }

    /* CTA */
    .cta-section { padding: 80px 0 96px; }
    .cta-box {
      background: linear-gradient(135deg, var(--panel), rgba(14,31,27,0.9));
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 16px; padding: 56px 40px; text-align: center;
    }
    .cta-box h2 {
      font-family: var(--font-display);
      font-size: clamp(1.6rem, 3vw, 2.2rem); margin-bottom: 12px;
    }
    .cta-box p { color: rgba(255,255,255,0.45); margin-bottom: 28px; }
    .cta-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }

    /* FOOTER */
    footer {
      border-top: 1px solid rgba(255,255,255,0.06);
      padding: 40px 0 28px;
    }
    .footer-top {
      display: flex; justify-content: space-between; gap: 40px; margin-bottom: 24px;
    }
    .footer-brand p {
      color: rgba(255,255,255,0.3); font-size: 0.82rem;
      margin-top: 8px; max-width: 40ch;
    }
    .footer-links { display: flex; gap: 20px; }
    .footer-links a {
      color: rgba(255,255,255,0.4); text-decoration: none;
      font-size: 0.82rem; transition: color 0.2s;
    }
    .footer-links a:hover { color: var(--paper); }
    .footer-exhibition {
      text-align: center; padding: 20px 16px;
      border-top: 1px solid rgba(255,255,255,0.06);
      border-bottom: 1px solid rgba(255,255,255,0.06);
      margin-bottom: 20px;
    }
    .footer-expo-badge {
      display: inline-block; padding: 4px 14px; border-radius: 16px;
      background: var(--marigold); color: var(--ink);
      font-family: var(--font-mono); font-size: 0.72rem;
      font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
      margin-bottom: 8px;
    }
    .footer-exhibition p {
      font-size: 0.82rem; color: rgba(255,255,255,0.4); margin: 4px 0;
    }
    .footer-exhibition strong { color: rgba(255,255,255,0.7); }
    .footer-bottom {
      display: flex; justify-content: space-between;
      padding-top: 16px;
      font-size: 0.75rem; color: rgba(255,255,255,0.25);
    }
    @media(max-width: 600px) {
      .footer-top { flex-direction: column; gap: 20px; }
      .footer-links { flex-wrap: wrap; gap: 12px; }
      .footer-bottom { flex-direction: column; gap: 4px; }
    }

    /* REVEAL */
    .reveal {
      opacity: 0; transform: translateY(24px);
      transition: opacity 0.7s ease, transform 0.7s ease;
    }
    .reveal.in { opacity: 1; transform: translateY(0); }
  `]
})
export class LandingComponent implements OnInit, AfterViewInit, OnDestroy {
  isLoggedIn = false;
  mobileNavOpen = false;
  navScrolled = false;
  openModule: number | null = null;
  demoStep = -1;
  private demoTimer: any;
  private scrollHandler: any;

  features = [
    { icon: '\u{1FA7A}', title: 'AI Symptom Checker', desc: 'Ask naturally in any language. Get plain explanations, home care tips, and emergency warnings sourced from verified guidelines.', bg: 'rgba(232,163,61,0.1)', color: '#E8A33D', tag: 'Core Feature' },
    { icon: '\u{1F4CA}', title: 'Health Dashboard', desc: 'Heart rate, BP, SpO2, temperature, sleep — all in one view with trends, sparklines, and health scoring.', bg: 'rgba(111,191,140,0.1)', color: '#6FBF8C' },
    { icon: '\u{2699}\uFE0F', title: 'Wearable Integration', desc: 'Bluetooth BP monitors, pulse oximeters, thermometers, Google Fit, and simulated testing mode.', bg: 'rgba(37,99,235,0.1)', color: '#2563EB' },
    { icon: '\u{1F468}\u200D\u{1F469}\u200D\u{1F467}', title: 'Family Profiles', desc: 'One profile per family member — conditions, allergies, medications, blood group, and emergency contacts.', bg: 'rgba(147,51,234,0.1)', color: '#9333EA' },
    { icon: '\u{1F3F7}\uFE0F', title: 'QR Medical Card', desc: 'Scannable ID card with QR code — conditions, allergies, meds, and emergency contact. Works with any phone camera.', bg: 'rgba(236,72,153,0.1)', color: '#EC4899', tag: 'New' },
    { icon: '\u{1F3E2}', title: 'Community Health', desc: 'Government health schemes, blood banks, vaccination camps, and outbreak alerts for your region.', bg: 'rgba(14,31,27,0.06)', color: '#0E1F1B' },
  ];

  flowSteps = [
    { icon: '\u{1F4AC}', title: 'You Ask', desc: 'In plain language, by voice or text' },
    { icon: '\u{1F50D}', title: 'AI Retrieves', desc: 'Searches verified medical sources' },
    { icon: '\u{1F4C4}', title: 'Finds Answers', desc: 'Pulls only relevant passages' },
    { icon: '\u{1F916}', title: 'Generates Reply', desc: 'In your language, grounded in facts' },
    { icon: '\u{2705}', title: 'Shows Sources', desc: 'Every answer links to its source' },
  ];

  modules = [
    { title: 'AI Health Assistant', desc: 'Ask naturally — "I have fever" or "My BP is 160" — and get a plain explanation of possible causes, basic home care, when to see a doctor, and emergency warnings.' },
    { title: 'Wearable Integration', desc: 'Connects to smartwatches, Bluetooth BP monitors, pulse oximeters, thermometers, and supports CSV import for any health device.' },
    { title: 'AI Health Dashboard', desc: 'One screen for health score, heart rate, blood pressure, SpO2, temperature, sleep — with trend graphs and weekly reports.' },
    { title: 'AI Risk Detection', desc: 'Continuously watches vitals together — rising heart rate plus falling sleep plus rising stress signals possible fatigue, with recommendations.' },
    { title: 'Symptom Checker', desc: 'Covers fever, cold, cough, headache, vomiting, diarrhea, body pain, chest pain, breathing difficulty, and stomach pain with sourced answers.' },
    { title: 'Medicine Reminder', desc: 'Keeps a medicine list with schedules, notifications, missed-dose alerts, and adherence history.' },
    { title: 'Family Profiles', desc: 'One profile per family member — age, blood group, conditions, medicines, allergies, and emergency contact.' },
    { title: 'Emergency Mode', desc: 'Works fully offline: emergency contacts, nearby hospitals, and step-by-step guides for CPR, burns, fractures, heart attack, and stroke.' },
    { title: 'QR Medical Card', desc: 'Scannable ID with conditions, allergies, medications, emergency contact. Works with any phone camera — no app needed.' },
    { title: 'Health Trends', desc: 'Long-term graphs for heart rate, BP, sleep, and temperature with monthly reports and health scoring.' },
  ];

  archNodes = [
    { icon: '\u{1F464}', label: 'User' },
    { icon: '\u{1F310}', label: 'Angular App' },
    { icon: '\u{1F504}', label: 'Nginx Proxy' },
    { icon: '\u{2699}\uFE0F', label: 'Node.js API' },
    { icon: '\u{1F916}', label: 'AI Engine' },
    { icon: '\u{1F4DA}', label: 'Knowledge Base' },
    { icon: '\u{1F5C4}\uFE0F', label: 'PostgreSQL + Redis' },
  ];

  stackItems = [
    { icon: '\u{1F3A8}', category: 'Frontend', tags: ['Angular 17', 'TypeScript', 'SCSS', 'Chart.js'] },
    { icon: '\u{2699}\uFE0F', category: 'Backend', tags: ['Node.js', 'Express', 'PostgreSQL', 'Redis'] },
    { icon: '\u{1F916}', category: 'AI Layer', tags: ['Groq LLM', 'Knowledge Base', 'RAG', 'Safety Engine'] },
    { icon: '\u{1F6E0}\uFE0F', category: 'DevOps', tags: ['Docker', 'Nginx', 'CI/CD', 'Alpine Linux'] },
  ];

  constructor(private auth: AuthService) {}

  ngOnInit() {
    this.isLoggedIn = this.auth.isLoggedIn();
  }

  logout() {
    this.auth.logout();
    this.isLoggedIn = false;
  }

  ngAfterViewInit() {
    this.scrollHandler = () => { this.navScrolled = window.scrollY > 20; };
    window.addEventListener('scroll', this.scrollHandler);

    if (typeof IntersectionObserver !== 'undefined') {
      const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            obs.unobserve(e.target);
          }
        });
      }, { threshold: 0.1 });
      setTimeout(() => {
        document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
      }, 100);
    }

    this.demoTimer = setTimeout(() => { this.demoStep = 0; }, 1000);
    const timers = [
      setTimeout(() => { this.demoStep = 1; }, 2500),
      setTimeout(() => { this.demoStep = 2; }, 4500),
    ];
  }

  ngOnDestroy() {
    if (this.scrollHandler) window.removeEventListener('scroll', this.scrollHandler);
    clearTimeout(this.demoTimer);
  }

  toggleModule(i: number) {
    this.openModule = this.openModule === i ? null : i;
  }
}
