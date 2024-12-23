import { Component } from '@angular/core';
import { SharedService } from '../../services/shared.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-post',
  templateUrl: './add-post.component.html',
  styleUrl: './add-post.component.css'
})
export class AddPostComponent {

  isActive: boolean = false

  toggle(type: string) {
    let audioBtn = document.getElementById('ct_audio_btn');
    let videoBtn = document.getElementById('ct_video_btn');
    let imageBtn = document.getElementById('ct_image_btn');
    let audio = document.getElementById('ct_audio');
    let video = document.getElementById('ct_video');
    let image = document.getElementById('ct_image1');
    let thumbNailImg = document.getElementById('ct_image');

    if (type === 'Podcast') {
      this.videoFile = null;
      this.imageFile = null;
    }

    if (type === 'Video') {
      if (video?.classList.contains('d-block')) {
        // If video is already showing, hide it
        video.classList.remove('d-block');
        videoBtn?.classList.remove('ct_uploaded_btn_active');
      } else {
        // Show video and hide audio
        videoBtn?.classList.add('ct_uploaded_btn_active');
        audioBtn?.classList.remove('ct_uploaded_btn_active');
        imageBtn?.classList.remove('ct_uploaded_btn_active');
        audio?.classList.remove('d-block');
        image?.classList.add('d-none');
        video?.classList.add('d-block');
        thumbNailImg?.classList.remove('d-block');
      }
    } else if (type === 'Podcast') {
      if (audio?.classList.contains('d-block')) {
        // If audio is already showing, hide it
        audio.classList.remove('d-block');
        audioBtn?.classList.remove('ct_uploaded_btn_active');
        thumbNailImg?.classList.remove('d-block');
      } else {
        // Show audio and hide video
        videoBtn?.classList.remove('ct_uploaded_btn_active');
        imageBtn?.classList.remove('ct_uploaded_btn_active');
        audioBtn?.classList.add('ct_uploaded_btn_active');
        audio?.classList.add('d-block');
        thumbNailImg?.classList.add('d-block');
        video?.classList.remove('d-block');
        image?.classList.add('d-none');
      }
    } else if (type === 'Image') {
      if (image?.classList.contains('d-block')) {
        // If image is already showing, hide it
        image.classList.add('d-block');
        imageBtn?.classList.remove('ct_uploaded_btn_active');
      } else {
        // Show image and hide audio and video
        image?.classList.remove('d-none');
        imageBtn?.classList.add('ct_uploaded_btn_active');
        audioBtn?.classList.remove('ct_uploaded_btn_active');
        videoBtn?.classList.remove('ct_uploaded_btn_active');
        audio?.classList.remove('d-block');
        video?.classList.remove('d-block');
        thumbNailImg?.classList.remove('d-block');
      }
    }
  }


  avatar_url_fb: any;
  categories: any[] = [];
  communityId: any;
  teamId: any;
  userPlan: any;
  plan_expired_at: any;
  canceled_at: any;

  hideField: boolean = false;

  constructor(private router: Router, private service: SharedService, private toastr: ToastrService) { }

  ngOnInit() {
    this.userPlan = localStorage.getItem('findPlan');
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


    this.getPackage();

    const currentRoute = this.router.url
    if (currentRoute == '/user/main/community' || currentRoute == '/user/main/teams') {
      this.hideField = true;
    }
  }

