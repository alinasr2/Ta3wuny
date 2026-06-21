import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatBotButton } from './chat-bot-button';

describe('ChatBotButton', () => {
  let component: ChatBotButton;
  let fixture: ComponentFixture<ChatBotButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatBotButton],
    }).compileComponents();

    fixture = TestBed.createComponent(ChatBotButton);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
