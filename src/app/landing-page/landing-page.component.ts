import { Component, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../service/auth.service';

interface ChatMessage {
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css']
})
export class LandingPageComponent implements AfterViewChecked {
  @ViewChild('messageContainer') private messageContainer!: ElementRef;
  chatForm: FormGroup;
  submitted = false;
  chatMessages: ChatMessage[] = [
    {
      text: "Hi! I'm Amos, your GitHub search assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ];
  isChatExpanded = false;

  constructor(
    private authService: AuthService,
    private formBuilder: FormBuilder
  ) {
    this.chatForm = this.formBuilder.group({
      message: ['', Validators.required]
    });
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    try {
      this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
    } catch(err) {}
  }

  toggleChat() {
    this.isChatExpanded = !this.isChatExpanded;
  }

  async sendMessage() {
    this.submitted = true;
    
    if (this.chatForm.invalid) {
      return;
    }

    const message = this.chatForm.get('message')?.value;
    
    // Add user message
    this.chatMessages.push({
      text: message,
      sender: 'user',
      timestamp: new Date()
    });

    this.chatForm.reset();
    this.submitted = false;

    // Simulate bot thinking
    setTimeout(() => {
      this.handleBotResponse(message);
    }, 1000);
  }

  private handleBotResponse(query: string) {
    let response = "I'm processing your request. This feature will be fully implemented soon!";
    
    // Simple response logic (to be expanded)
    if (query.toLowerCase().includes('search')) {
      response = "You can use the search feature by clicking the 'Start Searching' button above. Would you like me to explain how the search works?";
    } else if (query.toLowerCase().includes('login') || query.toLowerCase().includes('sign')) {
      response = "You can sign in using your Google account or create a new account. Need help with the sign-in process?";
    }

    this.chatMessages.push({
      text: response,
      sender: 'bot',
      timestamp: new Date()
    });
  }

  signInWithGoogle() {
    this.authService.signInWithGoogle()
      .then((result) => {
        console.log('Successfully signed in with Google');
      })
      .catch((error) => {
        console.error('Error signing in with Google:', error);
      });
  }
}