  getPackage() {
    this.service.getApi('coach/myActivePlan').subscribe({
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

  categoryId: any = '1';
  postType: any = '0';
  selectedCategoryName: string | undefined;
  adHocPrice: any;

  onCategoryChange(event: any): void {
    const selectedId = event.target.value;
    const selectedCategory = this.categories.find(category => category.id == selectedId);

    //const selectedCategory = this.categories.find(category => category.id === event.value);

    if (selectedCategory) {
      this.categoryId = selectedCategory.id;
      this.selectedCategoryName = selectedCategory.name;
      console.log('Selected Category ID:', this.categoryId);
      console.log('Selected Category Name:', this.selectedCategoryName);
    }
  }


  dropdownOpen: boolean = false;
  searchTerm: string = '';

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  closeDropdown(): void {
    this.dropdownOpen = false;
  }

  selectCategory(category: any): void {
    this.categoryId = category.id;
    this.selectedCategoryName = category.name;
    this.dropdownOpen = false;

    console.log('Selected Category ID:', this.categoryId);
    console.log('Selected Category Name:', this.selectedCategoryName);
  }

  filteredCategories() {
    if (!this.searchTerm) {
      return this.categories;
    }
    return this.categories.filter(category =>
      category.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  postText: any;
  audioFile: File | null = null;
  videoFile: File | null = null;

  readonly MAX_FILE_SIZE_MB = 500;
  videoPreviewUrl: string | null = null;

  // onAudioFileChange(event: Event) {
  //   const input = event.target as HTMLInputElement;
  //   if (input.files && input.files?.length > 0) {
  //     const file = input.files[0];
  //     if (this.isFileSizeValid(file)) {
  //       this.audioFile = file;
  //       this.checkAudioDuration(file);
  //     } else {
  //       this.toastr.warning('Audio file exceeds the maximum size of 500 MB.');
  //       input.value = ''; // Clear the input
  //     }
  //   }
  // }

  onAudioFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (this.isFileSizeValid(file)) {
        this.audioFile = file;
        this.checkAudioDuration(file);
      } else {
        this.toastr.warning('Audio file exceeds the maximum size of 500 MB.');
      }
      input.value = ''; // Reset the input value to allow re-uploading the same file
    }
  }



  onVideoFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files?.length > 0) {
      const file = input.files[0];
      if (this.isFileSizeValid(file)) {
        this.videoFile = file;
        this.createVideoPreview(file);
        this.checkVideoDuration(file);
      } else {
        this.toastr.warning('Video file exceeds the maximum size of 500 MB.');
      }
      input.value = ''; // Clear the input
    }
  }



  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files[0]) {
      this.imageFile = input.files[0];

      // Generate a preview URL for the selected image
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreviewUrl = reader.result as string;
      };
      reader.readAsDataURL(this.imageFile);
    }
  }

  private MAX_DURATION_SECONDS = 120; // 2 minutes in seconds

  checkAudioDuration(file: File): void {
    const audio = new Audio(URL.createObjectURL(file));
    audio.onloadedmetadata = () => {
      if (audio.duration > this.MAX_DURATION_SECONDS && this.userPlan != 'Premium') {
        this.toastr.warning('Please upgrade your plan to upload a audio more than 2 minutes.');
        this.audioFile = null; // Clear the file
      }
    };
  }

  checkVideoDuration(file: File): void {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      if (video.duration > this.MAX_DURATION_SECONDS && this.userPlan != 'Premium') {
        this.toastr.warning('Please upgrade your plan to upload a video more than 2 minutes.');
        this.videoFile = null; // Clear the file
      }
    };
    video.src = URL.createObjectURL(file);
  }

  createVideoPreview(file: File) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.videoPreviewUrl = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  getMaxLength(): number | null {
    if (this.userPlan !== 'Premium') {
      this.toastr.warning('User is not premium, max length is set to 100.');
      return 100;  // Limit to 100 characters for non-premium users
    } else {
      return null;  // No limit for Premium users
    }
  }


  wordCount(text: string): number {
    return text ? text.trim().split(/\s+/).length : 0;
  }

  priceError: string | null = null;

  validateAdHocPrice() {
    const maxPrice = 99999;
    const minPrice = 1;

    if (this.adHocPrice < minPrice) {
      this.priceError = 'Price cannot be negative or zero.';
    } else if (this.adHocPrice > maxPrice) {
      this.priceError = 'Price cannot exceed 5 digits.';
    } else {
      this.priceError = null;
    }
  }

  btnLoader: boolean = false;

  uploadFiles() {
    // if(this.categoryId == undefined){
    //   this.toastr.warning('Please select a category.');
    //   return
    // }
    //console.log('========>', this.selectedCategoryName);
// debugger
    if (this.postType == 1 && (this.adHocPrice === null || this.adHocPrice === undefined)) {
      this.priceError = 'Price is required.';
      return
    }
    if (this.userPlan != 'Premium' && this.wordCount(this.postText) > 100) {
      this.toastr.error('You can only submit up to 100 words.');
      return; // Stop submission
    }

    this.communityId = localStorage.getItem('communityId');
    this.teamId = localStorage.getItem('teamId');
    const trimmedMessage = this.postText ? this.postText?.trim() : '';

    if (!this.audioFile && !this.videoFile && !this.imageFile && trimmedMessage == '') {
      return;
    }

    const formData = new FormData();
    if (this.audioFile) {
      formData.append('media', this.audioFile);
      formData.append('type', 'PODCAST');
      if (this.postText) {
        formData.append('text', trimmedMessage);
      }
      if (this.UploadedFile) {
        formData.append('thumbnail', this.UploadedFile);
      }
    }
    if (this.videoFile) {
      formData.append('media', this.videoFile);
      formData.append('type', 'VIDEO');
      if (this.postText) {
        formData.append('text', trimmedMessage);
      }
    }

    if (this.imageFile) {
      formData.append('media', this.imageFile);
      formData.append('type', 'IMAGE');
      if (this.postText) {
        formData.append('text', trimmedMessage);
      }
    }

    if (this.communityId) {
      formData.append('communityId', this.communityId);
    }
    if (this.teamId) {
      formData.append('teamId', this.teamId);
    }

    if (this.postText && !this.audioFile && !this.videoFile) {
      formData.append('text', trimmedMessage);
      formData.append('type', 'ARTICLE');
      // if (trimmedMessage === '') {
      //   return;
      // }
    }

    if (this.userPlan == 'Premium') {
      formData.append('isPaid', this.postType);
    } else {
      formData.append('isPaid', '0');
    }

    if (this.postType == 1) {
      formData.append('adhocPrice', this.adHocPrice);
    }

    formData.append('categoryId', this.categoryId);
    let audio = document.getElementById('ct_audio')
    let video = document.getElementById('ct_video')
    let thumbNailImg = document.getElementById('ct_image')
    this.btnLoader = true;
    this.service.postAPIFormData('coach/post', formData).subscribe({
      next: (response) => {
        if(response.success == true){
          this.audioFile = null;
          this.videoFile = null;
          this.videoPreviewUrl = null;
          this.postText = '';
          this.adHocPrice = '';
          this.postType = 0;
          this.selectedCategoryName = ''
          this.toastr.success(response.message);
          console.log('Upload successful', response);
          audio?.classList.remove('d-block');
          video?.classList.remove('d-block');
          thumbNailImg?.classList.remove('d-block');
          this.btnLoader = false;
          this.service.triggerRefresh();
          //window.location.reload();
        } else{
          this.btnLoader = false;
          this.toastr.warning(response.message);
        }
      },
      error: (error) => {
        this.btnLoader = false;
        this.toastr.error('Error uploading files!');
        console.error('Upload error', error);
      }
    });
  }

  private isFileSizeValid(file: File): boolean {
    const maxSizeBytes = this.MAX_FILE_SIZE_MB * 1024 * 1024; // Convert MB to bytes
    return file.size <= maxSizeBytes;
  }

  UploadedFile!: File;
  croppedImage: any | ArrayBuffer | null = null;

  imageFile!: File | any;
  imagePreviewUrl: any | ArrayBuffer | null = null;

  handleCommittedFileInput(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.files && inputElement.files.length > 0) {
      this.UploadedFile = inputElement.files[0];
      this.previewImage(this.UploadedFile);
    }
  }

  previewImage(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      this.croppedImage = e.target?.result;
    };
    reader.readAsDataURL(file);
  }

  // handleCommittedFileInputImg(event: Event) {
  //   const inputElement = event.target as HTMLInputElement;
  //   if (inputElement.files && inputElement.files.length > 0) {
  //     this.imageFile = inputElement.files[0];
  //     this.previewImage(this.imageFile);
  //   }
  // }

  // previewImageImg(file: File): void {
  //   const reader = new FileReader();
  //   reader.onload = (e: ProgressEvent<FileReader>) => {
  //     this.imagePreviewUrl = e.target?.result;
  //   };
  //   reader.readAsDataURL(file);
  // }


}
