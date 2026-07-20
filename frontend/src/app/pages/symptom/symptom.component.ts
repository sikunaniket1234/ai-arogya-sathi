import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';

declare var webkitSpeechRecognition: any;
declare var SpeechRecognition: any;

@Component({
  selector: 'app-symptom',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="symptom-page">
      <a routerLink="/profiles" class="back-link">&larr; Back to Profiles</a>
      <h1>Symptom Assistant</h1>
      <p class="sub">Describe your symptoms and get health guidance</p>

      <div class="disclaimer card">
        <strong>Disclaimer:</strong> This is general wellness information only. Always consult a qualified healthcare professional for diagnosis and treatment.
      </div>

      <div class="input-section card">
        <form (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>Describe your symptoms</label>
            <textarea
              [(ngModel)]="inputText"
              name="input"
              rows="4"
              placeholder="e.g. I have a headache and mild fever since yesterday..."
            ></textarea>
          </div>

          <div class="voice-controls">
            <button type="button" class="voice-btn" [class.recording]="isRecording"
              (click)="toggleVoiceInput()" [disabled]="loading">
              <span class="mic-icon">{{ isRecording ? '&#9724;' : '&#127908;' }}</span>
              {{ isRecording ? 'Stop Recording' : 'Start Voice Input' }}
            </button>
            <span class="voice-status" *ngIf="isRecording">
              <span class="pulse"></span> Listening...
            </span>
            <span class="voice-status" *ngIf="speechNotSupported && !isRecording" style="color: var(--coral);">
              Voice not supported in this browser
            </span>
          </div>

          <div class="grid-2">
            <div class="form-group">
              <label>Input Mode</label>
              <select [(ngModel)]="inputMode" name="mode">
                <option value="text">Text</option>
                <option value="voice">Voice</option>
              </select>
            </div>
            <div class="form-group">
              <label>Language</label>
              <select [(ngModel)]="language" name="language">
                <option value="en">English</option>
                <option value="hi">Hindi</option>
              </select>
            </div>
          </div>
          <button type="submit" class="btn btn-primary" [disabled]="loading || !inputText.trim()">
            {{ loading ? 'Analyzing...' : 'Get Guidance' }}
          </button>
        </form>
      </div>

      <div class="response card" *ngIf="response">
        <div class="response-header">
          <h3>Response</h3>
          <div class="tts-controls">
            <label class="auto-speak-toggle" title="Auto-read responses aloud">
              <input type="checkbox" [(ngModel)]="autoSpeak" name="autoSpeak">
              <span class="toggle-label">&#128266; Auto-read</span>
            </label>
            <button class="tts-btn" (click)="toggleTTS()" [class.speaking]="isSpeaking"
              title="{{ isSpeaking ? 'Stop reading' : 'Read aloud now' }}">
              {{ isSpeaking ? '&#9724; Stop' : '&#9654; Read Now' }}
            </button>
          </div>
        </div>
        <div class="response-text" [innerHTML]="renderMarkdown(response.response_content)"></div>
        <div class="meta">
          <span>Safety Score: {{ response.safety_score }}</span>
          <span>Source: {{ response.source }}</span>
          <span class="cache-badge" *ngIf="fromCache">&#9889; Cached Response</span>
          <span class="escalation" *ngIf="response.escalation_flag">Escalation Required</span>
        </div>
      </div>

      <div class="history" *ngIf="history.length > 0">
        <h3>Recent Queries</h3>
        <div class="history-item card" *ngFor="let h of history">
          <div class="history-query">
            <strong>{{ h.input_text }}</strong>
            <span class="time">{{ h.created_at | date:'short' }}</span>
          </div>
          <div *ngIf="h.response_content" [innerHTML]="renderMarkdown(h.response_content)"></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .symptom-page h1 { font-size: 1.5rem; margin-bottom: 4px; }
    .sub { color: var(--muted); margin-bottom: 16px; }
    .back-link {
      display: inline-block; margin-bottom: 12px;
      color: var(--marigold); text-decoration: none; font-size: 0.9rem;
    }
    .disclaimer {
      background: #fff8e6; border-color: var(--marigold);
      font-size: 0.85rem; margin-bottom: 20px;
    }
    textarea {
      width: 100%; padding: 10px; border: 1px solid var(--line);
      border-radius: 6px; font-size: 0.95rem; resize: vertical;
    }
    textarea:focus { outline: none; border-color: var(--marigold); }

    .voice-controls {
      display: flex; align-items: center; gap: 12px;
      margin: 12px 0;
    }
    .voice-btn {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 8px 16px; border: 2px solid var(--marigold);
      border-radius: 8px; background: white; color: var(--marigold);
      font-size: 0.9rem; font-weight: 600; cursor: pointer;
      transition: all 0.2s;
    }
    .voice-btn:hover { background: #fff8e6; }
    .voice-btn.recording {
      background: var(--coral); border-color: var(--coral);
      color: white; animation: pulse-btn 1.5s infinite;
    }
    .voice-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .mic-icon { font-size: 1.1rem; }
    .voice-status {
      display: flex; align-items: center; gap: 6px;
      font-size: 0.85rem; color: var(--coral); font-weight: 500;
    }
    .pulse {
      width: 8px; height: 8px; border-radius: 50%;
      background: var(--coral); animation: pulse-dot 1s infinite;
    }
    @keyframes pulse-dot {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(1.5); }
    }
    @keyframes pulse-btn {
      0%, 100% { box-shadow: 0 0 0 0 rgba(255, 107, 74, 0.4); }
      50% { box-shadow: 0 0 0 8px rgba(255, 107, 74, 0); }
    }

    .response { border-left: 4px solid var(--green); }
    .response-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 8px;
    }
    .response-header h3 { margin: 0; }
    .tts-controls {
      display: flex; align-items: center; gap: 10px;
    }
    .auto-speak-toggle {
      display: flex; align-items: center; gap: 4px;
      cursor: pointer; font-size: 0.85rem; color: var(--muted);
      user-select: none;
    }
    .auto-speak-toggle input { cursor: pointer; accent-color: var(--marigold); }
    .toggle-label { white-space: nowrap; }
    .tts-btn {
      padding: 6px 12px; border: 1px solid var(--line);
      border-radius: 6px; background: white; cursor: pointer;
      font-size: 0.85rem; transition: all 0.2s;
    }
    .tts-btn:hover { background: #f0f0f0; }
    .tts-btn.speaking { background: var(--marigold); color: white; border-color: var(--marigold); }

    .response-text { line-height: 1.7; }
    :host ::ng-deep .response-text h2 {
      font-size: 1.1rem; margin: 16px 0 8px; color: #333;
      border-bottom: 1px solid var(--line); padding-bottom: 4px;
    }
    :host ::ng-deep .response-text h2:first-child { margin-top: 0; }
    :host ::ng-deep .response-text ul {
      margin: 4px 0 12px 20px; padding: 0;
    }
    :host ::ng-deep .response-text li {
      margin-bottom: 4px; line-height: 1.6;
    }
    :host ::ng-deep .response-text p { margin: 6px 0; }

    .meta {
      margin-top: 12px; display: flex; gap: 16px; flex-wrap: wrap;
      font-size: 0.85rem; color: var(--muted);
    }
    .escalation { color: var(--coral); font-weight: 600; }
    .cache-badge {
      background: linear-gradient(135deg, #D1FAE5, #A7F3D0);
      color: #065F46;
      padding: 2px 10px;
      border-radius: 12px;
      font-size: 0.78rem;
      font-weight: 600;
    }
    .history h3 { margin-bottom: 12px; }
    .history-query {
      display: flex; justify-content: space-between; align-items: center;
    }
    .time { font-size: 0.8rem; color: var(--muted); }
    .history-item > div:not(.history-query) {
      margin-top: 6px; font-size: 0.9rem; color: var(--muted); line-height: 1.6;
    }
  `],
})
export class SymptomComponent implements OnInit, OnDestroy, AfterViewChecked {
  profileId = '';
  inputText = '';
  inputMode = 'text';
  language = 'en';
  loading = false;
  response: any = null;
  history: any[] = [];

  isRecording = false;
  speechNotSupported = false;
  isSpeaking = false;
  autoSpeak = true;
  fromCache = false;
  private recognition: any = null;
  private pendingSpeakText = '';

  constructor(private route: ActivatedRoute, private api: ApiService) {}

  ngOnInit() {
    this.profileId = this.route.snapshot.paramMap.get('profileId') || '';
    this.loadHistory();
    this.initSpeechRecognition();
    if ('speechSynthesis' in window) {
      this.cachedVoices = window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        this.cachedVoices = window.speechSynthesis.getVoices();
      };
    }
  }

  ngOnDestroy() {
    this.stopRecording();
    this.stopSpeaking();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = null;
    }
  }

  ngAfterViewChecked() {
    if (this.pendingSpeakText) {
      const text = this.pendingSpeakText;
      this.pendingSpeakText = '';
      if (this.autoSpeak) {
        this.speak(text);
      }
    }
  }

  loadHistory() {
    this.api.getSymptomHistory(this.profileId).subscribe({
      next: (data: any) => (this.history = data),
    });
  }

  onSubmit() {
    this.loading = true;
    this.fromCache = false;
    this.api
      .submitSymptom(this.profileId, {
        input_text: this.inputText,
        input_mode: this.inputMode,
        language: this.language,
      })
      .subscribe({
        next: (res: any) => {
          this.response = res.response;
          this.fromCache = res.meta?.from_cache || false;
          this.inputText = '';
          this.loading = false;
          this.loadHistory();
          if (res.response?.response_content) {
            this.pendingSpeakText = this.stripMarkdown(res.response.response_content);
          }
        },
        error: () => (this.loading = false),
      });
  }

  initSpeechRecognition() {
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      this.speechNotSupported = true;
      return;
    }
    this.recognition = new SpeechRecognitionAPI();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = this.language === 'hi' ? 'hi-IN' : 'en-US';

    this.recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        this.inputText = this.inputText ? this.inputText + ' ' + finalTranscript : finalTranscript;
      }
    };

    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      this.isRecording = false;
    };

    this.recognition.onend = () => {
      this.isRecording = false;
    };
  }

  toggleVoiceInput() {
    if (this.isRecording) {
      this.stopRecording();
    } else {
      this.startRecording();
    }
  }

  startRecording() {
    if (!this.recognition) {
      this.initSpeechRecognition();
      if (!this.recognition) return;
    }
    this.recognition.lang = this.language === 'hi' ? 'hi-IN' : 'en-US';
    this.isRecording = true;
    this.inputMode = 'voice';
    try {
      this.recognition.start();
    } catch (e) {
      this.recognition.stop();
      setTimeout(() => {
        this.recognition.start();
      }, 100);
    }
  }

  stopRecording() {
    if (this.recognition) {
      this.recognition.stop();
    }
    this.isRecording = false;
  }

  toggleTTS() {
    if (this.isSpeaking) {
      this.stopSpeaking();
    } else if (this.response?.response_content) {
      this.speak(this.stripMarkdown(this.response.response_content));
    }
  }

  cachedVoices: SpeechSynthesisVoice[] = [];

  speak(text: string) {
    if (!('speechSynthesis' in window)) return;
    this.stopSpeaking();

    if (!this.cachedVoices.length) {
      this.cachedVoices = window.speechSynthesis.getVoices();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = this.language === 'hi' ? 'hi-IN' : 'en-US';
    utterance.rate = 0.9;
    utterance.pitch = 1;

    const langPrefix = this.language === 'hi' ? 'hi' : 'en';
    const matchingVoice = this.cachedVoices.find(v => v.lang.startsWith(langPrefix));
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onstart = () => (this.isSpeaking = true);
    utterance.onend = () => (this.isSpeaking = false);
    utterance.onerror = () => (this.isSpeaking = false);

    const synth = window.speechSynthesis;
    synth.speak(utterance);
    synth.pause();
    synth.resume();
  }

  stopSpeaking() {
    window.speechSynthesis?.cancel();
    this.isSpeaking = false;
  }

  stripMarkdown(text: string): string {
    return text
      .replace(/^#{1,3}\s+/gm, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/^[-*]\s+/gm, '• ')
      .replace(/---+/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  renderMarkdown(text: string): string {
    if (!text) return '';
    let html = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    html = html.replace(/^### (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

    html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
    html = html.replace(/^• (.+)$/gm, '<li>$1</li>');

    html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => {
      return '<ul>' + match + '</ul>';
    });

    html = html.replace(/^([^<\n].+)$/gm, (match) => {
      if (match.startsWith('<')) return match;
      return '<p>' + match + '</p>';
    });

    html = html.replace(/^-{3,}$/gm, '<hr>');

    return html;
  }
}
