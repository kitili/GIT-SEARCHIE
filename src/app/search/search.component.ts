import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SearchService } from '../service/search.service';
import { AuthService } from '../service/auth.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
  searchForm: FormGroup;
  searchResults: any[] = [];
  loading = false;
  error = '';
  currentPage = 1;
  totalResults = 0;
  searchHistory: any[] = [];
  userStats: any = {};

  constructor(
    private formBuilder: FormBuilder,
    private searchService: SearchService,
    public authService: AuthService
  ) {
    this.searchForm = this.formBuilder.group({
      query: ['']
    });
  }

  ngOnInit(): void {
    // Load search history if user is logged in
    if (this.authService.currentUserValue) {
      this.loadSearchHistory();
      this.loadUserStats();
    }
  }

  onSubmit() {
    if (this.searchForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = '';
    this.currentPage = 1;

    this.searchService.searchRepositories(this.searchForm.value.query)
      .subscribe(
        data => {
          this.searchResults = data.items;
          this.totalResults = data.total_count;
          this.loading = false;
        },
        error => {
          this.error = 'Error searching repositories. Please try again.';
          this.loading = false;
        }
      );
  }

  loadMore() {
    this.currentPage++;
    this.loading = true;

    this.searchService.searchRepositories(this.searchForm.value.query, this.currentPage)
      .subscribe(
        data => {
          this.searchResults = [...this.searchResults, ...data.items];
          this.loading = false;
        },
        error => {
          this.error = 'Error loading more results. Please try again.';
          this.loading = false;
        }
      );
  }

  private loadSearchHistory() {
    this.searchService.getSearchHistory()
      .subscribe(history => {
        this.searchHistory = history;
      });
  }

  private loadUserStats() {
    this.searchService.getUserStats()
      .subscribe(stats => {
        this.userStats = stats;
      });
  }

  formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleString();
  }
}
