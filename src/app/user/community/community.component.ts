import { Component, ElementRef, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SharedService } from '../../services/shared.service';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { MatSnackBar } from '@angular/material/snack-bar';
import { WaveService } from 'angular-wavesurfer-service';
import WaveSurfer from 'wavesurfer.js';

@Component({
  selector: 'app-community',
  templateUrl: './community.component.html',
  styleUrl: './community.component.css'
})
export class CommunityComponent {

  @ViewChild('closeModal') closeModal!: ElementRef;
  @ViewChild('closeModal1') closeModal1!: ElementRef;
  @ViewChild('closeModal2') closeModal2!: ElementRef;
  newForm!: FormGroup;
  updateForm!: FormGroup
  role: any;
  isCoach: boolean = true;
  communityData: any;
  loading: boolean = false;
  UploadedFile!: File;
  UploadedEditFile!: File;
  updateDet: any;
  updateId: any;
  searchQueryFilter = '';

  wave: WaveSurfer[] = [];
  currentTimeA: number[] = [];
  totalDurationA: number[] = [];

  tracks: number[] = Array(50).fill(0); // Array of track heights
  trackHeights: number[] = Array(50).fill(20); // Initial heights of tracks
  highlightedBars: number = 0; // Number of highlighted bars
  isPlayingA: boolean[] = [];

  constructor(private route: Router, private service: SharedService, private toastr: ToastrService, private snackBar: MatSnackBar, public waveService: WaveService) { }

  onToggleMenu() {
    this.service.toggleMenuVisibility();
  }

  toSee: boolean = true
  seeGroupMembesr() {
    this.toSee = !this.toSee
  }

  userId: any;

  ngOnInit(): void {
    this.role = this.service.getRole();
    if (this.role == 'USER') {
      this.isCoach = false;
    }
    this.initForm();
    this.initUpdateForm();
    this.userId = localStorage.getItem('fbId');
    this.service.refreshSidebar$.subscribe(() => {
      this.getCommunityPosts();
      this.getCommunityData();
    });
    this.service.triggerRefresh();
  }

  initForm() {
    this.newForm = new FormGroup({
      title: new FormControl('', Validators.required),
      about: new FormControl(''),
      image: new FormControl(null)
    })
  }

  initUpdateForm() {
    this.updateForm = new FormGroup({
      title: new FormControl('', Validators.required),
      about: new FormControl(''),
      image: new FormControl(null)
    })
  }


  eventImage: any;
  communityId: any;

  communityName: any;
  communityDesc: any;
  communityImg: any;
  numberOfParticipant: any;
  numberOfPosts: any;
  isParticipant: boolean = false;
  isAdmin: boolean = false;
  communityParticipants: any;
  communityAdminName: any;
  communityAdminImg: any;
  communityAdminid: any;
  communityAdminRole: any;
  selectedCommunityId: number | null = null;

  getCommunityData() {
    this.service.getApi(this.isCoach ? 'coach/communtiy' : 'user/communtiy').subscribe({
      next: resp => {
        this.communityData = resp.data;
        //console.log('this.communityData==>',this.communityData);
      },
      error: error => {
        console.log(error.message)
      }
    });
  }

  getCommunityProfileData(cId: any, participantCheck: boolean, isAdmin: boolean) {

    if (participantCheck || isAdmin) {
      this.isAdmin = isAdmin

      this.communityId = cId;
      this.selectedCommunityId = cId;

      localStorage.setItem('communityId', this.communityId)
      this.service.getApi(this.isCoach ? `coach/communtiy/${cId}` : `user/communtiy/${cId}`).subscribe({
        next: resp => {
          if (this.isCoach) {
            this.updateForm.patchValue({
              title: resp.data.title,
              about: resp.data.description,
            });
          }

          this.eventImage = resp.data.mediaUrl;
          this.communityName = resp.data.title;
          //this.communityDesc = resp.data.description;
          this.numberOfParticipant = resp.data.numberOfParticipant;
          this.numberOfPosts = resp.data.numberOfPosts;
          this.isParticipant = resp.data.isParticipant;
          //this.isAdmin = resp.data.isAdmin;
          this.communityImg = resp.data.mediaUrl;
          //debugger
          this.communityParticipants = resp.data.Participant;

          this.communityAdminid = resp.data.admin.id;
          this.communityAdminName = resp.data.admin.full_name;
          this.communityAdminImg = resp.data.admin.avatar_url;
          this.communityAdminRole = resp.data.admin.role;

          // this.communityParticipants = resp.data.Participant.filter(
          //   (participant: any) => participant.id !== this.communityAdminid
          // );

          this.getCommunityPosts();

        },
        error: error => {
          console.log(error.message)
        }
      });
    } else {
      this.toastr.warning('Please join community first.')
    }
  }



