import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedService } from '../../services/shared.service';
import Swal from 'sweetalert2';
import { Location } from '@angular/common';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrl: './events.component.css'
})
export class EventsComponent {

  eventId: any;
  isCoach: boolean = true;
  role: any;
  followersList: any[] = [];
  userPlan: any;
  userId: any;
  coachId: any;

  constructor(private route: ActivatedRoute, private service: SharedService, private router: Router, private location: Location, private toastr: ToastrService) { }

  ngOnInit(): void {
    localStorage.removeItem('adHocEventId');
    this.userId = localStorage.getItem('fbId');
    this.userPlan = localStorage.getItem('findPlan');
    this.role = this.service.getRole();
    if (this.role == 'USER') {
      this.isCoach = false;
    }

    this.route.paramMap.subscribe(params => {
      this.eventId = params.get('eventId');
      console.log('Event ID:', this.eventId);
      this.getEventData(this.eventId);
    });



    this.service.triggerRefresh();
  }

  stripeLink: any;
  btnLoaderPay: boolean = false;

  getAdHocPost(postId: any) {
    localStorage.setItem('adHocEventId', postId)
    const formURlData = new URLSearchParams();
    formURlData.set('eventId', postId);
    this.btnLoaderPay = true;
    this.service.postAPI(`user/event/paymentThroughStripeForEvent`, formURlData.toString()).subscribe(response => {
      this.stripeLink = response.url;
      window.location.href = this.stripeLink;
      this.btnLoaderPay = false;
      console.log(this.stripeLink);
    });
  }

  ngOnDestroy() {
    localStorage.removeItem('adHocEventId');
  }

  redirect() {
    window.location.href = this.stripeLink;
  }

  getPaidGuest() {
    this.service.getApi(`coach/event/paidUsers/${this.eventId}`).subscribe(response => {
      if (response.success) {
        this.followersList = response.data;
      }
    });
  }

  eventData: any;

  getEventData(id: any) {
    this.service.getApi(this.isCoach ? `coach/event/${id}` : `user/event/allEvents/${id}`).subscribe({
      next: (resp) => {
        this.eventData = resp.data;
        this.coachId = resp.data.coach.id;
        this.getEventListData();
        //this.data = resp.data?.map((item: any) => ({ ...item, isExpanded: false })).reverse();
      },
      error: error => {
        console.log(error.message)
      }
    });
  }

  eventListData: any;

  getEventListData() {
    this.service.getApi(this.isCoach ? 'coach/event' : 'user/event/allEvents').subscribe({
      next: resp => {

        this.eventListData = this.isCoach ? resp.data.events : resp.data;
        if (this.eventData) {
          this.eventListData = this.eventListData.filter((event: { id: any; }) => event.id !== this.eventData.id);
        }

        //this.data = resp.data?.map((item: any) => ({ ...item, isExpanded: false })).reverse();
      },
      error: error => {
        console.log(error.message)
      }
    });
  }

  getEventId(eventId: any) {
    this.router.navigateByUrl(`user/main/events/${eventId}`)
  }

  getEventEditId(eventId: any) {
    this.router.navigateByUrl(`user/main/edit-event/${eventId}`)
  }

  userIntrested(id: any) {
    this.service.postAPI(`user/event/register/${id}`, null).subscribe({
      next: (resp) => {
        console.log(resp);
        this.getEventListData();
        this.getEventData(id);
        this.service.triggerRefresh();
      },
      error: error => {
        console.log(error.message)
      }
    });
  }

  userNotIntrested(id: any) {
    this.service.postAPI(`user/event/unRegister/${id}`, null).subscribe({
      next: (resp) => {
        console.log(resp);
        this.getEventListData();
        this.getEventData(id);
        this.service.triggerRefresh();
      },
      error: error => {
        console.log(error.message)
      }
    });
  }

  deleteEvent(id: any) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this event!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e58934',
      cancelButtonColor: '#949296 ',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.service.deleteAcc(`coach/event/${id}`).subscribe({
          next: (resp) => {
            if (resp.success) {
              this.service.triggerRefresh();
              this.router.navigateByUrl('/user/main/event-list')
              //this.location.back();
            } else {
              this.getEventListData();
            }
          },
          error: (error) => {
            this.getEventListData();
            //this.toastr.error('Error deleting account!');
            console.error('Error deleting account', error);
          }
        });
      }
    });
  }

  backClicked() {
    this.location.back();
  }

  reportDesc: any;
  btnLoaderReport: boolean = false;
  nameError: boolean = false;
  @ViewChild('closeModalR') closeModalR!: ElementRef;

  repostPost() {
    // Check if name is empty
    if (!this.reportDesc || this.reportDesc.trim() === '') {
      this.nameError = true;
      return;
    } else {
      this.nameError = false; // Reset the error state
    }

    this.btnLoaderReport = true;
    const formData = new URLSearchParams();
    formData.set('eventId', this.eventId);
    formData.set('reportEntity', 'EVENT');
    formData.set('reason', this.reportDesc);

    this.service.postAPI('user/report/content', formData).subscribe({
      next: (resp) => {
        if (resp.success === true) {
          this.closeModalR.nativeElement.click();
          //this.visibilityService.triggerRefresh();
          this.toastr.success(resp.message);
        } else {
          this.toastr.warning(resp.message);
        }
        this.btnLoaderReport = false;
      },
      error: (error) => {
        this.btnLoaderReport = false;
        if (error.error.message) {
          this.toastr.error(error.error.message);
        } else {
          this.toastr.error('Something went wrong!');
        }
        //console.log(error.statusText);
      }
    });
  }


}
