// chat.service.ts
import { BaseUrl } from './../../../shared/environments/base-url';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private readonly httpClient = inject(HttpClient);
  
  private hubConnection!: HubConnection;
  private newMessageSubject = new BehaviorSubject<any | null>(null);
  private unreadCountSubject = new BehaviorSubject<number>(0);
  
  public newMessage$ = this.newMessageSubject.asObservable();
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor() {
    // لا نبدأ الاتصال هنا، ننتظر حتى يكون المستخدم مسجل دخول
  }

  // ============= SignalR Methods =============
  
  async startSignalRConnection(): Promise<void> {
    // جلب الـ Token من localStorage (نفس اللي بيستخدمه الـ interceptor)
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.error('No token found for SignalR connection');
      return;
    }

    // لو فيه اتصال قديم، أوقفه
    if (this.hubConnection) {
      await this.hubConnection.stop();
    }

    this.hubConnection = new HubConnectionBuilder()
      .withUrl(`https://t3awuny.runasp.net/hubs/chat`, {
        accessTokenFactory: () => localStorage.getItem('token') || '' // إرسال الـ Token
      })
      .withAutomaticReconnect()
      .build();

    // استقبال رسالة جديدة
    this.hubConnection.on('messagereceived', (message: any) => {
      this.newMessageSubject.next(message);
      this.updateUnreadCount(message.conversationId, 1);
    });

    // استقبال تأكيد القراءة (اختياري)
    this.hubConnection.on('messageread', (conversationId: number, readByUserId: string) => {
      console.log(`Message read in conversation ${conversationId} by ${readByUserId}`);
    });

    try {
      await this.hubConnection.start();
      console.log('SignalR Connected Successfully');
      
      // بعد الاتصال، سجل أن المستخدم متصل
      // await this.onConnected();
    } catch (err) {
      console.error('SignalR Connection Error:', err);
      
      // لو فشل الاتصال بسبب 401، جرب مرة واحدة بعد فترة قصيرة
      if (err instanceof Error && err.message.includes('401')) {
        console.log('Unauthorized, will retry in 2 seconds...');
        setTimeout(() => this.startSignalRConnection(), 2000);
      }
    }
  }

  async sendMessage(conversationId: number, content: string): Promise<void> {
    if (!this.hubConnection || this.hubConnection.state !== 'Connected') {
      console.error('SignalR not connected');
      // حاول إعادة الاتصال
      await this.startSignalRConnection();
      if (this.hubConnection.state !== 'Connected') {
        throw new Error('SignalR connection failed');
      }
    }
    return this.hubConnection.invoke('sendmessage', conversationId, content);
  }

  async markAsRead(conversationId: number): Promise<void> {
    if (!this.hubConnection || this.hubConnection.state !== 'Connected') {
      console.error('SignalR not connected');
      return;
    }
    return this.hubConnection.invoke('markasread', conversationId);
  }

  // async onConnected(): Promise<void> {
  //   if (!this.hubConnection || this.hubConnection.state !== 'Connected') {
  //     console.error('SignalR not connected');
  //     return;
  //   }
  //   return this.hubConnection.invoke('onconnected');
  // }

  async stopSignalRConnection(): Promise<void> {
    if (this.hubConnection) {
      await this.hubConnection.stop();
    }
  }

  private updateUnreadCount(conversationId: number, increment: number): void {
    let current = this.unreadCountSubject.value;
    this.unreadCountSubject.next(current + increment);
  }

  // ============= HTTP Methods =============
  
  getMyConversations(): Observable<any> {
    return this.httpClient.get(`${BaseUrl.url}api/Chats/my-conversations`);
  }

  getConversationMessages(conversationId: number, page: number = 1, pageSize: number = 50): Observable<any> {
    return this.httpClient.get(`${BaseUrl.url}api/Chats/conversations/${conversationId}/messages?page=${page}&pageSize=${pageSize}`);
  }

  startConversation(targetUserId: string): Observable<any> {
    return this.httpClient.post(`${BaseUrl.url}api/Chats/conversations/start/${targetUserId}`, {});
  }
}