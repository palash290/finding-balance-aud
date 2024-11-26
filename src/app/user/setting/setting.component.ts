import { Component, OnInit } from '@angular/core';
import { SharedService } from '../../services/shared.service';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { Location } from '@angular/common';


@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrl: './setting.component.css'
})
export class SettingComponent implements OnInit {

  userDetails: any;
  role: any;
  isCoach: boolean = true;
  userId: any;
  userPlan: any;
  plan_expired_at: any;
  canceled_at: any;
  membership: boolean = false;

  constructor(private srevice: SharedService, private toastr: ToastrService, private route: Router, private location: Location) { }

  onToggleMenu() {
    this.srevice.toggleMenuVisibility();
  }

  ngOnInit(): void {
    this.getPackage();
    this.canceled_at = localStorage.getItem('canceled_at');
    this.plan_expired_at = localStorage.getItem('plan_expired_at');
    this.userId = localStorage.getItem('fbId');
    this.role = this.srevice.getRole();
    if (this.role == 'USER') {
      this.isCoach = false;
    }
    const jaonData: any = localStorage.getItem('userDetailFb');
    const data = JSON.parse(jaonData)
    this.userDetails = data;
    this.getSettings();
    this.userPlan = localStorage.getItem('findPlan');
    if (this.canceled_at == 'null') {
      this.membership = true;
    }
    
  }

  getPackage() {
    this.srevice.getApi(this.isCoach ? 'coach/myActivePlan' : 'user/myActivePlan').subscribe({
      next: (resp) => {
        this.userPlan = resp.data.plan.name;
        this.plan_expired_at = resp.data.expired_at;
        this.canceled_at = resp.data.canceled_at;
        localStorage.setItem('findPlan', this.userPlan);
        localStorage.setItem('plan_expired_at', this.plan_expired_at);
        localStorage.setItem('canceled_at', this.canceled_at);
      },
      error: (error) => {
        console.error('Error fetching project list:', error);
      }
    });
  }

  backClicked() {
    this.location.back();
  }

  chatNotification!: boolean;
  feedNotification!: boolean;

  getSettings(): void {
    this.srevice.getApi(this.isCoach ? 'coach/mySettings' : 'user/mySettings').subscribe((resp: any) => {
      if (resp.success && resp.data) {
        this.chatNotification = resp.data.chatNotification;
        this.feedNotification = resp.data.feedNotification;
      }
    });
  }

  updateChatNotification(): void {

    const chatSettings = {
      chatNotification: this.chatNotification,
      feedNotification: this.feedNotification
    };

    this.srevice.postAPIFormData(this.isCoach ? 'coach/mySettings' : 'user/mySettings', chatSettings).subscribe((resp: any) => {
      if (resp.success) {
        this.toastr.success(resp.message);
        console.log('Chat notification settings updated successfully');
        this.getSettings();
      } else {
        this.toastr.warning(resp.message);
        console.error('Failed to update chat notification settings');
      }
    });
  }

  // cancelSubscription() {
  //   const formURlData = new URLSearchParams();
  //   if (this.isCoach) {
  //     formURlData.set('coachId', this.userId);
  //   } else {
  //     formURlData.set('userId', this.userId);
  //   }
  //   this.srevice.postAPI(`subscription/cancel-subscription`, formURlData.toString()).subscribe(response => {

  //   });
  // }

  cancelSubscription() {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You want to cancel subscription!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e58934',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes'
    }).then((result) => {
      const formURlData = new URLSearchParams();
      if (this.isCoach) {
        formURlData.set('coachId', this.userId);
      } else {
        formURlData.set('userId', this.userId);
      }
      if (result.isConfirmed) {
        this.srevice.postAPI(`subscription/cancel-subscription`, formURlData.toString()).subscribe({
          next: (resp) => {
            if (resp.success) {
              Swal.fire(
                'Cancelled!',
                'Your subscription has been cancelled successfully.',
                'success'
              );
              this.route.navigateByUrl('/home')
              this.toastr.success(resp.message);
              this.getPackage();
            } else {
              this.toastr.success(resp.message);
            }
          },
          error: (error) => {
            Swal.fire(
              'Error!',
              'There was an error cancelling your subscription.',
              'error'
            );
            this.getPackage();
            this.toastr.error('Error deleting subscription!');
            console.error('Error deleting account', error);
          }
        });
      }
    });
  }

  // updateFeedNotification(): void {
  //   const feedSettings = {
  //     feedNotification: this.feedNotification
  //   };

  //   this.srevice.postAPIFormData(this.isCoach ? 'coach/mySettings' : 'user/mySettings', feedSettings).subscribe((resp: any) => {
  //     if (resp.success) {
  //       this.toastr.success(resp.message);
  //       console.log('Feed notification settings updated successfully');
  //       this.getSettings();
  //     } else {
  //       this.toastr.warning(resp.message);
  //       console.error('Failed to update feed notification settings');
  //     }
  //   });
  // }


  logout() {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You want to logout!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e58934',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.srevice.logout();
      }
    });
  }

  deleteAccount() {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this account!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e58934',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.srevice.deleteAcc(this.isCoach ? 'coach/deleteAccount' : 'user/deleteAccount').subscribe({
          next: (resp) => {
            if (resp.success) {
              Swal.fire(
                'Deleted!',
                'Your account has been deleted successfully.',
                'success'
              );
              this.route.navigateByUrl('/home')
              this.toastr.success(resp.message);
            } else {
              this.toastr.warning(resp.message);
            }
          },
          error: (error) => {
            Swal.fire(
              'Error!',
              'There was an error deleting your account.',
              'error'
            );
            this.toastr.error('Error deleting account!');
            console.error('Error deleting account', error);
          }
        });
      }
    });
  }


}
