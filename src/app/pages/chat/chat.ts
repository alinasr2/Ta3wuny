import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ChatService } from '../../core/services/chat/chat-service';
import { FormsModule } from '@angular/forms';
import { NgIf, NgFor, CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-chats',
  templateUrl: './chat.html',
  imports: [FormsModule, NgIf, NgFor, CommonModule],
  styleUrls: ['./chat.scss']
})
export class Chat implements OnInit, OnDestroy {
  
  conversations: any[] = [];
  messages: any[] = [];
  selectedConversation: any | null = null;
  newMessageText: string = '';
  isLoading: boolean = false;
  searchTerm: string = '';
  isSignalRConnected: boolean = false;
  
  private subscriptions: Subscription = new Subscription();
  private currentUserId: string = '';

  constructor(
    public chatService: ChatService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    this.getCurrentUserId();
    
    // بدء اتصال SignalR
    await this.initializeSignalR();
    
    this.loadConversations();
    this.listenForNewMessages();

     this.checkForTargetUserId();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    // قطع اتصال SignalR عند الخروج
    this.chatService.stopSignalRConnection();
  }

  private async initializeSignalR(): Promise<void> {
    try {
      await this.chatService.startSignalRConnection();
      this.isSignalRConnected = true;
      console.log('SignalR connected successfully');
    } catch (error) {
      console.error('Failed to connect SignalR:', error);
      this.isSignalRConnected = false;
      
      // محاولة إعادة الاتصال بعد 5 ثواني
      setTimeout(() => {
        this.initializeSignalR();
      }, 5000);
    }
  }

  private getCurrentUserId(): void {
    // جلب userId من localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        this.currentUserId = user.id || user.userId;
      } catch(e) {
        console.error('Error parsing user data', e);
      }
    }
    
    // إذا كان فيه Auth service، استخدمه
    // const user = this.auth.user();
    // if (user) {
    //   this.currentUserId = user.id;
    // }
  }

  private checkForTargetUserId(): void {
    // جلب الـ id من Query Parameters
    const targetUserId = this.route.snapshot.queryParamMap.get('id');
    
    console.log('Target User ID from URL:', targetUserId);
    
    if (targetUserId && targetUserId !== this.currentUserId) {
      this.startOrOpenConversation(targetUserId);
    }
  }

