import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SharedService } from '../../services/shared.service';

@Component({
  selector: 'app-payment-success',
  templateUrl: './payment-success.component.html',
  styleUrl: './payment-success.component.css'
})
export class PaymentSuccessComponent {

  adHocPostId: any;
  adHocEventId: any;
  planId: any;

  constructor(private route: Router, private service: SharedService) {
    this.adHocPostId = localStorage.getItem('adHocPostId');
    this.adHocEventId = localStorage.getItem('adHocEventId');
    this.planId = localStorage.getItem('planId');
    //debugger
    if (!this.adHocPostId && !this.adHocEventId && !this.planId) {
      this.route.navigateByUrl('/user/payment-cancel');
    }
  }

  ngOnInit() {
    // this.adHocPostId = localStorage.getItem('adHocPostId');
    // this.adHocEventId = localStorage.getItem('adHocEventId');

    //console.log(`Payment Done successful for ${localStorage.getItem('package')} package!`)
    if (this.adHocPostId) {
      this.setSub();
    }
    if (this.adHocEventId) {
      this.payForEvent();
    }
  }

  setSub() {
    this.service.postAPI(`user/adhocPayment/${this.adHocPostId}`, null).subscribe({
      next: (resp) => {
        console.log(resp)
      },
      error: error => {
        console.log(error.message)
      }
    })
  }

  payForEvent() {
    this.service.postAPI(`user/event/adhocPayment/${this.adHocEventId}`, null).subscribe({
      next: (resp) => {
        console.log(resp)
      },
      error: error => {
        console.log(error.message)
      }
    })
  }

  ngOnDestroy() {
    localStorage.removeItem('adHocPostId');
    localStorage.removeItem('adHocEventId');
    localStorage.removeItem('planId');
  }

  logout() {
    if (this.adHocPostId) {
      this.route.navigateByUrl('/user/main/feeds');
    }
    if (this.adHocEventId) {
      this.route.navigateByUrl(`user/main/events/${this.adHocEventId}`);
    }
  }


}