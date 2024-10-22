import { Component, ElementRef, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SharedService } from '../../services/shared.service';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { WaveService } from 'angular-wavesurfer-service';
import WaveSurfer from 'wavesurfer.js';

@Component({
  selector: 'app-teams',
  templateUrl: './teams.component.html',
  styleUrl: './teams.component.css'
})
export class TeamsComponent {

  searchQueryFilterReq = '';

  @ViewChild('closeModal') closeModal!: ElementRef;
  @ViewChild('closeModal1') closeModal1!: ElementRef;
  @ViewChild('closeModal2') closeModal2!: ElementRef;
  newForm!: FormGroup;
  updateForm!: FormGroup
  role: any;
  isCoach: boolean = true;
  UploadedFile!: File;
  UploadedEditFile!: File;
  userId: any;
  eventImage: any;
  teamData: any;
  searchQueryFilter = '';
  selectedCommunityId: number | null = null;
  loading: boolean = false;

  wave: WaveSurfer[] = [];
  currentTimeA: number[] = [];
  totalDurationA: number[] = [];

  tracks: number[] = Array(50).fill(0); // Array of track heights
  trackHeights: number[] = Array(50).fill(20); // Initial heights of tracks
  highlightedBars: number = 0; // Number of highlighted bars
  isPlayingA: boolean[] = [];

  constructor(private route: Router, private service: SharedService, private toastr: ToastrService, public waveService: WaveService) { }

  toSee: boolean = true
  seeGroupMembesr() {
    this.toSee = !this.toSee
  }