private startOrOpenConversation(targetUserId: string): void {

  this.isLoading = true;

  this.chatService.startConversation(targetUserId).subscribe({
    next: (response) => {

      if (!response.isSuccess) {
        console.error(response.message);
        this.isLoading = false;
        return;
      }

      const conv = response.data;

      // 👇 افتح الشات مباشرة بدون انتظار القائمة
      this.selectedConversation = {
        id: conv.id,
        otherUserId: conv.otherUserId,
        otherUserName: conv.otherUserName,
        otherUserImageUrl: conv.otherUserImageUrl
      };

      // 👇 امسح الرسائل القديمة
      this.messages = [];

      // 👇 حمّل الرسائل
      this.loadMessages(conv.id);

      this.isLoading = false;
    },
    error: (err) => {
      console.error('Start conversation error:', err);
      this.isLoading = false;
    }
  });
}
  loadConversations(): void {

  this.isLoading = true;

  this.chatService.getMyConversations().subscribe({
    next: (response) => {

      if (response.isSuccess) {
        this.conversations = response.data;
      }

      this.isLoading = false;

      // 👇 هنا الصحيح
      this.checkForTargetUserId();
    },
    error: (error) => {
      console.error('Error loading conversations:', error);
      this.isLoading = false;
    }
  });
}
  listenForNewMessages(): void {
    this.subscriptions.add(
      this.chatService.newMessage$.subscribe((message) => {
        if (message && message.conversationId === this.selectedConversation?.id) {
          this.messages.push(message);
          this.scrollToBottom();
          this.chatService.markAsRead(message.conversationId);
        } else if (message) {
          this.updateConversationLastMessage(message);
        }
      })
    );
  }

  updateConversationLastMessage(message: any): void {
    const conv = this.conversations.find(c => c.id === message.conversationId);
    if (conv) {
      conv.lastMessage = message.content;
      conv.lastMessageAt = message.sentAt;
      if (message.senderId !== this.currentUserId) {
        conv.unreadCount++;
      }
    }
  }

  selectConversation(conversation: any): void {
    this.selectedConversation = conversation;
    this.loadMessages(conversation.id);
    this.chatService.markAsRead(conversation.id);
    
    // تصفير unread count
    const conv = this.conversations.find(c => c.id === conversation.id);
    if (conv) {
      conv.unreadCount = 0;
    }
    
    // إزالة الـ ID من الـ URL بعد فتح المحادثة (اختياري)
    this.router.navigate([], {
      queryParams: {},
      replaceUrl: true
    });
  }

 loadMessages(conversationId: number): void {

  this.isLoading = true;

  this.chatService.getConversationMessages(conversationId).subscribe({
    next: (response) => {

      if (response.isSuccess) {
        this.messages = response.data?.data ?? [];
      } else {
        this.messages = [];
      }

      this.isLoading = false;

      setTimeout(() => this.scrollToBottom(), 100);
    },
    error: (error) => {
      console.error('Error loading messages:', error);

      // 👇 مهم جدًا: حتى لو فشل، الشات يفضل شغال
      this.messages = [];
      this.isLoading = false;
    }
  });
}

  sendMessage(): void {
    if (!this.newMessageText.trim() || !this.selectedConversation) {
      return;
    }
    
    if (!this.isSignalRConnected) {
      console.error('SignalR not connected, cannot send message');
      // عرض رسالة للمستخدم
      alert('جاري الاتصال بالخادم، حاول مرة أخرى');
      return;
    }
    
    const content = this.newMessageText.trim();
    
    // إضافة رسالة مؤقتة قبل الإرسال
    const tempId = -Date.now(); // ID مؤقت
    const tempMessage: any = {
      id: tempId,
      conversationId: this.selectedConversation.id,
      senderId: this.currentUserId,
      receiverId: this.selectedConversation.otherUserId,
      content: content,
      sentAt: new Date().toISOString(),
      isRead: false
    };
    
    this.messages.push(tempMessage);
    this.newMessageText = '';
    this.scrollToBottom();
    
    // إرسال الرسالة عبر SignalR
    this.chatService.sendMessage(this.selectedConversation.id, content).catch(error => {
      console.error('Error sending message:', error);
      
      // إزالة الرسالة المؤقتة إذا فشل الإرسال
      const index = this.messages.findIndex(m => m.id === tempId);
      if (index !== -1) {
        this.messages.splice(index, 1);
      }
      
      // عرض رسالة خطأ للمستخدم
      alert('فشل إرسال الرسالة، حاول مرة أخرى');
    });
  }

  startNewConversation(targetUserId: string): void {
    this.startOrOpenConversation(targetUserId);
  }

  get filteredConversations(): any[] {
    if (!this.searchTerm) return this.conversations;
    return this.conversations.filter(conv => 
      conv.otherUserName.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
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
    return senderId === this.currentUserId;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    // أقل من 24 ساعة
    if (diff < 24 * 60 * 60 * 1000) {
      return date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    }
    
    // أقل من 7 أيام
    if (diff < 7 * 24 * 60 * 60 * 1000) {
      return date.toLocaleDateString('ar-EG', { weekday: 'short' });
    }
    
    // أقدم
    return date.toLocaleDateString('ar-EG', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  getConversationLastMessageTime(conversation: any): string {
    if (!conversation.lastMessageAt) return '';
    return this.formatDate(conversation.lastMessageAt);
  }

  trackByConversationId(index: number, conversation: any): number {
    return conversation.id;
  }

  trackByMessageId(index: number, message: any): number {
    return message.id;
  }
}