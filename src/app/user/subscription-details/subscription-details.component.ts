import { Component } from '@angular/core';

@Component({
  selector: 'app-subscription-details',
  templateUrl: './subscription-details.component.html',
  styleUrl: './subscription-details.component.css'
})
export class SubscriptionDetailsComponent {

  stripeLink: any;
  btnLoaderPay: boolean = false;
  userId: any;

  ngOnInit() {
    this.userId = localStorage.getItem('fbId');
    this.stripeLink = localStorage.getItem('planUrl');
  }

  redirect() {
    window.location.href = this.stripeLink;
  }

  ngOnDestroy() {
    localStorage.removeItem('planUrl');
  }

}
