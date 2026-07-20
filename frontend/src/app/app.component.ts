import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <!-- Top Navbar -->
    <header class="navbar" *ngIf="auth.isLoggedIn() && !isLandingPage">
      <div class="navbar-inner">
        <!-- Brand -->
        <a routerLink="/dashboard" class="navbar-brand">
          <span class="brand-dot"></span>
          <span class="brand-text">AI Health Companion</span>
        </a>

        <!-- Desktop Nav -->
        <nav class="navbar-links hide-mobile">
          <a routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">
            <span class="nav-icon">&#9632;</span> Dashboard
          </a>
          <a routerLink="/profiles" routerLinkActive="active">
            <span class="nav-icon">&#9787;</span> Family
          </a>
          <a routerLink="/devices" routerLinkActive="active">
            <span class="nav-icon">&#9881;</span> Devices
          </a>
          <a routerLink="/community" routerLinkActive="active">
            <span class="nav-icon">&#9878;</span> Community
          </a>
          <a routerLink="/emergency" routerLinkActive="active" class="nav-emergency">
            <span class="nav-icon">&#9888;</span> Emergency
          </a>
        </nav>

        <!-- Right side: user + hamburger -->
        <div class="navbar-right">
          <div class="user-pill hide-mobile" (click)="showUserMenu = !showUserMenu">
            <span class="user-avatar">{{ userInitial }}</span>
            <span class="user-name">{{ userName }}</span>
            <span class="chevron">&#9662;</span>
          </div>

          <!-- User dropdown -->
          <div class="user-dropdown" *ngIf="showUserMenu" (click)="showUserMenu = false">
            <div class="dropdown-header">
              <span class="user-avatar lg">{{ userInitial }}</span>
              <div>
                <div class="dropdown-name">{{ userName }}</div>
                <div class="dropdown-email">{{ userEmail }}</div>
              </div>
            </div>
            <div class="dropdown-divider"></div>
            <a routerLink="/profiles" class="dropdown-item">&#9787; Family Profiles</a>
            <a routerLink="/devices" class="dropdown-item">&#9881; Devices</a>
            <a routerLink="/community" class="dropdown-item">&#9878; Community</a>
            <div class="dropdown-divider"></div>
            <button class="dropdown-item danger" (click)="logout()">&#10148; Sign Out</button>
          </div>

          <!-- Hamburger -->
          <button class="hamburger hide-desktop" (click)="toggleDrawer()" [class.open]="drawerOpen">
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
    </header>

    <!-- Mobile Drawer Overlay -->
    <div class="drawer-overlay" *ngIf="drawerOpen" (click)="drawerOpen = false"></div>

    <!-- Mobile Drawer -->
    <aside class="drawer" [class.open]="drawerOpen" *ngIf="auth.isLoggedIn() && !isLandingPage">
      <div class="drawer-header">
        <span class="user-avatar lg">{{ userInitial }}</span>
        <div class="drawer-user">
          <div class="drawer-name">{{ userName }}</div>
          <div class="drawer-email">{{ userEmail }}</div>
        </div>
      </div>
      <nav class="drawer-nav">
        <a routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}" (click)="drawerOpen = false">
          &#9632; Dashboard
        </a>
        <a routerLink="/profiles" routerLinkActive="active" (click)="drawerOpen = false">
          &#9787; Family Profiles
        </a>
        <a routerLink="/devices" routerLinkActive="active" (click)="drawerOpen = false">
          &#9881; Devices
        </a>
        <a routerLink="/community" routerLinkActive="active" (click)="drawerOpen = false">
          &#9878; Community Health
        </a>
        <a routerLink="/emergency" routerLinkActive="active" class="drawer-emergency" (click)="drawerOpen = false">
          &#9888; Emergency
        </a>
      </nav>
      <div class="drawer-footer">
        <button class="drawer-logout" (click)="logout()">&#10148; Sign Out</button>
      </div>
    </aside>

    <!-- Main Content -->
    <main [class.main-content]="auth.isLoggedIn() && !isLandingPage">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    /* ── Navbar ── */
    .navbar {
      position: sticky;
      top: 0;
      z-index: 100;
      background: rgba(14,31,27,0.97);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }
    .navbar-inner {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
      height: 56px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }
    .navbar-brand {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      color: white;
      font-weight: 700;
      font-size: 1rem;
      flex-shrink: 0;
    }
    .brand-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: var(--coral);
      animation: beat 1.8s ease-in-out infinite;
      box-shadow: 0 0 0 3px rgba(255,107,74,0.2);
    }
    @keyframes beat {
      0%, 100% { transform: scale(1); }
      25% { transform: scale(1.3); }
    }

    /* ── Desktop Nav Links ── */
    .navbar-links {
      display: flex;
      align-items: center;
      gap: 2px;
    }
    .navbar-links a {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      color: rgba(255,255,255,0.6);
      text-decoration: none;
      font-size: 0.82rem;
      font-weight: 500;
      border-radius: 6px;
      transition: all 0.2s;
      white-space: nowrap;
    }
    .navbar-links a:hover {
      color: white;
      background: rgba(255,255,255,0.08);
    }
    .navbar-links a.active {
      color: var(--marigold);
      background: rgba(232,163,61,0.1);
    }
    .nav-emergency {
      color: var(--coral) !important;
    }
    .nav-emergency:hover {
      background: rgba(255,107,74,0.1) !important;
    }
    .nav-icon {
      font-size: 0.7rem;
    }

    /* ── Right side ── */
    .navbar-right {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-shrink: 0;
    }

    /* ── User Pill ── */
    .user-pill {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 5px 12px 5px 5px;
      border-radius: 24px;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.08);
      cursor: pointer;
      transition: all 0.2s;
      position: relative;
    }
    .user-pill:hover {
      background: rgba(255,255,255,0.1);
      border-color: rgba(255,255,255,0.15);
    }
    .user-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: var(--marigold);
      color: var(--ink);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 700;
    }
    .user-avatar.lg {
      width: 40px;
      height: 40px;
      font-size: 0.95rem;
    }
    .user-name {
      color: rgba(255,255,255,0.85);
      font-size: 0.82rem;
      font-weight: 500;
    }
    .chevron {
      color: rgba(255,255,255,0.4);
      font-size: 0.65rem;
    }

    /* ── User Dropdown ── */
    .user-dropdown {
      position: absolute;
      top: 50px;
      right: 20px;
      background: white;
      border: 1px solid var(--line);
      border-radius: var(--radius);
      box-shadow: var(--shadow-lg);
      min-width: 240px;
      z-index: 200;
      overflow: hidden;
      animation: dropIn 0.15s ease;
    }
    @keyframes dropIn {
      from { opacity: 0; transform: translateY(-8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .dropdown-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
    }
    .dropdown-name {
      font-weight: 600;
      font-size: 0.9rem;
      color: var(--ink-text);
    }
    .dropdown-email {
      font-size: 0.78rem;
      color: var(--muted);
    }
    .dropdown-divider {
      height: 1px;
      background: var(--line);
    }
    .dropdown-item {
      display: block;
      width: 100%;
      padding: 10px 16px;
      font-size: 0.85rem;
      color: var(--ink-text);
      text-decoration: none;
      background: none;
      border: none;
      cursor: pointer;
      text-align: left;
      transition: background 0.15s;
    }
    .dropdown-item:hover {
      background: var(--paper);
    }
    .dropdown-item.danger {
      color: var(--coral);
    }

    /* ── Hamburger ── */
    .hamburger {
      width: 36px;
      height: 36px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 5px;
      background: none;
      border: none;
      cursor: pointer;
      padding: 6px;
      border-radius: 6px;
      transition: background 0.2s;
    }
    .hamburger:hover {
      background: rgba(255,255,255,0.08);
    }
    .hamburger span {
      display: block;
      width: 20px;
      height: 2px;
      background: white;
      border-radius: 1px;
      transition: all 0.25s;
    }
    .hamburger.open span:nth-child(1) {
      transform: translateY(7px) rotate(45deg);
    }
    .hamburger.open span:nth-child(2) {
      opacity: 0;
      transform: scaleX(0);
    }
    .hamburger.open span:nth-child(3) {
      transform: translateY(-7px) rotate(-45deg);
    }

    /* ── Drawer Overlay ── */
    .drawer-overlay {
      position: fixed;
      inset: 0;
      background: rgba(14,31,27,0.5);
      z-index: 199;
      animation: fadeIn 0.2s ease;
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    /* ── Mobile Drawer ── */
    .drawer {
      position: fixed;
      top: 0;
      right: 0;
      width: 280px;
      height: 100vh;
      background: var(--ink);
      z-index: 200;
      display: flex;
      flex-direction: column;
      transform: translateX(100%);
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: -4px 0 20px rgba(0,0,0,0.3);
    }
    .drawer.open {
      transform: translateX(0);
    }
    .drawer-header {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 24px 20px;
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    .drawer-user {
      flex: 1;
      overflow: hidden;
    }
    .drawer-name {
      color: white;
      font-weight: 600;
      font-size: 0.95rem;
    }
    .drawer-email {
      color: rgba(255,255,255,0.5);
      font-size: 0.78rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .drawer-nav {
      flex: 1;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .drawer-nav a {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 14px;
      color: rgba(255,255,255,0.65);
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 500;
      border-radius: 8px;
      transition: all 0.2s;
    }
    .drawer-nav a:hover {
      color: white;
      background: rgba(255,255,255,0.06);
    }
    .drawer-nav a.active {
      color: var(--marigold);
      background: rgba(232,163,61,0.1);
    }
    .drawer-emergency {
      color: var(--coral) !important;
    }
    .drawer-footer {
      padding: 16px 20px;
      border-top: 1px solid rgba(255,255,255,0.08);
    }
    .drawer-logout {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      padding: 10px;
      background: rgba(255,107,74,0.1);
      border: 1px solid rgba(255,107,74,0.2);
      color: var(--coral);
      font-size: 0.85rem;
      font-weight: 500;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .drawer-logout:hover {
      background: rgba(255,107,74,0.2);
    }

    /* ── Main Content ── */
    .main-content {
      padding: 24px 20px;
      max-width: 1200px;
      margin: 0 auto;
      min-height: calc(100vh - 56px);
    }

    @media (max-width: 768px) {
      .main-content {
        padding: 16px;
      }
    }
  `],
})
export class AppComponent implements OnInit, OnDestroy {
  isLandingPage = true;
  drawerOpen = false;
  showUserMenu = false;
  userName = '';
  userEmail = '';
  userInitial = '';

  private closeMenuHandler = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest('.user-pill') && !target.closest('.user-dropdown')) {
      this.showUserMenu = false;
    }
  };

  constructor(public auth: AuthService, private router: Router) {}

  ngOnInit() {
    this.updateUserInfo();
    document.addEventListener('click', this.closeMenuHandler);
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      this.isLandingPage = e.urlAfterRedirects === '/' || e.urlAfterRedirects === '';
      this.updateUserInfo();
    });
  }

  ngOnDestroy() {
    document.removeEventListener('click', this.closeMenuHandler);
  }

  updateUserInfo() {
    const user = this.auth.getUser();
    if (user) {
      this.userName = user.name || 'User';
      this.userEmail = user.email || '';
      this.userInitial = (user.name || 'U').charAt(0).toUpperCase();
    }
  }

  toggleDrawer() {
    this.drawerOpen = !this.drawerOpen;
  }

  logout() {
    this.drawerOpen = false;
    this.showUserMenu = false;
    this.auth.logout();
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.drawerOpen = false;
    this.showUserMenu = false;
  }
}
