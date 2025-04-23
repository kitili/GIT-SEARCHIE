import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/auth';
import { DatabaseService } from './database.service';
import firebase from 'firebase/app';
import 'firebase/auth';

interface User {
  id: string;
  email: string;
  name: string;
}

interface SignupData {
  name: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  private userSubject: BehaviorSubject<any> = new BehaviorSubject(null);
  user$: Observable<any> = this.userSubject.asObservable();

  constructor(
    private http: HttpClient,
    private auth: AngularFireAuth,
    private db: DatabaseService
  ) {
    this.currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
    this.currentUser = this.currentUserSubject.asObservable();
    this.auth.authState.subscribe(user => {
      this.userSubject.next(user);
      if (user) {
        this.initializeUserProfile(user);
      }
    });
  }

  private async initializeUserProfile(user: firebase.User) {
    const userProfile = await this.db.getUserProfile(user.uid).toPromise();
    if (!userProfile) {
      // Create initial profile
      await this.db.updateUserProfile(user.uid, {
        name: user.displayName || 'User',
        email: user.email || '',
        searchCount: 0,
        lastSearches: [],
        awards: []
      });
    }
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(email: string, password: string): Observable<User> {
    return new Observable<User>(observer => {
      this.auth.signInWithEmailAndPassword(email, password)
        .then(async (result) => {
          if (result.user) {
            const userProfile = await this.db.getUserProfile(result.user.uid).toPromise();
            const userResponse: User = {
              id: result.user.uid,
              email: result.user.email || '',
              name: userProfile?.name || result.user.displayName || 'User'
            };
            localStorage.setItem('currentUser', JSON.stringify(userResponse));
            this.currentUserSubject.next(userResponse);
            observer.next(userResponse);
            observer.complete();
          }
        })
        .catch(error => {
          observer.error({ message: 'Invalid email or password' });
        });
    });
  }

  signup(userData: SignupData): Observable<User> {
    return new Observable<User>(observer => {
      this.auth.createUserWithEmailAndPassword(userData.email, userData.password)
        .then(async (result) => {
          if (result.user) {
            // Create user profile
            await this.db.updateUserProfile(result.user.uid, {
              name: userData.name,
              email: userData.email,
              searchCount: 0,
              lastSearches: [],
              awards: []
            });

            const userResponse: User = {
              id: result.user.uid,
              email: userData.email,
              name: userData.name
            };

            localStorage.setItem('currentUser', JSON.stringify(userResponse));
            this.currentUserSubject.next(userResponse);
            observer.next(userResponse);
            observer.complete();
          }
        })
        .catch(error => {
          observer.error({ message: 'Registration failed. Please try again.' });
        });
    });
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.auth.signOut();
  }

  private getUserFromStorage(): User | null {
    const storedUser = localStorage.getItem('currentUser');
    return storedUser ? JSON.parse(storedUser) : null;
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Something went wrong';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    
    return throwError({ message: errorMessage });
  }

  async signInWithGoogle() {
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      const result = await this.auth.signInWithPopup(provider);
      if (result.user) {
        await this.initializeUserProfile(result.user);
      }
      return result;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  }

  async signOut() {
    try {
      await this.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  getCurrentUser() {
    return this.auth.currentUser;
  }

  isAuthenticated(): Observable<boolean> {
    return new Observable(subscriber => {
      this.auth.onAuthStateChanged(user => {
        subscriber.next(!!user);
      });
    });
  }
} 