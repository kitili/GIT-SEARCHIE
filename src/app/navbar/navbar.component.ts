import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../service/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  isLoggedIn = false;
  showHistory = false;
  userHistory: any[] = []; // You might want to create a proper interface for this
  currentUser: any = null;

  constructor(
    public router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.authService.currentUser.subscribe(user => {
      this.isLoggedIn = !!user;
      this.currentUser = user;
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  navigateToUser(username: string): void {
    this.router.navigate(['/profile'], { queryParams: { username } });
  }

  navigateToProfile(): void {
    this.router.navigate(['/profile']);
  }

  toggleHistory(): void {
    this.showHistory = !this.showHistory;
  }

  getAwardIcon(awardName: string): string {
    const awardIcons: { [key: string]: string } = {
      'early-adopter': '🚀',
      'contributor': '⭐',
      'bug-hunter': '🐛',
      'feature-request': '💡',
      'documentation': '📚',
      'community': '🤝'
    };
    return awardIcons[awardName] || '🏆';
  }
}
