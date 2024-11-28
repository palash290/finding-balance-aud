import { Component } from '@angular/core';
import { SharedService } from '../../../services/shared.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-feed-filter',
  templateUrl: './feed-filter.component.html',
  styleUrl: './feed-filter.component.css'
})
export class FeedFilterComponent {

  avatar_url_fb: any;
  categories: any[] = [];
  categoryId: any = '7';
  postType: any = '0';
  selectedCategoryName: string | undefined;
  adHocPrice: any;

  constructor(private router: Router, private service: SharedService, private toastr: ToastrService) { }

  ngOnInit() {
    //debugger
    this.selectedTypeId = localStorage.getItem('selectedTypeId');
    //this.userPlan = localStorage.getItem('findPlan');
    this.service.getApi('coach/categories').subscribe(response => {
      if (response.success) {
        //debugger
        // this.categories = response.data;
        this.categories = [
          { id: '', name: 'All' }, // "All" category
          ...response.data,
        ];
    
        this.selectedCategoryId = Number(localStorage.getItem('selectedCategoryId')) ? Number(localStorage.getItem('selectedCategoryId')) : '';
        // if (this.categories.length > 0) {
        //   this.categoryId = this.categories[0].id;
        //   this.selectedCategoryName = this.categories[0].name;
        // }

      }

      this.avatar_url_fb = localStorage.getItem('avatar_url_fb');
    });
  }

  selectedCategoryId: any | null = ''; // Default: no category selected

  selectCategory(category: { id: number; name: string }): void {
    this.selectedCategoryId = category.id;
    console.log('Selected Category:', category);
  }

  types: any = [
    { id: '', name: 'All' },
    { id: 'VIDEO', name: 'Video' },
    { id: 'PODCAST', name: 'Audio' },
    { id: 'ARTICLE', name: 'Article' },
    { id: 'IMAGE', name: 'Image' }
  ];

  selectedTypeId: any = ''; // Default selection (All)

  selectType(id: number): void {
    this.selectedTypeId = id;
    console.log('Selected Type ID:', this.selectedTypeId);
  }

  applyFilter() {
    localStorage.setItem('selectedTypeId', this.selectedTypeId);
    localStorage.setItem('selectedCategoryId', this.selectedCategoryId);
    //console.log('Navigating to:', url);
    this.router.navigateByUrl(`/user/main/feeds/${this.selectedTypeId}/${this.selectedCategoryId}`);
  }


}
