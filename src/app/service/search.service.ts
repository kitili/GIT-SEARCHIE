import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DatabaseService } from './database.service';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface SearchResult {
  items: any[];
  total_count: number;
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private readonly GITHUB_API_URL = 'https://api.github.com';

  constructor(
    private http: HttpClient,
    private db: DatabaseService,
    private auth: AuthService
  ) {}

  searchRepositories(query: string, page: number = 1): Observable<SearchResult> {
    return this.http.get<SearchResult>(`${this.GITHUB_API_URL}/search/repositories`, {
      params: {
        q: query,
        page: page.toString(),
        per_page: '10'
      }
    }).pipe(
      map(results => {
        // Save search to history if user is logged in
        if (this.auth.currentUserValue) {
          this.saveSearchToHistory(query, results.total_count);
        }
        return results;
      })
    );
  }

  private async saveSearchToHistory(query: string, resultsCount: number) {
    const user = this.auth.currentUserValue;
    if (!user) return;

    const searchData = {
      username: user.name,
      searchQuery: query,
      timestamp: Date.now(),
      resultsCount: resultsCount
    };

    try {
      // Save search to history
      await this.db.saveSearch(user.id, searchData);

      // Update user's search count
      const userProfile = await this.db.getUserProfile(user.id).toPromise();
      if (userProfile) {
        await this.db.updateUserProfile(user.id, {
          searchCount: (userProfile.searchCount || 0) + 1
        });
      }

      // Check for awards
      this.checkAndAwardAchievements(user.id, userProfile);
    } catch (error) {
      console.error('Error saving search history:', error);
    }
  }

  private async checkAndAwardAchievements(userId: string, userProfile: any) {
    const awards = [];
    
    // Early Adopter Award (first 100 searches)
    if (userProfile.searchCount === 100) {
      awards.push('early-adopter');
    }
    
    // Power User Award (500 searches)
    if (userProfile.searchCount === 500) {
      awards.push('power-user');
    }
    
    // Add any new awards
    for (const award of awards) {
      if (!userProfile.awards?.includes(award)) {
        await this.db.addUserAward(userId, award);
      }
    }
  }

  getSearchHistory(): Observable<any[]> {
    const user = this.auth.currentUserValue;
    if (!user) return new Observable(observer => observer.next([]));
    
    return this.db.getUserSearchHistory(user.id);
  }

  getUserStats(): Observable<any> {
    const user = this.auth.currentUserValue;
    if (!user) return new Observable(observer => observer.next({}));
    
    return this.db.getUserStats(user.id);
  }
} 