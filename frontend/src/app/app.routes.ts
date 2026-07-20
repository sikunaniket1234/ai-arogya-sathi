import { Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ProfilesComponent } from './pages/profiles/profiles.component';
import { SymptomComponent } from './pages/symptom/symptom.component';
import { RemindersComponent } from './pages/reminders/reminders.component';
import { EmergencyComponent } from './pages/emergency/emergency.component';
import { HealthDashboardComponent } from './pages/health-dashboard/health-dashboard.component';
import { TrendsComponent } from './pages/trends/trends.component';
import { DevicesComponent } from './pages/devices/devices.component';
import { GoogleFitAuthComponent } from './pages/google-fit-auth/google-fit-auth.component';
import { MedicalCardComponent } from './pages/medical-card/medical-card.component';
import { CommunityComponent } from './pages/community/community.component';
import { HealthSchemeDetailComponent } from './pages/scheme-detail/scheme-detail.component';
import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [guestGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'profiles', component: ProfilesComponent, canActivate: [authGuard] },
  { path: 'symptom/:profileId', component: SymptomComponent, canActivate: [authGuard] },
  { path: 'reminders/:profileId', component: RemindersComponent, canActivate: [authGuard] },
  { path: 'health/:profileId', component: HealthDashboardComponent, canActivate: [authGuard] },
  { path: 'trends/:profileId', component: TrendsComponent, canActivate: [authGuard] },
  { path: 'emergency', component: EmergencyComponent, canActivate: [authGuard] },
  { path: 'devices', component: DevicesComponent, canActivate: [authGuard] },
  { path: 'auth/google-fit', component: GoogleFitAuthComponent },
  { path: 'medical-card/:profileId', component: MedicalCardComponent, canActivate: [authGuard] },
  { path: 'medical-card/token/:token', component: MedicalCardComponent },
  { path: 'community', component: CommunityComponent },
  { path: 'community/scheme/:id', component: HealthSchemeDetailComponent },
  { path: '**', redirectTo: '' },
];