  ngOnInit(): void {
    this.role = this.service.getRole();
    if (this.role == 'USER') {
      this.isCoach = false;
    }
    this.initForm();
    this.initUpdateForm();
    this.userId = localStorage.getItem('fbId');
    this.service.refreshSidebar$.subscribe(() => {
      this.getTeamPosts();
      this.getTeamData();
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

  getTeamData() {
    this.service.getApi(this.isCoach ? 'coach/team' : 'user/team').subscribe({
      next: resp => {
        this.teamData = resp.data;
        console.log('dfsdf', this.teamData);

      },
      error: error => {
        console.log(error.message)
      }
    });
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

  btnLoader: boolean = false;


  createTeam() {
    this.newForm.markAllAsTouched();
    if (this.newForm.valid) {
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
      this.btnLoader = true;
      this.service.postAPIFormData('coach/team', formURlData).subscribe({
        next: (resp) => {
          if (resp.success === true) {
            this.closeModal.nativeElement.click();
            this.getTeamData();
          }
          this.newForm.reset();
          this.btnLoader = false;
          this.toastr.success(resp.message);
        },
        error: error => {
          this.btnLoader = false;
          this.toastr.warning('Something went wrong.');
          console.log(error.message)
        }
      })
    }
  }

  btnLoader1: boolean = false;

  editTeam() {
    this.updateForm.markAllAsTouched();
    if (this.updateForm.valid) {
      //this.loading = true;
      const formURlData = new FormData();
      formURlData.set('title', this.updateForm.value.title)
      if (this.UploadedEditFile) {
        formURlData.append('file', this.UploadedEditFile);
      }
      // formURlData.set('description', this.updateForm.value.about);
      if (this.updateForm.value.about) {
        formURlData.set('description', this.updateForm.value.about);
      } else {
        formURlData.set('description', '');
      }
      formURlData.set('teamId', this.teamId);
      this.btnLoader1 = true;
      this.service.postAPIFormDataPatch('coach/team', formURlData).subscribe({
        next: (resp) => {
          if (resp.success === true) {
            this.closeModal1.nativeElement.click();
            this.toastr.success(resp.message);
            //this.loading = false;
            this.getTeamData();
            this.btnLoader1 = false;
            this.getCommunityProfileData(this.selectedCommunityId, true)
          } else {
            this.btnLoader1 = false;
            this.toastr.warning(resp.message);
            //this.loading = false;
          }
          //this.newForm.reset();  
        },
        error: error => {
          //.loading = false;
          this.btnLoader1 = false;
          this.toastr.error('Something went wrong.');
          console.log(error.statusText)
        }
      })
    }
  }


  teamId: any;
  teamName: any;
  teamImg: any;
  numberOfParticipant: any;
  numberOfPosts: any;
  isParticipant: boolean = false;
  isAdmin: boolean = false;
  teamParticipants: any;

  teamAdminName: any;
  teamAdminImg: any;
  teamAdminid: any;
  teamAdminRole: any;

  getCommunityProfileData(cId: any, isAdmin: boolean) {
    this.isAdmin = isAdmin
    //if (participantCheck) {
    this.teamId = cId;
    this.selectedCommunityId = cId;

    localStorage.setItem('teamId', this.teamId)
    this.service.getApi(this.isCoach ? `coach/team/${cId}` : `user/team/${cId}`).subscribe({
      next: resp => {

        if (this.isCoach) {
          this.updateForm.patchValue({
            title: resp.data.title,
            about: resp.data.description,
          });
        }

        this.eventImage = resp.data.mediaUrl;
        this.teamName = resp.data.title;
        this.numberOfParticipant = resp.data.numberOfParticipant;
        this.numberOfPosts = resp.data.numberOfPosts;
        this.isParticipant = resp.data.isParticipant;
        //this.isAdmin = resp.data.isAdmin;
        this.teamImg = resp.data.mediaUrl;
        //debugger
        this.teamParticipants = resp.data.Participant;

        this.teamAdminid = resp.data.admin.id;
        this.teamAdminName = resp.data.admin.full_name;
        this.teamAdminImg = resp.data.admin.avatar_url;
        this.teamAdminRole = resp.data.admin.role;

        this.getTeamPosts();
      },
      error: error => {
        console.log(error.message)
      }
    });
    // } else {
    //   this.toastr.warning('Please join community first.')
    // }
  }

  ///////////////feeds///////////////
  teamFeeds: any;

  getTeamPosts() {
    this.service.getApi(this.isCoach ? `coach/team/allPosts/${this.teamId}` : `user/allPosts?communityId=${this.teamId}`).subscribe({
      next: resp => {
        if (this.isCoach) {
          this.teamFeeds = resp.data?.map((item: any) => ({ ...item, isExpanded: false, isPlaying: false }));

          setTimeout(() => {
            this.teamFeeds?.forEach((item: any, index: any) => {
              if(item.type == 'PODCAST'){
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
                  const index = this.teamFeeds.findIndex((audio: { id: any; }) => audio.id === item.id);
                  this.totalDurationA[index] = waveInstance.getDuration();
                });
  
                waveInstance.on('audioprocess', () => {
                  const index = this.teamFeeds.findIndex((audio: { id: any; }) => audio.id === item.id);
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
          this.teamFeeds = resp.data?.map((item: any) => ({ ...item, isExpanded: false, isPlaying: false }));
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
    this.teamFeeds[index].isExpanded = !this.teamFeeds[index].isExpanded;
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
              this.getTeamPosts();
              this.getTeamData();
            } else {
              this.getTeamPosts();
            }
          },
          error: (error) => {
            Swal.fire(
              'Error!',
              'There was an error deleting your post.',
              'error'
            );
            this.getTeamPosts();
            //this.toastr.error('Error deleting account!');
            console.error('Error deleting account', error);
          }
        });
      }
    });
  }

  likePost(postId: any) {
    //this.isLike = !this.isLike;
    this.service.postAPI(this.isCoach ? `coach/post/react/${postId}` : `user/post/react/${postId}`, null).subscribe({
      next: resp => {
        console.log(resp);
        this.getTeamPosts();
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

  // bookmarkPost(postId: any) {
  //   //this.isBookmark = !this.isBookmark;
  //   this.service.postAPI(`user/post/saveOrUnsave/${postId}`, null).subscribe({
  //     next: resp => {
  //       console.log(resp);
  //       this.getTeamPosts();
  //     },
  //     error: error => {
  //       console.log(error.message)
  //     }
  //   });
  // }

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
        //this.getTeamPosts();
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
        //this.getTeamPosts();
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

  ngOnDestroy() {
    this.teamId = ''
    localStorage.setItem('teamId', this.teamId)
  }

  followedCoaches: any[] = [];

  getCoachesToAddInTeam() {
    this.service.getApi(`coach/team/getMembersToAddInTeam/${this.teamId}`).subscribe(response => {
      if (response.success) {
        this.followedCoaches = response.data;
        //debugger
        // setTimeout(() => {
        //   this.filteredCategories = response.data.filter((category: { id: any; }) => category.id !== this.primaryCategoryId);
        // }, 1000);
      }
    });
  }

  selectedCategoryIds: number[] = [];
  selectedCategoryNames: string[] = [];

  selectedCategoryIdsString: string = '';
  selectedCategoryNamesString: string = '';

  onCategoryChange(event: any, category: any): void {
    if (event.target.checked) {
      this.selectedCategoryIds.push(category.id);
      this.selectedCategoryNames.push(category.name);
    } else {
      const indexId = this.selectedCategoryIds.indexOf(category.id);
      if (indexId > -1) {
        this.selectedCategoryIds.splice(indexId, 1);
      }

      const indexName = this.selectedCategoryNames.indexOf(category.name);
      if (indexName > -1) {
        this.selectedCategoryNames.splice(indexName, 1);
      }
    }

    this.selectedCategoryIdsString = this.selectedCategoryIds.join(', ');
    // Update the form control value with the concatenated category names
    this.newForm.get('other_categ')?.setValue(this.selectedCategoryNames.join(', '));
  }

  sendReqLoader: boolean = false;

  sendRequest() {
    // const formData: any = new URLSearchParams();
    // formData.set('receiverIds', this.selectedCategoryIds);
    // formData.set('teamId', this.teamId);
    if (this.selectedCategoryIds?.length == 0) {
      return; // Exit the function if no categories are selected
    }
    const chatSettings = {
      receiverIds: this.selectedCategoryIds,
      teamId: this.teamId
    };
    this.sendReqLoader = true;
    this.service.postAPIFormData(this.isCoach ? `coach/team/sendTeamRequest` : `user/post/comment`, chatSettings).subscribe({
      next: (response) => {
        this.closeModal2.nativeElement.click();
        this.toastr.success(response.message);
        this.sendReqLoader = false;
      },
      error: (error) => {
        //this.toastr.error('Error uploading files!');
        console.error('Upload error', error);
        this.sendReqLoader = false;
      }
    });
  }


  leaveTeam() {
    const formData = new URLSearchParams();
    formData.set('teamId', this.teamId);
    //this.btnLoaderCmt = true;
    this.service.postAPI(this.isCoach ? `coach/team/leave` : `user/post/comment`, formData.toString()).subscribe({
      next: (response) => {
        if (response.success) {
          this.getTeamData();
          this.getCommunityProfileData(this.teamId, false);
          //this.teamFeeds = ''
        }
      },
      error: (error) => {
        //this.toastr.error('Error uploading files!');
        console.error('Upload error', error);
        //this.btnLoaderCmt = false;
      }
    });
  }

  isChatActive = false;

  //responsive hide/show
  openChat() {
    this.isChatActive = true;
  }
  closeChat() {
    this.isChatActive = false;
  }

  deleteTeam() {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this team!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.service.deleteAcc(`coach/team/${this.teamId}`).subscribe({
          next: (resp) => {
            if (resp.success) {
              Swal.fire(
                'Deleted!',
                'Your team has been deleted successfully.',
                'success'
              );
              this.getTeamData();
              this.teamName = '';
            } else {
              this.getTeamData();
            }
          },
          error: (error) => {
            Swal.fire(
              'Error!',
              'There was an error deleting your team.',
              'error'
            );
            this.getTeamData();
            console.error('Error deleting account', error);
          }
        });
      }
    });
  }

  getCoachId(uderId: any, role: any) {
    this.route.navigateByUrl(`user/main/my-profile/${uderId}/${role}`);
  }


}
