import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GoogleFitService } from '../../services/google-fit.service';

@Component({
  selector: 'app-google-fit-auth',
  standalone: true,
  template: `<div style="text-align:center;padding:60px 20px;font-family:sans-serif;">
    <h2>Connecting to Google Fit...</h2>
    <p>This window will close automatically.</p>
  </div>`,
})
export class GoogleFitAuthComponent implements OnInit {
  constructor(private googleFit: GoogleFitService, private router: Router) {}

  ngOnInit() {
    const hash = window.location.hash;
    if (hash && hash.includes('access_token=')) {
      this.googleFit.handleCallback(hash);
      window.close();
      if (!window.closed) {
        this.router.navigate(['/devices']);
      }
    } else {
      this.router.navigate(['/devices']);
    }
  }
}
