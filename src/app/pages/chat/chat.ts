// chat.component.ts
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, signal, computed, effect, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { ChatService } from '../../core/services/chat/chat-service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-chats',
  templateUrl: './chat.html',
  imports: [FormsModule, CommonModule, RouterLink], // لم نعد بحاجة NgIf, NgFor منفصلة
  styleUrls: ['./chat.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush // ← مهم! استخدام OnPush مع Signals
})
export class Chat implements OnInit, OnDestroy {
    isMobile = signal(window.innerWidth < 1024);


  // استخدام Signals بدلاً من properties العادية
  private conversationsSignal = signal<any[]>([]);
  private messagesSignal = signal<any[]>([]);
  private selectedConversationSignal = signal<any | null>(null);
  private isLoadingSignal = signal<boolean>(false);
  searchTermSignal = signal<string>('');
  private isSignalRConnectedSignal = signal<boolean>(false);
  private currentUserIdSignal = signal<string>('');
  
  // computed values (تشتق قيمها من signals أخرى)
  readonly conversations = this.conversationsSignal.asReadonly();
  readonly messages = this.messagesSignal.asReadonly();
  readonly selectedConversation = this.selectedConversationSignal
  readonly isLoading = this.isLoadingSignal.asReadonly();
  readonly searchTerm = this.searchTermSignal.asReadonly();
  readonly isSignalRConnected = this.isSignalRConnectedSignal.asReadonly();
  
