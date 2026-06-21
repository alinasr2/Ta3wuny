import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

const CHATBOT_USER_ID = 'chat-bot-123';

@Component({
  selector: 'app-chat-bot-button',
  imports: [],
  templateUrl: './chat-bot-button.html',
  styleUrl: './chat-bot-button.scss',
})
export class ChatBotButton {
  private router = inject(Router);

  showButton = signal(true);
  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.showButton.set(!event.url.includes('/chat'));
    });
  }

  openChat() {
    this.router.navigate(['/chat'], {
      queryParams: { id: CHATBOT_USER_ID }
    });
  }
}