  btnLoader: boolean = false;
  followId1: any;

  joinCommunity() {
    this.followId1 = this.viewId;
    const formURlData = new URLSearchParams();
    formURlData.set('communityId', this.viewId);
    this.btnLoader = true;
    this.service.postAPI(this.isCoach ? 'coach/communtiy/join' : 'user/communtiy/join', formURlData.toString()).subscribe({
      next: (response) => {
        this.btnLoader = false;
        this.closeModal2.nativeElement.click();
        this.getCommunityProfileData(this.viewId, true, false);
        this.getCommunityData();
      },
      error: (error) => {
        this.btnLoader = false;
        console.error('Upload error', error);
      }
    });
  }

  btnLoader1: boolean = false;
  followId: any;


  leaveCommunity(communityId: any) {
    this.followId = communityId;
    const formURlData = new URLSearchParams();
    formURlData.set('communityId', communityId);
    this.btnLoader1 = true;
    this.service.postAPI(this.isCoach ? 'coach/communtiy/leave' : 'user/communtiy/leave', formURlData.toString()).subscribe({
      next: (response) => {
        this.btnLoader1 = false;
        //this.getCommunityProfileData(this.communityId, false);
        this.getCommunityData();
        this.communityName = '';
      },
      error: (error) => {
        this.btnLoader1 = false;
        console.error('Upload error', error);
      }
    });
  }

  btnLoaderCreate: boolean = false;


  createCommunity() {
    this.newForm.markAllAsTouched();
    if (this.newForm.valid) {
      this.btnLoaderCreate = true;
      const formURlData = new FormData();
      formURlData.set('title', this.newForm.value.title);
      if (this.UploadedFile) {
        formURlData.append('file', this.UploadedFile);
      }
      if (this.newForm.value.about) {
        formURlData.set('description', this.newForm.value.about);
      } else {
        formURlData.set('description', '');
      }
      this.service.postAPIFormData('coach/communtiy', formURlData).subscribe({
        next: (resp) => {
          if (resp.success === true) {
            this.closeModal.nativeElement.click();
            this.getCommunityData();
            this.getCommunityProfileData(this.communityId, true, true);
          }
          this.btnLoaderCreate = false;
          this.newForm.reset();
          this.toastr.success(resp.message);
        },
        error: error => {
          this.btnLoaderCreate = false;
          this.toastr.warning('Something went wrong.');
          console.log(error.message)
        }
      })
    }
  }

  btnLoaderEdit: boolean = false;

  editCommunity() {
    this.updateForm.markAllAsTouched();
    if (this.updateForm.valid) {
      this.btnLoaderEdit = true;
      const formURlData = new FormData();
      formURlData.set('title', this.updateForm.value.title)
      if (this.UploadedEditFile) {
        formURlData.append('file', this.UploadedEditFile);
      }
      if (this.updateForm.value.about) {
        formURlData.set('description', this.updateForm.value.about);
      } else {
        formURlData.set('description', '');
      }
      formURlData.set('communityId', this.communityId);
      this.service.postAPIFormDataPatch('coach/communtiy', formURlData).subscribe({
        next: (resp) => {
          if (resp.success === true) {
            this.closeModal1.nativeElement.click();
            this.toastr.success(resp.message);
            this.btnLoaderEdit = false;
            this.getCommunityData();
            this.getCommunityProfileData(this.communityId, false, true)
          } else {
            this.toastr.warning(resp.message);
            this.btnLoaderEdit = false;
          }
          //this.newForm.reset();  
        },
        error: error => {
          this.btnLoaderEdit = false;
          if (error.error.message) {
            this.toastr.error(error.error.message);
          } else {
            this.toastr.error('Something went wrong!');
          }
          console.log(error.statusText)
        }
      })
    }
  }



  croppedImage: any | ArrayBuffer | null = null;

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

