import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Repository {
  id: number;
  name: string;
  full_name: string;
  fork: boolean;
  size: number;
  // Add other properties as needed
}

@Injectable({
  providedIn: 'root'
})

export class ProfileService {
  private username: string;

  constructor(private http: HttpClient) {
    console.log("");
    this.username = '';
  }

  getProfileInfo() {
    return this.http.get("https://api.github.com/users/" + this.username)
  }

  getProfileRepos(): Observable<Repository[]> {
    return this.http.get<Repository[]>("https://api.github.com/users/" + this.username + "/repos")
  }

  getForkedRepos(): Observable<Repository[]> {
    return this.http.get<Repository[]>("https://api.github.com/users/" + this.username + "/repos?type=forks")
  }

  getEmptyRepos(): Observable<Repository[]> {
    return this.http.get<Repository[]>("https://api.github.com/users/" + this.username + "/repos")
  }

  getSimilarRepos(repoName: string) {
    return this.http.get(`https://api.github.com/search/repositories?q=${repoName}+in:name&sort=stars&order=desc`)
  }

  updateProfile(username: string) {
    this.username = username;
  }
  
  getProfile(username: string) {
    this.username = username;
    return this.http.get("https://api.github.com/users/" + this.username);
  }

  resetProfile() {
    this.username = '';
  }
}
