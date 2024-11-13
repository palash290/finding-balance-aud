import { Component } from '@angular/core';
import { SharedService } from '../../services/shared.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sibscription-coach',
  templateUrl: './sibscription-coach.component.html',
  styleUrl: './sibscription-coach.component.css'
})
export class SibscriptionCoachComponent {

  stripeLink: any;
  btnLoaderPay: boolean = false;
  userId: any;

  constructor(private router: Router, private visibilityService: SharedService) { }

  ngOnInit() {
    this.userId = localStorage.getItem('fbId');
    this.stripeLink = localStorage.getItem('planUrl');
  }

  // getSubscriptonCoach() {
  //   const formURlData = new URLSearchParams();
  //   formURlData.set('coachId', this.userId);
  //   formURlData.set('planId', '4');
  //   //this.btnLoaderPay = true;
  //   this.visibilityService.postAPI(`subscription/create-subscription`, formURlData.toString()).subscribe(response => {
  //     this.stripeLink = response.url;
  //     localStorage.setItem('planId', '4')
  //     //window.location.href = this.stripeLink;
  //     //this.btnLoaderPay = false;
  //     //console.log(this.stripeLink);
  //   });
  // }

  redirect() {
    window.location.href = this.stripeLink;
  }

  ngOnDestroy(): void {
    localStorage.removeItem('planUrl');
  }


}