  handleCommittedFileInput1(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.files && inputElement.files.length > 0) {
      this.UploadedEditFile = inputElement.files[0];
      this.previewImage1(this.UploadedEditFile);
    }
  }

  previewImage1(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      this.eventImage = e.target?.result;
    };
    reader.readAsDataURL(file);
  }

  deleteField(id: any) {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger"
      },
    });

    swalWithBootstrapButtons.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
      reverseButtons: true,
      confirmButtonColor: "#b92525",
    })
      .then((result) => {
        if (result.isConfirmed) {
          const formURlData = new URLSearchParams();
          formURlData.set('id', id);
          this.service.deleteAcc(`/admin/event/${id}`).subscribe({
            next: resp => {
              console.log(resp)
              this.toastr.success(resp.message)
              this.getCommunityData();
            },
            error: error => {
              console.log(error.message)
            }
          });
        }
      });
  }


  ///////////////feeds///////////////
  communityFeeds: any;

  getCommunityPosts() {
    this.service.getApi(this.isCoach ? `coach/communtiy/allPosts/${this.communityId}` : `user/allPosts?communityId=${this.communityId}`).subscribe({
      next: resp => {
        if (this.isCoach) {
          this.communityFeeds = resp.data?.map((item: any) => ({ ...item, isExpanded: false, isPlaying: false }));

          setTimeout(() => {
            this.communityFeeds?.forEach((item: any, index: any) => {
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
                // this.wave.push(waveInstance); // Store the instance for later use

                // waveInstance.load(item?.mediaUrl);
                this.wave[index] = waveInstance;
                waveInstance.load(item?.mediaUrl);
                this.isPlayingA[index] = false;

                waveInstance.on('ready', () => {
                  const index = this.communityFeeds.findIndex((audio: { id: any; }) => audio.id === item.id);
                  this.totalDurationA[index] = waveInstance.getDuration();
                });

                waveInstance.on('audioprocess', () => {
                  const index = this.communityFeeds.findIndex((audio: { id: any; }) => audio.id === item.id);
                  this.currentTimeA[index] = waveInstance.getCurrentTime();
                });

                waveInstance.on('play', () => {
                  this.isPlayingA[index] = true;  // Update to playing state
                  this.stopOtherAudios(index);   // Stop all other audios when one plays
                });

                waveInstance.on('pause', () => {
                  this.isPlayingA[index] = false; // Update to paused state
                });
              }


            });
          }, 200);
        } else {
          this.communityFeeds = resp.data?.map((item: any) => ({ ...item, isExpanded: false, isPlaying: false }));

          setTimeout(() => {
            this.communityFeeds?.forEach((item: any, index: any) => {
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
                // this.wave.push(waveInstance); // Store the instance for later use

                // waveInstance.load(item?.mediaUrl);
                this.wave[index] = waveInstance;
                waveInstance.load(item?.mediaUrl);
                this.isPlayingA[index] = false;

                waveInstance.on('ready', () => {
                  const index = this.communityFeeds.findIndex((audio: { id: any; }) => audio.id === item.id);
                  this.totalDurationA[index] = waveInstance.getDuration();
                });

                waveInstance.on('audioprocess', () => {
                  const index = this.communityFeeds.findIndex((audio: { id: any; }) => audio.id === item.id);
                  this.currentTimeA[index] = waveInstance.getCurrentTime();
                });

                waveInstance.on('play', () => {
                  this.isPlayingA[index] = true;  // Update to playing state
                  this.stopOtherAudios(index);   // Stop all other audios when one plays
                });

                waveInstance.on('pause', () => {
                  this.isPlayingA[index] = false; // Update to paused state
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

  shortTextLength: number = 270;

  toggleContent(index: number): void {
    this.communityFeeds[index].isExpanded = !this.communityFeeds[index].isExpanded;
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
      confirmButtonColor: '#3085d6',
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
              this.getCommunityPosts();
              this.getCommunityData();
              //this.route.navigateByUrl('/home')
              //this.toastr.success(resp.message);
            } else {
              this.getCommunityPosts();
              //this.toastr.warning(resp.message);
            }
          },
          error: (error) => {
            Swal.fire(
              'Error!',
              'There was an error deleting your post.',
              'error'
            );
            this.getCommunityPosts();
            //this.toastr.error('Error deleting account!');
            console.error('Error deleting account', error);
          }
        });
      }
    });
  }

  //For video
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

  likePost(postId: any) {
    //this.isLike = !this.isLike;
    this.service.postAPI(this.isCoach ? `coach/post/react/${postId}` : `user/post/react/${postId}`, null).subscribe({
      next: resp => {
        console.log(resp);
        this.getCommunityPosts();
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

  postComments: any[] = [];
  showCmt: { [key: string]: boolean } = {};
  currentOpenCommentBoxId: number | null = null;

  toggleCommentBox(id: number): void {
    if (this.currentOpenCommentBoxId === id) {
      // Toggle off if the same box is clicked again
      this.commentText = '';
      this.showCmt[id] = !this.showCmt[id];
      if (!this.showCmt[id]) {
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

  commentsToShow: { [key: number]: number } = {}; // Track number of comments to show
  readonly defaultCommentsCount = 3;

  getPostComments(postId: any) {
    this.service.getApi(this.isCoach ? `coach/comment/${postId}` : `user/post/comment/${postId}`).subscribe({
      next: resp => {
        this.postComments = resp.data?.map((item: any) => ({ ...item, isExpanded: false }));
        //this.postComments = [...tempData, ...this.postComments]
        //console.log('========>', this.postComments)
        this.commentsToShow[postId] = this.defaultCommentsCount;
      },
      error: error => {
        console.log(error.message)
      }
    });
  }

  commentText: any;
  btnLoaderCmt: boolean = false;

  addComment(feed: any) {
    if (this.btnLoaderCmt) {
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
    this.btnLoaderCmt = true;
    this.service.postAPI(this.isCoach ? `coach/comment` : `user/post/comment`, formData.toString()).subscribe({
      next: (response) => {
        console.log(response)
        this.commentText = '';
        this.getPostComments(feed.id);
        this.btnLoaderCmt = false;
        //this.getCommunityPosts();
      },
      error: (error) => {
        //this.toastr.error('Error uploading files!');
        console.error('Upload error', error);
        this.btnLoaderCmt = false;
      }
    });
  }

  toggleCommentText(index: number): void {
    this.postComments[index].isExpanded = !this.postComments[index].isExpanded;
  }

  btnLoaderCmtDel: boolean = false;
  deleteId: any;

  deleteComment(cmtId: any, feed: any) {
    this.deleteId = cmtId;
    if (feed.numberOfComments >= 0) {
      feed.numberOfComments--;
    }
    this.btnLoaderCmtDel = true;
    this.service.deleteAcc(this.isCoach ? `coach/comment/${cmtId}` : `user/post/comment/${cmtId}`).subscribe({
      next: resp => {
        console.log(resp);
        this.getPostComments(feed.id);
        this.btnLoaderCmtDel = false;
        //this.getCommunityPosts();
      },
      error: error => {
        console.log(error.message);
        this.btnLoaderCmtDel = false;
      }
    });
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

  shouldShowLoadMore(id: number): boolean {
    return this.postComments && this.postComments?.length > this.commentsToShow[id];
  }

  loadMoreComments(id: number): void {
    this.commentsToShow[id] += 2; // Load 2 more comments
  }

  ngOnDestroy() {
    this.communityId = ''
    localStorage.setItem('communityId', this.communityId)
  }
  //ngOnDestroy(){}


  isChatActive = false;

  //responsive hide/show
  openChat() {
    this.isChatActive = true;
  }
  closeChat() {
    this.isChatActive = false;
  }

  deleteCommunity() {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this community!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.service.deleteAcc(`coach/communtiy/${this.communityId}`).subscribe({
          next: (resp) => {
            if (resp.success) {
              Swal.fire(
                'Deleted!',
                'Your community has been deleted successfully.',
                'success'
              );
              this.getCommunityData();
              this.communityName = '';
            } else {
              this.getCommunityData();
            }
          },
          error: (error) => {
            Swal.fire(
              'Error!',
              'There was an error deleting your community.',
              'error'
            );
            this.getCommunityData();
            console.error('Error deleting account', error);
          }
        });
      }
    });
  }

  getCoachId(uderId: any, role: any) {
    if (uderId == this.userId) {
      this.route.navigateByUrl('/user/main/my-profile')
    } else {
      this.route.navigateByUrl(`user/main/my-profile/${uderId}/${role}`);
    }
  }


  communityName1: any;
  communityDesc1: any;

  viewId: any;

  viewCommunity(id: any) {
    this.viewId = id;
    this.service.getApi(this.isCoach ? `coach/communtiy/${id}` : `user/communtiy/${id}`).subscribe({
      next: resp => {

        this.eventImage = resp.data.mediaUrl;
        this.communityName1 = resp.data.title;
        this.communityDesc1 = resp.data.description;

      },
      error: error => {
        console.log(error.message)
      }
    });
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
    formData.set('communityId', this.communityId);
    formData.set('reportEntity', 'COMMUNITY');
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
