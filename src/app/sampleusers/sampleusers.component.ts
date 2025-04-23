import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

interface SearchedUser {
  username: string;
  visitCount: number;
  lastVisited: Date;
  recentProjects: string[];
}

@Component({
  selector: 'app-sampleusers',
  templateUrl: './sampleusers.component.html',
  styleUrls: ['./sampleusers.component.css']
})
export class SampleusersComponent implements OnInit {
  searchedUsers: SearchedUser[] = [];

  constructor(private router: Router) { }

  ngOnInit(): void {
    // Load searched users from localStorage
    const savedUsers = localStorage.getItem('searchedUsers');
    if (savedUsers) {
      this.searchedUsers = JSON.parse(savedUsers);
      
      // Sort by visit count (most visited first)
      this.searchedUsers.sort((a, b) => b.visitCount - a.visitCount);
    }
  }

  viewProfile(username: string): void {
    // Update visit count for this user
    const userIndex = this.searchedUsers.findIndex(user => user.username === username);
    if (userIndex !== -1) {
      this.searchedUsers[userIndex].visitCount++;
      this.searchedUsers[userIndex].lastVisited = new Date();
      
      // Save to localStorage
      localStorage.setItem('searchedUsers', JSON.stringify(this.searchedUsers));
    }
    
    // Navigate to profile
    this.router.navigate(['/profile'], { queryParams: { username } });
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleString();
  }
}