  // Computed signal للرسائل المفلترة
  readonly filteredConversations = computed(() => {
    const searchTerm = this.searchTermSignal();
    const conversations = this.conversationsSignal();
    
    if (!searchTerm) return conversations;
    
    return conversations.filter(conv => 
      conv.otherUserName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });
  
  // للربط الثنائي في الـ template
  newMessageText = signal<string>('');
  
  private subscriptions: Subscription = new Subscription();
  
  private chatService = inject(ChatService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  constructor() {
    window.addEventListener('resize', () => {
      this.isMobile.set(window.innerWidth < 1024);
    });
    effect(() => {
      console.log('Selected conversation changed:', this.selectedConversationSignal());
    });
  }

  async ngOnInit(): Promise<void> {

    this.getCurrentUserId();

    await this.initializeSignalR();

    await this.loadConversations();

    this.handleDeepLink();

    this.listenForNewMessages();
  }

  private handleDeepLink(): void {

  const targetUserId =
    this.route.snapshot.queryParamMap.get('id');

  if (!targetUserId) return;

  if (targetUserId === this.currentUserIdSignal()) return;

  const existing = this.conversationsSignal().find(
    c => c.otherUserId === targetUserId
  );

  if (existing) {
    this.selectConversation(existing);
    return;
  }

  this.startOrOpenConversation(targetUserId);
}
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.chatService.stopSignalRConnection();
  }

  private async initializeSignalR(): Promise<void> {
    try {
      await this.chatService.startSignalRConnection();
      this.isSignalRConnectedSignal.set(true);
      console.log('SignalR connected successfully');
    } catch (error) {
      console.error('Failed to connect SignalR:', error);
      this.isSignalRConnectedSignal.set(false);
      
      setTimeout(() => {
        this.initializeSignalR();
      }, 5000);
    }
  }

  private getCurrentUserId(): void {
    const token = localStorage.getItem('token');
    if (!token) return;

    const payload = JSON.parse(atob(token.split('.')[1]));
    const userId = payload.uid || payload.sub || payload.nameid;
    this.currentUserIdSignal.set(userId);
  }

  private checkForTargetUserId(): void {
    this.route.queryParams.subscribe(params => {
      const targetUserId = params['id'];
      if (targetUserId && targetUserId !== this.currentUserIdSignal()) {
        this.startOrOpenConversation(targetUserId);
      }
    });
  }

  private startOrOpenConversation(targetUserId: string): void {
    this.isLoadingSignal.set(true);

    this.chatService.startConversation(targetUserId).subscribe({
      next: (response) => {
        this.isLoadingSignal.set(false);

        if (!response.isSuccess) return;

        const conv = response.data;
        const conversation = {
          id: conv.id,
          otherUserId: conv.otherUserId,
          otherUserName: conv.otherUserName,
          otherUserImageUrl: conv.otherUserImageUrl,
          unreadCount: 0,
          lastMessage: '',
          lastMessageAt: new Date()
        };

        const exists = this.conversationsSignal().find(x => x.id === conversation.id);

        if (!exists) {
          this.conversationsSignal.update(convs => [conversation, ...convs]);
        }

        this.selectedConversationSignal.set(conversation);
        this.messagesSignal.set([]);
        this.loadMessages(conversation.id);
      },
      error: (err) => {
        this.isLoadingSignal.set(false);
        console.error(err);
      }
    });
  }

 private loadConversations(): Promise<void> {
  return new Promise((resolve) => {

    this.isLoadingSignal.set(true);

    this.chatService.getMyConversations().subscribe({
      next: (response) => {

        if (response.isSuccess) {
          this.conversationsSignal.set(response.data);
        }

        this.isLoadingSignal.set(false);
        resolve();
      },

      error: () => {
        this.isLoadingSignal.set(false);
        resolve();
      }
    });

  });
}

  listenForNewMessages(): void {
    this.subscriptions.add(
      this.chatService.newMessage$.subscribe(message => {
        if (!message) return;

        const messages = this.messagesSignal();
        if (messages.some(x =>
          x.content === message.content &&
          x.senderId === message.senderId &&
          x.conversationId === message.conversationId
        )) {
          return;
        }

        const selectedConv = this.selectedConversationSignal();
        
        if (message.conversationId === selectedConv?.id) {
          this.messagesSignal.update(msgs => [...msgs, message]);
          this.scrollToBottom();
          this.chatService.markAsRead(message.conversationId);
        } else {
          this.updateConversationLastMessage(message);
        }
      })
    );
  }

  private updateConversationLastMessage(message: any): void {
    this.conversationsSignal.update(convs => {
      const conv = convs.find(c => c.id === message.conversationId);
      if (conv) {
        this.conversationsSignal.update(convs =>
  convs.map(c =>
    c.id === message.conversationId
      ? {
          ...c,
          lastMessage: message.content,
          lastMessageAt: message.sentAt,
          unreadCount:
            message.senderId !== this.currentUserIdSignal()
              ? c.unreadCount + 1
              : c.unreadCount
        }
      : c
  )
);
        conv.lastMessageAt = message.sentAt;
        if (message.senderId !== this.currentUserIdSignal()) {
          conv.unreadCount++;
        }
      }
      return [...convs]; // نعيد نسخة جديدة للـ signal
    });
  }

  selectConversation(conversation: any): void {
    this.selectedConversationSignal.set(conversation);
    this.loadMessages(conversation.id);
    this.chatService.markAsRead(conversation.id);
    
    // تحديث unreadCount
    this.conversationsSignal.update(convs => {
      const conv = convs.find(c => c.id === conversation.id);
      if (conv) conv.unreadCount = 0;
      return [...convs];
    });

    this.router.navigate([], {
      queryParams: { id: conversation.otherUserId },
      replaceUrl: true
    });
  }

  loadMessages(conversationId: number): void {
    this.isLoadingSignal.set(true);

    this.chatService.getConversationMessages(conversationId).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.messagesSignal.set(response.data?.data ?? []);
        } else {
          this.messagesSignal.set([]);
        }
        this.isLoadingSignal.set(false);
        setTimeout(() => this.scrollToBottom(), 100);
      },
      error: (error) => {
        console.error('Error loading messages:', error);
        this.messagesSignal.set([]);
        this.isLoadingSignal.set(false);
      }
    });
  }

  sendMessage(): void {
    const messageText = this.newMessageText().trim();
    const selectedConv = this.selectedConversationSignal();
    
    if (!messageText || !selectedConv) return;
    
    if (!this.isSignalRConnectedSignal()) {
      console.error('SignalR not connected, cannot send message');
      alert('جاري الاتصال بالخادم، حاول مرة أخرى');
      return;
    }
    
    const tempId = -Date.now();
    const tempMessage: any = {
      id: tempId,
      conversationId: selectedConv.id,
      senderId: this.currentUserIdSignal(),
      receiverId: selectedConv.otherUserId,
      content: messageText,
      sentAt: new Date().toISOString(),
      isRead: false
    };
    
    this.messagesSignal.update(msgs => [...msgs, tempMessage]);
    
    this.conversationsSignal.update(convs => {
      const conv = convs.find(c => c.id === selectedConv.id);
      if (conv) {
        conv.lastMessage = messageText;
        conv.lastMessageAt = new Date();
      }
      return [...convs];
    });
    
    this.newMessageText.set('');
    this.scrollToBottom();
    
    this.chatService.sendMessage(selectedConv.id, messageText).catch(error => {
      console.error('Error sending message:', error);
      this.messagesSignal.update(msgs => msgs.filter(m => m.id !== tempId));
      alert('فشل إرسال الرسالة، حاول مرة أخرى');
    });
  }

  startNewConversation(targetUserId: string): void {
    this.startOrOpenConversation(targetUserId);
  }

  scrollToBottom(): void {
    setTimeout(() => {
      const messageContainer = document.querySelector('.messages-container');
      if (messageContainer) {
        messageContainer.scrollTop = messageContainer.scrollHeight;
      }
    }, 100);
  }

  isMyMessage(senderId: string): boolean {
    return senderId === this.currentUserIdSignal();
  }

}