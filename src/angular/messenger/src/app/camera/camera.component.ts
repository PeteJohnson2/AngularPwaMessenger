import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { MainComponent } from '../main/main.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-camera',
  templateUrl: './camera.component.html',
  styleUrls: ['./camera.component.scss']
})
export class CameraComponent implements OnInit {
  @ViewChild('videoElement') videoElement: ElementRef;  
  private video: HTMLVideoElement;
  @ViewChild('canvasElement') canvasElement: ElementRef;  
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  showVideo = true;  
  
  constructor(public dialogRef: MatDialogRef<MainComponent>,
      @Inject( MAT_DIALOG_DATA ) public data: any) { }

  ngOnInit() {
    this.video = this.videoElement.nativeElement;
    this.canvas = this.canvasElement.nativeElement;
    this.context = this.canvas.getContext('2d');
  }

  preview() {
    this.showVideo = true;    
    let config: MediaStreamConstraints = {
        video: true,
        audio: false
    };
    navigator.mediaDevices.getUserMedia(config).then(stream => {
      this.video.srcObject = stream;
      this.video.play();
    });
  }
  
  capture() {
    const videoRatio = this.video.videoHeight / this.video.videoWidth 
    this.canvas.height = this.canvas.width * videoRatio;
    this.context.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.width * videoRatio);
    let srco = this.video.srcObject as MediaStream;
    srco.getTracks().forEach(track => track.stop());
    this.showVideo = false;
  }
}
