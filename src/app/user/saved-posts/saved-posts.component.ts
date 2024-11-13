import { Component, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { SharedService } from '../../services/shared.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { WaveService } from 'angular-wavesurfer-service';
import WaveSurfer from 'wavesurfer.js';
import { Router } from '@angular/router';

@Component({
  selector: 'app-saved-posts',
  templateUrl: './saved-posts.component.html',
  styleUrl: './saved-posts.component.css'
})
export class SavedPostsComponent {

  role: any;
  data: any;
  userId: any;


  constructor(private visibilityService: SharedService, private snackBar: MatSnackBar, public waveService: WaveService, private router: Router) { }

  ngOnInit() {
    this.userId = localStorage.getItem('fbId');
    this.getProfileData();
    this.visibilityService.triggerRefresh();
  }


  shortTextLength: number = 270;

  wave: WaveSurfer[] = [];
  currentTimeA: number[] = [];
  totalDurationA: number[] = [];

  tracks: number[] = Array(50).fill(0); // Array of track heights
  trackHeights: number[] = Array(50).fill(20); // Initial heights of tracks
  highlightedBars: number = 0; // Number of highlighted bars
  isPlayingA: boolean[] = [];

  getProfileData() {
    this.visibilityService.getApi('user/post/savedPosts').subscribe({
      next: resp => {
        this.data = resp.data?.map((item: any) => ({ ...item, isExpanded: false }));

        setTimeout(() => {
          this.data?.forEach((item: any, index: any) => {
            if(item.post.type == 'PODCAST'){
              const waveformId = '#waveform' + item.post.id;
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
  
              // waveInstance.load(item?.post?.mediaUrl);
              this.wave[index] = waveInstance;
              waveInstance.load(item?.post.mediaUrl);
              this.isPlayingA[index] = false;
  
              waveInstance.on('ready', () => {
                const index = this.data.findIndex((audio: { id: any; }) => audio.id === item.id);
                this.totalDurationA[index] = waveInstance.getDuration();
              });
  
              waveInstance.on('audioprocess', () => {
                const index = this.data.findIndex((audio: { id: any; }) => audio.id === item.id);
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



  toggleContent(index: number): void {
    this.data[index].isExpanded = !this.data[index].isExpanded;
  }

  shouldShowReadMore(text: string): boolean {
    return text?.length > this.shortTextLength;
  }

  likePost(postId: any) {
    //this.isLike = !this.isLike;
    this.visibilityService.postAPI(`user/post/react/${postId}`, null).subscribe({
      next: resp => {
        // console.log(resp);
        // this.getProfileData();
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
    this.visibilityService.postAPI(`user/post/react/${feed.id}`, null)
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

    this.visibilityService.postAPI(`user/post/saveOrUnsave/${feed.id}`, null).subscribe({
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
    const trimmedMessage = this.commentText.trim();
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
    this.visibilityService.postAPI(`user/post/comment`, formData.toString()).subscribe({
      next: (response) => {
        console.log(response)
        this.commentText = '';
        this.getPostComments(feed.id);
        this.btnLoader = false;
        //this.getProfileData();
      },
      error: (error) => {
        console.error('Upload error', error);
        this.btnLoader = false;
      }
    });
  }

  postComments: any[] = [];
  showCmt: { [key: string]: boolean } = {};
  currentOpenCommentBoxId: number | null = null;
  // toggleCommentBox(postId: any) {
  //   this.showCmt[postId] = !this.showCmt[postId];
  //   this.getPostComments(postId);
  // }

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

  getPostComments(postId: any) {
    this.visibilityService.getApi(`user/post/comment/${postId}`).subscribe({
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

  commentsToShow: { [key: number]: number } = {}; // Track number of comments to show
  readonly defaultCommentsCount = 3;

  loadMoreComments(id: number): void {
    this.commentsToShow[id] += 2; // Load 2 more comments
  }

  toggleCommentText(index: number): void {
    this.postComments[index].isExpanded = !this.postComments[index].isExpanded;
  }

  shouldShowLoadMore(id: number): boolean {
    return this.postComments && this.postComments?.length > this.commentsToShow[id];
  }

  likeComment(cmtId: any) {
    cmtId.alreadyLiked = !cmtId.alreadyLiked;
    this.visibilityService.postAPI(`user/post/comment/react/${cmtId.id}`, null).subscribe({
      next: resp => {
        // console.log(resp);
        // this.getPostComments(postId);
      },
      error: error => {
        console.log(error.message)
      }
    });
  }

  btnLoaderCmt: boolean = false;
  deleteId: any;

  deleteComment(cmtId: any, feed: any) {
    this.deleteId = cmtId;
    if (feed.numberOfComments >= 0) {
      feed.numberOfComments--;
    }
    this.btnLoaderCmt = true;
    this.visibilityService.deleteAcc(`user/post/comment/${cmtId}`).subscribe({
      next: resp => {
        console.log(resp);
        this.getPostComments(feed.id);
        this.btnLoaderCmt = false;
        //this.getProfileData();
      },
      error: error => {
        console.log(error.message);
        this.btnLoaderCmt = false;
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

  getCoachId(uderId: any, role: any) {
    this.router.navigateByUrl(`user/main/my-profile/${uderId}/${role}`)
  }


}
