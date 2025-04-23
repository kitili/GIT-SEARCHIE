import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface SearchHistory {
  username: string;
  searchQuery: string;
  timestamp: number;
  resultsCount: number;
}

interface UserProfile {
  name: string;
  email: string;
  searchCount: number;
  lastSearches: SearchHistory[];
  awards: string[];
}

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  constructor(private db: AngularFireDatabase) {}

  // Save a search to user's history
  saveSearch(userId: string, searchData: SearchHistory): Promise<any> {
    return this.db.list(`users/${userId}/searchHistory`).push(searchData).then(ref => ref);
  }

  // Get user's search history
  getUserSearchHistory(userId: string): Observable<SearchHistory[]> {
    return this.db.list<SearchHistory>(`users/${userId}/searchHistory`).valueChanges();
  }

  // Get or create user profile
  getUserProfile(userId: string): Observable<UserProfile> {
    return this.db.object<UserProfile>(`users/${userId}/profile`).valueChanges();
  }

  // Update user profile
  updateUserProfile(userId: string, profileData: Partial<UserProfile>): Promise<void> {
    return this.db.object(`users/${userId}/profile`).update(profileData);
  }

  // Add an award to user's profile
  addUserAward(userId: string, award: string): Promise<any> {
    return this.db.list(`users/${userId}/profile/awards`).push(award).then(ref => ref);
  }

  // Get user's statistics
  getUserStats(userId: string): Observable<any> {
    return this.db.object(`users/${userId}/stats`).valueChanges();
  }

  // Update user's statistics
  updateUserStats(userId: string, stats: any): Promise<void> {
    return this.db.object(`users/${userId}/stats`).update(stats);
  }

  // Update return type to Promise<any> to handle ThenableReference
  addSearchToHistory(userId: string, searchData: any): Promise<any> {
    return this.db.list(`users/${userId}/searchHistory`).push(searchData).then(ref => ref);
  }

  getSearchHistory(userId: string): Observable<any[]> {
    return this.db.list(`users/${userId}/searchHistory`).valueChanges();
  }

  // Update return type to Promise<any> to handle ThenableReference
  addAward(userId: string, award: any): Promise<any> {
    return this.db.list(`users/${userId}/profile/awards`).push(award).then(ref => ref);
  }

  getAwards(userId: string): Observable<any[]> {
    return this.db.list(`users/${userId}/profile/awards`).valueChanges();
  }
} 