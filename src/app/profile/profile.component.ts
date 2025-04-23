import { Component, OnInit, OnDestroy, EventEmitter, Output } from '@angular/core';
import { ProfileService } from '../service/profile.service';
import { ActivatedRoute, Router, NavigationStart } from '@angular/router';
import { Subscription } from 'rxjs';
import { Repository } from '../service/profile.service';
import { UserHistoryService, UserHistory } from '../service/user-history.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

interface SearchedUser {
  username: string;
  visitCount: number;
  lastVisited: Date;
  recentProjects: string[];
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy {
  profile: any = null;
  repos: Repository[] = [];
  forkedRepos: Repository[] = [];
  emptyRepos: Repository[] = [];
  similarRepos: any = null;
  username: string = '';
  searchTerm: string;
  loading: boolean = false;
  errorMessage: string = '';
  @Output() searchEmmiter = new EventEmitter<any>();
  private routerSubscription: Subscription;
  userHistory: UserHistory[] = [];
  private routeSubscription: Subscription;
  searchForm: FormGroup;
  submitted = false;

  // Language colors mapping (GitHub colors)
  private languageColors: { [key: string]: string } = {
    'JavaScript': '#f1e05a',
    'TypeScript': '#2b7489',
    'Python': '#3572A5',
    'Java': '#b07219',
    'C#': '#178600',
    'PHP': '#4F5D95',
    'HTML': '#e34c26',
    'CSS': '#563d7c',
    'Go': '#00ADD8',
    'Ruby': '#701516',
    'Swift': '#ffac45',
    'Kotlin': '#F18E33',
    'Rust': '#dea584',
    'Dart': '#00B4AB',
    'Shell': '#89e051'
  };

  constructor(
    private profileService: ProfileService,
    private route: ActivatedRoute,
    private router: Router,
    private userHistoryService: UserHistoryService,
    private formBuilder: FormBuilder
  ) {
    this.searchForm = this.formBuilder.group({
      username: ['', Validators.required]
    });
  }

  getLanguageColor(language: string): string {
    return this.languageColors[language] || '#8b949e'; // Default color if language not found
  }

  ngOnInit(): void {
    this.routeSubscription = this.route.queryParams.subscribe(params => {
      if (params['username']) {
        this.username = params['username'];
        this.findProfile();
      }
    });
    this.loadUserHistory();

    // Handle navigation events
    this.routerSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        if (event.url.includes('/profile')) {
          const urlParams = new URLSearchParams(event.url.split('?')[1]);
          const username = urlParams.get('username');
          if (username && username !== this.username) {
            this.username = username;
            this.findProfile();
          }
        }
      }
    });
  }

  ngOnDestroy(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  findProfile(): void {
    this.submitted = true;
    
    if (this.searchForm.invalid) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.profile = null;
    this.repos = [];
    this.forkedRepos = [];
    this.emptyRepos = [];
    this.similarRepos = null;

    const username = this.searchForm.get('username')?.value;
    this.profileService.getProfile(username).subscribe({
      next: (data) => {
        this.profile = data;
        this.loadRepositories();
        this.updateUserVisitData();
      },
      error: (error) => {
        this.errorMessage = 'User not found. Please check the username and try again.';
        this.loading = false;
      }
    });
  }

  private loadUserHistory(): void {
    this.userHistoryService.getAllUserHistory()
      .subscribe(history => {
        this.userHistory = history.sort((a, b) => 
          new Date(b.lastVisited).getTime() - new Date(a.lastVisited).getTime()
        );
      });
  }

  navigateToUser(username: string): void {
    this.router.navigate(['/profile'], { 
      queryParams: { username: username } 
    });
  }

  getAwardIcon(awardName: string): string {
    const icons: { [key: string]: string } = {
      'Early Bird': '🌅',
      'Night Owl': '🌙',
      'Commit Master': '💻',
      'Popular': '⭐',
      'Contributor': '📚'
    };
    return icons[awardName] || '🏆';
  }

  emmitUser() {
    this.searchEmmiter.emit(this.searchTerm);
  }

  // Track when a repository is viewed
  viewRepository(repoName: string): void {
    // Get existing searched users
    let searchedUsers: SearchedUser[] = [];
    const savedUsers = localStorage.getItem('searchedUsers');
    
    if (savedUsers) {
      searchedUsers = JSON.parse(savedUsers);
      const userIndex = searchedUsers.findIndex(user => user.username === this.username);
      
      if (userIndex !== -1) {
        // Add repo to recent projects if not already there
        if (!searchedUsers[userIndex].recentProjects.includes(repoName)) {
          // Add to the beginning of the array
          searchedUsers[userIndex].recentProjects.unshift(repoName);
          
          // Keep only the 5 most recent projects
          if (searchedUsers[userIndex].recentProjects.length > 5) {
            searchedUsers[userIndex].recentProjects = searchedUsers[userIndex].recentProjects.slice(0, 5);
          }
          
          // Save back to localStorage
          localStorage.setItem('searchedUsers', JSON.stringify(searchedUsers));
        }
      }
    }
  }

  private updateUserVisitData(): void {
    // Get existing searched users
    let searchedUsers: SearchedUser[] = [];
    const savedUsers = localStorage.getItem('searchedUsers');
    
    if (savedUsers) {
      searchedUsers = JSON.parse(savedUsers);
      const userIndex = searchedUsers.findIndex(user => user.username === this.username);
      
      if (userIndex !== -1) {
        // Update visit count and time
        searchedUsers[userIndex].visitCount++;
        searchedUsers[userIndex].lastVisited = new Date();
        
        // Save back to localStorage
        localStorage.setItem('searchedUsers', JSON.stringify(searchedUsers));
      } else {
        // If user wasn't found, add them
        searchedUsers.push({
          username: this.username,
          visitCount: 1,
          lastVisited: new Date(),
          recentProjects: []
        });
        
        localStorage.setItem('searchedUsers', JSON.stringify(searchedUsers));
      }
    } else {
      // If no users exist yet, create the first entry
      searchedUsers = [{
        username: this.username,
        visitCount: 1,
        lastVisited: new Date(),
        recentProjects: []
      }];
      
      localStorage.setItem('searchedUsers', JSON.stringify(searchedUsers));
    }
  }

  resetSearch() {
    this.username = '';
    this.profile = null;
    this.repos = [];
    this.profileService.resetProfile();
  }

  // Add method to get similar repositories
  getSimilarRepos(repoName: string) {
    this.profileService.getSimilarRepos(repoName).subscribe(response => {
      this.similarRepos = response;
    });
  }

  private loadRepositories(): void {
    this.profileService.getProfileRepos().subscribe({
      next: (repos) => {
        this.repos = repos;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Error loading repositories.';
        this.loading = false;
      }
    });

    this.profileService.getForkedRepos().subscribe({
      next: (repos) => {
        this.forkedRepos = repos;
      }
    });

    this.profileService.getEmptyRepos().subscribe({
      next: (repos) => {
        this.emptyRepos = repos;
      }
    });
  }
}
