import { Component, ElementRef, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { SharedService } from '../../services/shared.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { Location } from '@angular/common';
import { WaveService } from 'angular-wavesurfer-service';
import WaveSurfer from 'wavesurfer.js';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html',
  styleUrl: './my-profile.component.css'
})
export class MyProfileComponent {

  isCoach: boolean = true;
  role: any;

  constructor(private route: ActivatedRoute, private service: SharedService, private location: Location, public waveService: WaveService, private snackBar: MatSnackBar, private toster: ToastrService) {
    this.role = this.service.getRole();
    if (this.role == "USER") {
      this.isCoach = false;
    }
  }

  backClicked() {
    this.location.back();
  }

  profileForm!: FormGroup;
  userDet: any;
  userEmail: any;
  name: any;
  cover_photo_url: any;
  avatar_url: any
  category: any;
  accomplishments: any;
  certificates: any;

  userId: any;
  userRole: any;
  loginuserId: any;
  routerole: any;

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.userId = params.get('id');
      this.routerole = params.get('role');
    });

    if (this.userId) {
      this.getUserProfile(this.userId);
    } else {
      this.loadUserProfile();
    }

    this.getProfileData();
    this.loginuserId = localStorage.getItem('fbId');
    this.service.triggerRefresh();
  }

  onToggleMenu() {
    this.service.toggleMenuVisibility();
  }

  //if coach see coach profile
  isCoachPosts: boolean = false;
  getCoachProfile(userId: any) {
    const url = `coach/getCoachProfile/${userId}`;
    this.service.getApi(url).subscribe({
      next: resp => {

        this.userRole = resp.data.role;
        this.userEmail = resp.data.about_me;
        this.name = resp.data.full_name;
        this.avatar_url = resp.data.avatar_url;
        this.cover_photo_url = resp.data.cover_photo_url;
        this.education = resp.data.education;
        this.category = resp.data.category?.name;

        this.accomplishments = resp.data.accomplishments?.split(',').map((accomplishments: string) => accomplishments.trim());
        this.certificates = resp.data.certificates?.split(',').map((certificate: string) => certificate.trim());
        this.education = resp.data.education;

        this.selectedCategoryNames = resp.data.CoachCategory?.map((item: { category: { name: any; }; }) => item.category.name);

        // if(resp.data?.Post?.length > 0){
        //   this.isCoachPosts = true;
        // }
      },
      error: error => {
        console.log(error.message);
      }
    });
  }

  url: any;
  getUserProfile(userId: any) {
    if (this.routerole == 'COACH') {
      this.url = this.isCoach ? `coach/getCoachProfile/${userId}` : `user/getCoachProfile/${userId}`;
    } else {
      this.url = this.isCoach ? `coach/userProfile/${userId}` : `user/getCoachProfile/${userId}`;
    }
    //const url = this.isCoach ? `coach/userProfile/${userId}` : `user/getCoachProfile/${userId}`;
    this.service.getApi(this.url).subscribe({
      next: resp => {

        this.userRole = resp.data.role;
        this.userEmail = resp.data.about_me;
        this.name = resp.data.full_name;
        this.avatar_url = resp.data.avatar_url;
        this.cover_photo_url = resp.data.cover_photo_url;
        this.education = resp.data.education;
        this.category = resp.data.category?.name;
        this.experience = resp.data.experience;

        this.accomplishments = resp.data.accomplishments?.split(',').map((accomplishments: string) => accomplishments.trim());
        this.certificates = resp.data.certificates?.split(',').map((certificate: string) => certificate.trim());
        this.education = resp.data.education;

        this.selectedCategoryNames = resp.data.CoachCategory?.map((item: { category: { name: any; }; }) => item.category.name);

        if (!this.isCoach) {
          this.getSingleCoachPosts(userId);
        }
      },
      error: error => {
        this.getCoachProfile(this.userId);
        console.log(error.message);
      }
    });
  }

  selectedCategoryNames: string[] = [];
  education: any;
  experience: any;

  loadUserProfile() {
    this.service.getApi(this.isCoach ? 'coach/myProfile' : 'user/myProfile').subscribe({
      next: (resp) => {
        if (this.isCoach) {
          this.userEmail = resp.data.about_me;
          this.name = resp.data.full_name;
          this.avatar_url = resp.data.avatar_url;
          this.cover_photo_url = resp.data.cover_photo_url;
          this.category = resp.data.category.name;
          this.accomplishments = resp.data.accomplishments?.split(',').map((accomplishments: string) => accomplishments.trim());
          this.certificates = resp.data.certificates?.split(',').map((certificate: string) => certificate.trim());
          this.education = resp.data.education;
          this.experience = resp.data.experience;
          this.selectedCategoryNames = resp.data.CoachCategory?.map((item: { category: { name: any; }; }) => item.category.name);
          //debugger

          //this.postData = resp.data?.Post?.map((item: any) => ({ ...item, isExpanded: false, isPlaying: false })).reverse();

        } else {
          this.userEmail = resp.user.about_me;
          this.name = resp.user.full_name;
          this.avatar_url = resp.user.avatar_url;
          this.cover_photo_url = resp.user.cover_photo_url;
          this.education = resp.user.education;
        }

      },
      error: (error) => {
        console.log(error.message);
      }
    });
  }


  postData: any;
  shortTextLength: number = 270;

  wave: WaveSurfer[] = [];
  currentTimeA: number[] = [];
  totalDurationA: number[] = [];

  tracks: number[] = Array(50).fill(0); // Array of track heights
  trackHeights: number[] = Array(50).fill(20); // Initial heights of tracks
  highlightedBars: number = 0; // Number of highlighted bars
  isPlayingA: boolean[] = [];

  getSingleCoachPosts(coachId: any) {
    this.service.getApi(`user/allPosts/coach/${coachId}`).subscribe({
      next: resp => {
        this.postData = resp.data?.map((item: any) => ({ ...item, isExpanded: false, isPlaying: false }));

        setTimeout(() => {
          this.postData?.forEach((item: any, index: any) => {
            if (item.type == 'PODCAST') {
              const waveformId = '#waveform' + item.id;
              const waveInstance: any = this.waveService.create({
                container: waveformId,
                waveColor: '#fff',
                progressColor: '#e58934',
                // cursorColor: '#ff5722',
                responsive: true,
                height: 50,
                barWidth: 3,
                barGap: 6
              });
              this.wave[index] = waveInstance;
              waveInstance.load(item?.mediaUrl);
              this.isPlayingA[index] = false;

              waveInstance.on('ready', () => {
                this.totalDurationA[index] = waveInstance.getDuration();
              });

              waveInstance.on('audioprocess', () => {
                this.currentTimeA[index] = waveInstance.getCurrentTime();
              });

              waveInstance.on('play', () => {
                this.isPlayingA[index] = true; // Mark as playing
                this.stopOtherAudios(index);   // Pause other audios
              });

              waveInstance.on('pause', () => {
                this.isPlayingA[index] = false; // Mark as paused
              });

            }


          });
        }, 200);
      },
      error: error => {
        console.log(error.message)
      }
    });
  }

  stopOtherAudios(currentIndex: number) {
    this.wave.forEach((waveInstance, index) => {
      if (index !== currentIndex) {
        waveInstance.pause();
        this.isPlayingA[index] = false; // Reset play state for other audios
      }
    });
  }

  togglePlayPause(index: number): void {
    const waveInstance = this.wave[index];
    if (waveInstance) {
      waveInstance.playPause(); // Toggle between play and pause
    } else {
      console.error('Waveform instance not found for index:', index);
    }
  }

  getProfileData() {
    this.service.getApi(this.isCoach ? 'coach/post' : 'user/allPosts').subscribe({
      next: resp => {
        if (this.isCoach) {
          this.postData = resp.data?.map((item: any) => ({ ...item, isExpanded: false, isPlaying: false })).reverse();

          setTimeout(() => {
            this.postData?.forEach((item: any, index: any) => {
              if (item.type == 'PODCAST') {
                const waveformId = '#waveform' + item.id;
                const waveInstance: any = this.waveService.create({
                  container: waveformId,
                  waveColor: '#fff',
                  progressColor: '#e58934',
                  // cursorColor: '#ff5722',
                  responsive: true,
                  height: 50,
                  barWidth: 3,
                  barGap: 6
                });
                //this.wave.push(waveInstance); // Store the instance for later use
                this.wave[index] = waveInstance;
                waveInstance.load(item?.mediaUrl);
                this.isPlayingA[index] = false;

                waveInstance.on('ready', () => {
                  this.totalDurationA[index] = waveInstance.getDuration();
                });

                waveInstance.on('audioprocess', () => {
                  this.currentTimeA[index] = waveInstance.getCurrentTime();
                });

                waveInstance.on('play', () => {
                  this.isPlayingA[index] = true; // Mark as playing
                  this.stopOtherAudios(index);   // Pause other audios
                });

                waveInstance.on('pause', () => {
                  this.isPlayingA[index] = false; // Mark as paused
                });
              }
            });
          }, 200);
        }
      },
      error: error => {
        console.log(error.message)
      }
    });
  }

  postComments: any[] = [];
  showCmt: { [key: string]: boolean } = {};
  currentOpenCommentBoxId: number | null = null;

  commentsToShow: { [key: number]: number } = {}; // Track number of comments to show
  readonly defaultCommentsCount = 3;

  // getPostComments(postId: any) {
  //   this.service.getApi(this.isCoach ? `coach/comment/${postId}` : `user/post/comment/${postId}`).subscribe({
  //     next: resp => {
  //       this.postComments = resp.data?.map((item: any) => ({ ...item, isExpanded: false }));
  //       //this.postComments = [...tempData, ...this.postComments]
  //       //console.log('========>', this.postComments)
  //       this.commentsToShow[postId] = this.defaultCommentsCount;
  //     },
  //     error: error => {
  //       console.log(error.message)
  //     }
  //   });
  // }

  //after loadmore comment fix
  getPostComments(postId: any) {
    this.service.getApi(this.isCoach ? `coach/comment/${postId}` : `user/post/comment/${postId}`).subscribe({
      next: resp => {
        // Preserving the state of isExpanded and commentsToShow
        const expandedComments = this.postComments.filter(comment => comment.isExpanded);
        this.postComments = resp.data?.map((item: any) => ({
          ...item,
          isExpanded: expandedComments.some(exp => exp.id === item.id) // Keep the expanded state
        }));

        // Preserve the current count of comments to show
        if (!this.commentsToShow[postId]) {
          this.commentsToShow[postId] = this.defaultCommentsCount;
        }
      },
      error: error => {
        console.log(error.message);
      }
    });
  }


  @ViewChild('audioPlayer') audioPlayer!: ElementRef<HTMLAudioElement>;
  isPlaying: boolean = false;

  togglePlayback() {
    const player = this.audioPlayer.nativeElement;
    if (this.isPlaying) {
      player.pause();
    } else {
      player.play();
    }
    this.isPlaying = !this.isPlaying;
  }

  toggleCommentBox(id: number): void {
    if (this.currentOpenCommentBoxId === id) {
      // Toggle off if the same box is clicked again
      this.commentText = '';
      this.showCmt[id] = !this.showCmt[id];
      if (!this.showCmt[id]) {

        //after loadmore comment fix
        this.commentsToShow[id] = this.defaultCommentsCount;

        this.currentOpenCommentBoxId = null;
      }
    } else {
      // Close any previously open box and open the new one
      this.showCmt[this.currentOpenCommentBoxId || -1] = false;
      this.currentOpenCommentBoxId = id;
      this.showCmt[id] = true;
      this.getPostComments(id);
      this.commentText = '';
    }
  }

  likeComment(cmtId: any) {
    cmtId.alreadyLiked = !cmtId.alreadyLiked;
    this.service.postAPI(this.isCoach ? `coach/comment/react/${cmtId.id}` : `user/post/comment/react/${cmtId.id}`, null).subscribe({
      next: resp => {
        // console.log(resp);
        // this.getPostComments(postId);
      },
      error: error => {
        console.log(error.message)
      }
    });
  }
  //after loadmore comment fix
  // likeComment(cmtId: any, postId: any) {
  //   this.service.postAPI(this.isCoach ? `coach/comment/react/${cmtId}` : `user/post/comment/react/${cmtId}`, null).subscribe({
  //     next: resp => {
  //       console.log(resp);
  //       // Refresh comments but preserve the state of comments to show
  //       const currentCount = this.commentsToShow[postId] || this.defaultCommentsCount;
  //       this.getPostComments(postId);
  //       this.commentsToShow[postId] = currentCount; // Ensure we keep the same number of comments loaded
  //     },
  //     error: error => {
  //       console.log(error.message);
  //     }
  //   });
  // }

  btnLoaderCmt: boolean = false;
  deleteId: any;

  deleteComment(cmtId: any, feed: any) {
    this.deleteId = cmtId;
    if (feed.numberOfComments >= 0) {
      feed.numberOfComments--;
    }
    this.btnLoaderCmt = true;
    this.service.deleteAcc(this.isCoach ? `coach/comment/${cmtId}` : `user/post/comment/${cmtId}`).subscribe({
      next: resp => {
        console.log(resp);
        this.getPostComments(feed.id);
        this.btnLoaderCmt = false;
        //this.getProfileData();
        if (!this.isCoach) {
          this.getSingleCoachPosts(this.userId);
        }
      },
      error: error => {
        console.log(error.message);
        this.btnLoaderCmt = false;
      }
    });
  }

  //isLike = false;

  likePost(postId: any) {
    //this.isLike = !this.isLike;
    this.service.postAPI(this.isCoach ? `coach/post/react/${postId}` : `user/post/react/${postId}`, null).subscribe({
      next: resp => {
        console.log(resp);
        //this.getProfileData();
        if (!this.isCoach) {
          this.getSingleCoachPosts(this.userId);
        }
      },
      error: error => {
        console.log(error.message)
      }
    });
  }

  toggleLike(feed: any) {
    // Immediately toggle the like state locally
    feed.alreadyLiked = !feed.alreadyLiked;
    // Update the like count immediately
    if (feed.alreadyLiked) {
      feed.numberOfLikes++;
    } else {
      feed.numberOfLikes--;
    }

    // Call the API to register the like or unlike, but don't wait for the response to update the UI
    this.service.postAPI(this.isCoach ? `coach/post/react/${feed.id}` : `user/post/react/${feed.id}`, null)
      .subscribe({
        next: (resp) => {
          //console.log(resp);
        },
        error: (error) => {
          //console.log(error.message);
          // If the API call fails, revert the like state and like count
          feed.alreadyLiked = !feed.alreadyLiked;
          feed.numberOfLikes = feed.alreadyLiked ? feed.numberOfLikes + 1 : feed.numberOfLikes - 1;
        }
      });
  }

  bookmarkPost(feed: any) {

    feed.alreadySaved = !feed.alreadySaved;

    // Show a message based on the new state
    const message = feed.alreadySaved ? 'Post Saved Successfully' : 'Post Unsaved';

    // Show immediate feedback to the user using MatSnackBar
    this.snackBar.open(message, '', {
      duration: 9000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['snackbar-success']  // Optional custom styling class
    });

    this.service.postAPI(`user/post/saveOrUnsave/${feed.id}`, null).subscribe({
      next: resp => {
        console.log(resp);
        //this.getProfileData();
      },
      error: error => {
        feed.alreadySaved = !feed.alreadySaved;
        //feed.numberOfLikes = feed.alreadySaved ? feed.numberOfLikes + 1 : feed.numberOfLikes - 1;
      }
    });
  }

  commentText: any;
  btnLoader: boolean = false;

  addComment(feed: any) {
    if (this.btnLoader) {
      return; // Prevent multiple submissions
    }
    const trimmedMessage = this.commentText?.trim();
    if (trimmedMessage === '') {
      return;
    }
    if (feed.numberOfComments >= 0) {
      feed.numberOfComments++;
    } else {
      //feed.numberOfComments--;
    }
    const formData = new URLSearchParams();
    formData.set('postId', feed.id);
    formData.set('content', this.commentText);
    this.btnLoader = true;
    this.service.postAPI(this.isCoach ? `coach/comment` : `user/post/comment`, formData.toString()).subscribe({
      next: (response) => {
        console.log(response)
        this.commentText = '';
        this.getPostComments(feed.id);
        this.btnLoader = false;
        //this.getProfileData();
        if (!this.isCoach) {
          this.getSingleCoachPosts(this.userId);
        }
      },
      error: (error) => {
        //this.toastr.error('Error uploading files!');
        console.error('Upload error', error);
        this.btnLoader = false;
      }
    });
  }

  toggleCommentText(index: number): void {
    this.postComments[index].isExpanded = !this.postComments[index].isExpanded;
  }

  loadMoreComments(id: number): void {
    this.commentsToShow[id] += 2; // Load 2 more comments
  }

  toggleContent(index: number): void {
    this.postData[index].isExpanded = !this.postData[index].isExpanded;
  }

  shouldShowLoadMore(id: number): boolean {
    return this.postComments && this.postComments?.length > this.commentsToShow[id];
  }

  shouldShowReadMore(text: string): boolean {
    return text?.length > this.shortTextLength;
  }

  deletePost(id: any) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this post!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e58934',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.service.deleteAcc(`coach/post/${id}`).subscribe({
          next: (resp) => {
            if (resp.success) {
              Swal.fire(
                'Deleted!',
                'Your post has been deleted successfully.',
                'success'
              );
              this.getProfileData();
              if (!this.isCoach) {
                this.getSingleCoachPosts(this.userId);
              }
            } else {
              this.getProfileData();
              if (!this.isCoach) {
                this.getSingleCoachPosts(this.userId);
              }
            }
          },
          error: (error) => {
            Swal.fire(
              'Error!',
              'There was an error deleting your post.',
              'error'
            );
            this.getProfileData();
            if (!this.isCoach) {
              this.getSingleCoachPosts(this.userId);
            }
            //this.toastr.error('Error deleting account!');
            console.error('Error deleting account', error);
          }
        });
      }
    });
  }







  @ViewChildren('videoPlayer') videoPlayers!: QueryList<ElementRef>;

  currentVideoId: any | null = null;
  currentTime: number = 0;
  videoDuration: number = 0;

  toggleVideo(videoElement: HTMLVideoElement) {

    // if (this.currentAudio) {
    //   this.currentAudio.pause();
    // }

    if (this.currentVideoId && this.currentVideoId !== videoElement) {
      this.currentVideoId.pause(); // Pause the currently playing video
    }

    if (videoElement.paused) {
      videoElement.play();
      this.currentVideoId = videoElement;
    } else {
      videoElement.pause();
      this.currentVideoId = null;
    }
  }

  isVideoPlaying(videoElement: HTMLVideoElement): boolean {
    return videoElement === this.currentVideoId && !videoElement.paused;
  }

  onTimeUpdate(videoElement: HTMLVideoElement) {
    if (this.isVideoPlaying(videoElement)) {
      const seekBar: HTMLInputElement = document.querySelector('.custom-seekbar')!;
      seekBar.value = (videoElement.currentTime / videoElement.duration * 100).toString();
      this.currentTime = videoElement.currentTime;
      this.setVideoDuration(videoElement);
    }
  }

  setVideoDuration(videoElement: HTMLVideoElement) {
    if (this.isVideoPlaying(videoElement)) {
      const seekBar: HTMLInputElement = document.querySelector('.custom-seekbar')!;
      seekBar.max = "100";
      this.videoDuration = videoElement.duration;
    }
  }

  onSeek(event: Event, videoElement: HTMLVideoElement) {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    const time = (parseFloat(value) / 100) * videoElement.duration;
    videoElement.currentTime = time;
  }

  // formatTime(time: number): string {
  //   const minutes = Math.floor(time / 60);
  //   const seconds = Math.floor(time % 60);
  //   return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  // }

  formatTime(time: number): string {
    if (time) {
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    } else {
      return `00:00`;
    }

  }






  reportPostId: any;
  reportPost(postId: any) {
    this.reportPostId = postId;
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
    formData.set('postId', this.reportPostId);
    formData.set('reportEntity', 'POST');
    formData.set('reason', this.reportDesc);

    this.service.postAPI('user/report/content', formData).subscribe({
      next: (resp) => {
        if (resp.success === true) {
          this.closeModalR.nativeElement.click();
          //this.visibilityService.triggerRefresh();
          this.toster.success(resp.message);
        } else {
          this.toster.warning(resp.message);
        }
        this.btnLoaderReport = false;
      },
      error: (error) => {
        this.btnLoaderReport = false;
        if (error.error.message) {
          this.toster.error(error.error.message);
        } else {
          this.toster.error('Something went wrong!');
        }
        //console.log(error.statusText);
      }
    });
  }


  userPlan: any;
  plan_expired_at: any;
  canceled_at: any;

  getPackage() {
    this.service.getApi(this.isCoach ? 'coach/myActivePlan' : 'user/myActivePlan').subscribe({
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

  stripeLink: any;
  btnLoaderPay: boolean = false;
  payId: any;

  getAdHocPost(postId: any) {
    this.payId = postId;
    localStorage.setItem('adHocPostId', postId)
    const formURlData = new URLSearchParams();
    formURlData.set('postId', postId);
    this.btnLoaderPay = true;
    this.service.postAPI(`user/paymentThroughStripeForPost`, formURlData.toString()).subscribe(response => {
      this.stripeLink = response.url;
      window.location.href = this.stripeLink;
      console.log(this.stripeLink);
      this.btnLoaderPay = false;
    });
  }


}
