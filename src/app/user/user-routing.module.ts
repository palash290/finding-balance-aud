import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
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
import { ChangePasswordComponent } from './change-password/change-password.component';
import { EditEventComponent } from './edit-event/edit-event.component';
import { FollowingComponent } from './following/following.component';
import { CommunityComponent } from './community/community.component';
import { SearchCoachesComponent } from './search-coaches/search-coaches.component';
import { TeamsComponent } from './teams/teams.component';
import { FollowUsersComponent } from './follow-users/follow-users.component';
import { EventListComponent } from './event-list/event-list.component';
import { PaymentSuccessComponent } from './payment-success/payment-success.component';
import { PaymentCancelComponent } from './payment-cancel/payment-cancel.component';
import { SubscriptionDetailsComponent } from './subscription-details/subscription-details.component';
import { SibscriptionCoachComponent } from './sibscription-coach/sibscription-coach.component';
import { AddPostMobileComponent } from './add-post/add-post-mobile/add-post-mobile.component';
import { PostCatFilterComponent } from './add-post/post-cat-filter/post-cat-filter.component';
import { FeedFilterComponent } from './feeds/feed-filter/feed-filter.component';

const routes: Routes = [
  {
    path: 'main', component: MainComponent,
    children: [
      {
        path: "my-profile",
        component: MyProfileComponent,
      },
      {
        path: "my-profile/:id/:role",
        component: MyProfileComponent,
      },
      {
        path: "edit-profile",
        component: EditProfileComponent,
      },
      {
        path: "change-password",
        component: ChangePasswordComponent,
      },
      {
        path: "events/:eventId",
        component: EventsComponent,
      },
      {
        path: "edit-event/:eventId",
        component: EditEventComponent,
      },
      {
        path: "feeds",
        component: FeedsComponent,
      },

      {
        path: "feeds/:name/:id",
        component: FeedsComponent,
      },

      {
        path: "my-intrest",
        component: MyIntrestComponent,
      },
      {
        path: "following",
        component: FollowingComponent,
      },
      {
        path: "notifications",
        component: NotificationComponent,
      },
      {
        path: "saved-posts",
        component: SavedPostsComponent,
      },
      {
        path: "settings",
        component: SettingComponent,
      },
      {
        path: "chat",
        component: ChatComponent,
      },
      {
        path: "add-event",
        component: AddEventComponent,
      },
      {
        path: "community",
        component: CommunityComponent,
      },
      {
        path: "search",
        component: SearchCoachesComponent,
      },
      {
        path: "teams",
        component: TeamsComponent,
      },
      {
        path: "followed-users",
        component: FollowUsersComponent,
      },
      {
        path: "suggested-categories",
        component: SuggestedCategoriesComponent,
      },
      {
        path: "event-list",
        component: EventListComponent,
      },

      {
        path: "add-post",
        component: AddPostMobileComponent,
      },
      {
        path: "add-post/:name/:id",
        component: AddPostMobileComponent,
      },
      {
        path: "post-filter",
        component: PostCatFilterComponent,
      },

      {
        path: "feed-filter",
        component: FeedFilterComponent,
      },

    ],
  },
  {
    path: "subscription-details",
    component: SubscriptionDetailsComponent,
  },
  {
    path: "subscription-coach",
    component: SibscriptionCoachComponent,
  },
  {
    path: "payment-success",
    component: PaymentSuccessComponent,
  },
  {
    path: "payment-cancel",
    component: PaymentCancelComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
