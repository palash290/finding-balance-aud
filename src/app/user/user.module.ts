import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserRoutingModule } from './user-routing.module';
import { MainComponent } from './main/main.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { MyProfileComponent } from './my-profile/my-profile.component';
import { EventsComponent } from './events/events.component';
import { FeedsComponent } from './feeds/feeds.component';
import { MyIntrestComponent } from './my-intrest/my-intrest.component';
import { NotificationComponent } from './notification/notification.component';
import { EditProfileComponent } from './edit-profile/edit-profile.component';
import { SavedPostsComponent } from './saved-posts/saved-posts.component';
import { SettingComponent } from './setting/setting.component';
import { ChatComponent } from './chat/chat.component';
import { SuggestedCategoriesComponent } from './suggested-categories/suggested-categories.component';
import { AddEventComponent } from './add-event/add-event.component';
import { AddPostComponent } from './add-post/add-post.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { CoachProfileComponent } from './coach-profile/coach-profile.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EditEventComponent } from './edit-event/edit-event.component';
import { ImageCropperComponent } from 'ngx-image-cropper';
import { ToastrModule } from 'ngx-toastr';
import { ChatFilterPipe, FilterPipe } from '../services/filter.pipe';
import { FollowingComponent } from './following/following.component';
import { CommunityComponent } from './community/community.component';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatSelectModule} from '@angular/material/select';
import { SearchCoachesComponent } from './search-coaches/search-coaches.component';
import { TeamsComponent } from './teams/teams.component';
import { FollowUsersComponent } from './follow-users/follow-users.component';
import { PaymentSuccessComponent } from './payment-success/payment-success.component';
import { EventListComponent } from './event-list/event-list.component';
import { PaymentCancelComponent } from './payment-cancel/payment-cancel.component';
import {MatTooltipModule} from '@angular/material/tooltip';
import { AngularWavesurferServiceModule, WaveService } from 'angular-wavesurfer-service';
import { SubscriptionDetailsComponent } from './subscription-details/subscription-details.component';
import { SibscriptionCoachComponent } from './sibscription-coach/sibscription-coach.component';
import { AddPostMobileComponent } from './add-post/add-post-mobile/add-post-mobile.component';
import { PostCatFilterComponent } from './add-post/post-cat-filter/post-cat-filter.component';
import { FeedFilterComponent } from './feeds/feed-filter/feed-filter.component';


@NgModule({
  declarations: [
    MainComponent,
    SidebarComponent,
    MyProfileComponent,
    EventsComponent,
    FeedsComponent,
    MyIntrestComponent,
    NotificationComponent,
    EditProfileComponent,
    SavedPostsComponent,
    SettingComponent,
    ChatComponent,
    SuggestedCategoriesComponent,
    AddEventComponent,
    AddPostComponent,
    ChangePasswordComponent,
    CoachProfileComponent,
    EditEventComponent,
    FilterPipe,
    ChatFilterPipe,
    FollowingComponent,
    CommunityComponent,
    SearchCoachesComponent,
    TeamsComponent,
    FollowUsersComponent,
    PaymentSuccessComponent,
    EventListComponent,
    PaymentCancelComponent,
    SubscriptionDetailsComponent,
    SibscriptionCoachComponent,
    AddPostMobileComponent,
    PostCatFilterComponent,
    FeedFilterComponent,
  ],
  imports: [
    CommonModule,
    UserRoutingModule,
    FormsModule,
    //ChatFilterPipe,
    ReactiveFormsModule,
    ImageCropperComponent,
    ToastrModule.forRoot({
      timeOut: 5000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
      progressBar: true
    }),
    MatFormFieldModule,
    MatChipsModule,
    MatIconModule,
    MatSnackBarModule,
    MatTooltipModule,
    AngularWavesurferServiceModule,
    MatSelectModule,
  ],
  providers: [WaveService],
})
export class UserModule { }
