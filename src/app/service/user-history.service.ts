import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

export interface UserAward {
  name: string;
  description: string;
  date: Date;
}

export interface UserHistory {
  username: string;
  visitCount: number;
  lastVisited: Date;
  recentProjects: string[];
  awards: UserAward[];
  commitStreak: number;
  totalCommits: number;
  lastCommitDate: Date;
}

@Injectable({
  providedIn: 'root'
})
export class UserHistoryService {
  private readonly STORAGE_KEY = 'userHistory';
  private readonly AWARDS = {
    EARLY_BIRD: { name: 'Early Bird', description: 'First search of the day' },
    NIGHT_OWL: { name: 'Night Owl', description: 'Search after midnight' },
    COMMIT_MASTER: { name: 'Commit Master', description: 'User with 100+ commits' },
    POPULAR: { name: 'Popular', description: 'User with 1000+ followers' },
    CONTRIBUTOR: { name: 'Contributor', description: 'User with 10+ repositories' }
  };

  constructor(private http: HttpClient) {}

  private getStoredHistory(): UserHistory[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored).map((user: any) => ({
      ...user,
      lastVisited: new Date(user.lastVisited),
      lastCommitDate: user.lastCommitDate ? new Date(user.lastCommitDate) : null
    })) : [];
  }

  private saveHistory(history: UserHistory[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history));
  }

  updateUserHistory(username: string, userData: any): Observable<UserHistory> {
    const history = this.getStoredHistory();
    const userIndex = history.findIndex(user => user.username === username);
    const now = new Date();
    
    let userHistory: UserHistory;
    
    if (userIndex !== -1) {
      userHistory = history[userIndex];
      userHistory.visitCount++;
      userHistory.lastVisited = now;
    } else {
      userHistory = {
        username,
        visitCount: 1,
        lastVisited: now,
        recentProjects: [],
        awards: [],
        commitStreak: 0,
        totalCommits: 0,
        lastCommitDate: null
      };
      history.push(userHistory);
    }

    // Update user data
    if (userData) {
      userHistory.recentProjects = userData.repos?.slice(0, 5) || [];
      userHistory.totalCommits = userData.totalCommits || 0;
      
      // Calculate commit streak
      if (userData.commits) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let streak = 0;
        let currentDate = today;
        
        while (userData.commits.some(commit => {
          const commitDate = new Date(commit.date);
          commitDate.setHours(0, 0, 0, 0);
          return commitDate.getTime() === currentDate.getTime();
        })) {
          streak++;
          currentDate.setDate(currentDate.getDate() - 1);
        }
        
        userHistory.commitStreak = streak;
        userHistory.lastCommitDate = userData.commits[0]?.date ? new Date(userData.commits[0].date) : null;
      }

      // Check and award achievements
      this.checkAndAwardAchievements(userHistory, userData);
    }

    this.saveHistory(history);
    return of(userHistory);
  }

  private checkAndAwardAchievements(userHistory: UserHistory, userData: any): void {
    const newAwards: UserAward[] = [];
    
    // Check for existing awards to avoid duplicates
    const existingAwards = new Set(userHistory.awards.map(award => award.name));
    
    // Check for new awards
    if (userData.totalCommits >= 100 && !existingAwards.has(this.AWARDS.COMMIT_MASTER.name)) {
      newAwards.push({ ...this.AWARDS.COMMIT_MASTER, date: new Date() });
    }
    
    if (userData.followers >= 1000 && !existingAwards.has(this.AWARDS.POPULAR.name)) {
      newAwards.push({ ...this.AWARDS.POPULAR, date: new Date() });
    }
    
    if (userData.publicRepos >= 10 && !existingAwards.has(this.AWARDS.CONTRIBUTOR.name)) {
      newAwards.push({ ...this.AWARDS.CONTRIBUTOR, date: new Date() });
    }
    
    // Check time-based awards
    const now = new Date();
    if (now.getHours() < 6 && !existingAwards.has(this.AWARDS.EARLY_BIRD.name)) {
      newAwards.push({ ...this.AWARDS.EARLY_BIRD, date: now });
    }
    
    if (now.getHours() >= 0 && now.getHours() < 4 && !existingAwards.has(this.AWARDS.NIGHT_OWL.name)) {
      newAwards.push({ ...this.AWARDS.NIGHT_OWL, date: now });
    }
    
    // Add new awards to user history
    if (newAwards.length > 0) {
      userHistory.awards = [...userHistory.awards, ...newAwards];
    }
  }

  getUserHistory(username: string): Observable<UserHistory | null> {
    const history = this.getStoredHistory();
    const userHistory = history.find(user => user.username === username);
    return of(userHistory || null);
  }

  getAllUserHistory(): Observable<UserHistory[]> {
    return of(this.getStoredHistory());
  }
} 