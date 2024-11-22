import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, HostListener } from '@angular/core';
import { SharedService } from '../../services/shared.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  videos: any[] = [];
  thumbnails: string[] = [];
  contactForm!: FormGroup;
  selectedFile: File | null = null;
  loading: boolean = false;

  constructor(private http: HttpClient, private service: SharedService, private toster: ToastrService) { }

  ngOnInit(): void {
    //this.getVideoData();
    this.initForm();
  }

  initForm() {
    this.contactForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      name: new FormControl('', Validators.required),
      description: new FormControl('', Validators.required),
    })
  }

  submit() {
    this.contactForm.markAllAsTouched();

    // Trim values and check if any are empty
    // const name = this.contactForm.value.name?.trim();
    // const description = this.contactForm.value.descripton?.trim();

    // if (name == '' && description=='') {
    //   this.toster.warning('Please fill out all fields without empty spaces.');
    //   return;
    // }
    if (this.contactForm.valid) {
      this.loading = true;
      const formURlData = new URLSearchParams();
      formURlData.set('email', this.contactForm.value.email);
      formURlData.set('name', this.contactForm.value.name);
      formURlData.set('description', this.contactForm.value.descripton);
      this.service.loginUser('admin/sendSupportEmail', formURlData.toString()).subscribe({
        next: (resp) => {
          if (resp.success == true) {
            this.loading = false;
            this.toster.success(resp.message);
          } else {
            this.toster.warning(resp.message);
            this.loading = false;
          }
        },
        error: (error) => {
          this.loading = false;
          if (error.error.message) {
            this.toster.error(error.error.message);
          } else {
            this.toster.error('Something went wrong!');
          }
          console.error('Login error:', error);
        }
      });
    }
  }

  // getVideoData(): void {
  //   this.http.get<any>('https://gist.githubusercontent.com/poudyalanil/ca84582cbeb4fc123a13290a586da925/raw/14a27bd0bcd0cd323b35ad79cf3b493dddf6216b/videos.json')
  //     .subscribe(data => {
  //       this.videos = data;
  //     this.videos.forEach((video, index) => {
  //       this.generateThumbnail(video.videoUrl, index);
  //     });
  //     });
  // }

  // generateThumbnail(videoUrl: string, index: number): void {
  //   const videoElement = document.createElement('video');
  //   videoElement.src = videoUrl;
  //   videoElement.crossOrigin = 'anonymous';

  //   videoElement.addEventListener('loadeddata', () => {
  //     const canvas = document.createElement('canvas');
  //     const context = canvas.getContext('2d')!;
  //     canvas.width = videoElement.videoWidth;
  //     canvas.height = videoElement.videoHeight;

  //     const randomTime = Math.random() * videoElement.duration;
  //     videoElement.currentTime = randomTime;

  //     videoElement.addEventListener('seeked', () => {
  //       context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
  //       this.thumbnails[index] = canvas.toDataURL();
  //     });
  //   });
  // }

  // onThumbnailClick(index: number, event: Event): void {
  //   const video = document.querySelectorAll('video')[index] as HTMLVideoElement;
  //   const thumbnail = event.target as HTMLImageElement;
  //   if (thumbnail) {
  //     thumbnail.style.display = 'none';
  //   }
  //   if (video) {
  //     video.play();
  //   }
  // }


  private readonly token: string = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjb2FjaElkIjo0LCJpYXQiOjE3MjEzODMxMDgsImV4cCI6MTczNTg5ODMwOH0.7KK7KkcCrdoJGZoiWK3k5mXtQpvpMQn-K18h3cgPVKQ';


  onFileChange(event: any) {
    if (event.target.files?.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }


  onSubmit() {
    if (!this.selectedFile) {
      console.log('Please select a video file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('text', 'kgkghkhgjh');
    formData.append('file', this.selectedFile);
    formData.append('type', 'VIDEO');


    this.service.postAPI('coach/post', formData)
      .subscribe(
        (res: any) => {
          if (res.success) {
            console.log('Video uploaded successfully.');
          } else {
            console.log('Video upload failed.');
          }
        },
        error => {
          console.log('An error occurred while uploading the video.');
          console.error(error);
        }
      );
  }

  // Store the active section
  activeSection: string = '';

  // Smooth scrolling to the section
  scrollTo(sectionId: string): void {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // Detect scroll position and update active section
  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    const sections = document.querySelectorAll('section');
    sections.forEach((section: Element) => {
      const rect = section.getBoundingClientRect();
      const sectionTop = rect.top + window.scrollY;
      const sectionHeight = section.clientHeight;

      if (window.scrollY >= sectionTop - sectionHeight / 3 &&
        window.scrollY < sectionTop + sectionHeight - sectionHeight / 3) {
        this.activeSection = section.getAttribute('id') || '';
      }
    });
  }

  // Check if a section is active
  isActive(sectionId: string): boolean {
    return this.activeSection === sectionId;
  }


}
