import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SharedService } from '../../../services/shared.service';

@Component({
  selector: 'app-post-cat-filter',
  templateUrl: './post-cat-filter.component.html',
  styleUrl: './post-cat-filter.component.css'
})
export class PostCatFilterComponent {

  avatar_url_fb: any;
  categories: any[] = [];
  categoryId: any = '1';
  postType: any = '0';
  selectedCategoryName: string | undefined;
  adHocPrice: any;

  constructor(private router: Router, private service: SharedService, private toastr: ToastrService) { }

  ngOnInit() {
    //this.userPlan = localStorage.getItem('findPlan');
    this.service.getApi('coach/categories').subscribe(response => {
      if (response.success) {
        this.categories = response.data;
        if (this.categories.length > 0) {
          this.categoryId = this.categories[0].id;
          this.selectedCategoryName = this.categories[0].name;
        }
      }
      this.avatar_url_fb = localStorage.getItem('avatar_url_fb');
    });


    // this.getPackage();

    // const currentRoute = this.router.url
    // if (currentRoute == '/user/main/community' || currentRoute == '/user/main/teams') {
    //   this.hideField = true;
    // }
  }

  selectedCategoryId: number | null = null;

  selectCategory(cat?: any): void {
    this.selectedCategoryId = cat.id || null; // Set `selectedCategoryId` or null if `id` is undefined
    const url = cat.id ? `/user/main/add-post/${cat.name}/${cat.id}` : '/user/main/add-post';
    console.log('Navigating to:', url);
    this.router.navigateByUrl(url);
  }
  



}
