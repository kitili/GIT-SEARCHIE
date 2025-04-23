import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SampleusersComponent } from './sampleusers/sampleusers.component';
import { ProfileComponent } from './profile/profile.component';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { SearchComponent } from './search/search.component';
import { SignupComponent } from './signup/signup.component';
import { LoginComponent } from './login/login.component';

// You'll need to import your search component here
// import { SearchComponent } from './search/search.component';

const routes: Routes = [
  { path: '', component: LandingPageComponent },
  { path: 'sampleusers', component: SampleusersComponent},
  { path: 'profile', component: ProfileComponent},
  { path: 'search', component: SearchComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'login', component: LoginComponent }
  // Uncomment and replace with your actual component once created
  // { path: 'search', component: SearchComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
