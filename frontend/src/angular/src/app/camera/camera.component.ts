import {
  Component,
  OnInit,
  Inject,
  ViewChild,
  ElementRef,
} from "@angular/core";
import { MainComponent } from "../main/main.component";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Constants } from "../common/constants";
import { Contact } from "../model/contact";
import { Message } from "../model/message";

@Component({
    selector: "app-camera",
    templateUrl: "./camera.component.html",
    styleUrls: ["./camera.component.scss"],
    standalone: false
})
export class CameraComponent implements OnInit {
  @ViewChild("videoElement", { static: true }) videoElement: ElementRef;
  @ViewChild("canvasElement", { static: true }) canvasElement: ElementRef;
  protected showVideo = true;
  protected base64Img: string = null;
  protected showCameraMsg = false;
  private video: HTMLVideoElement;
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;

  constructor(
    public dialogRef: MatDialogRef<MainComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    this.video = this.videoElement.nativeElement;
    this.canvas = this.canvasElement.nativeElement;
    this.context = this.canvas.getContext("2d");
  }

  preview() {
    this.showVideo = true;
    this.base64Img = null;
    const config: MediaStreamConstraints = {
      video: true,
      audio: false,
    };
    navigator.mediaDevices.getUserMedia(config).then(
      (stream) => {
        this.showCameraMsg = false;
        this.video.srcObject = stream;
        this.video.play();
      },
      () => {
        this.showCameraMsg = true;
      }
    );
  }

  capture() {
    const videoRatio = this.video.videoHeight / this.video.videoWidth;
    this.canvas.height = this.canvas.width * videoRatio;
    this.context.drawImage(
      this.video,
      0,
      0,
      this.canvas.width,
      this.canvas.width * videoRatio
    );
    this.base64Img = this.canvas.toDataURL(Constants.IMAGE_TYPE, 0.8);
    this.base64Img =
      Constants.B64_IMAGE_PREFIX +
      this.base64Img.replace(/data\:image\/(jpeg|jpg|png)\;base64\,/gi, "");
    //    console.log(this.base64Img.length);
    const srco = this.video.srcObject as MediaStream;
    srco.getTracks().forEach((track) => track.stop());
    this.showVideo = false;
  }

  send() {
    const receiver = this.data.receiver as Contact;
    const msg: Message = {
      fromId: null,
      toId: receiver.userId,
      text: this.base64Img,
      send: false,
      received: false,
    };
    this.dialogRef.close(msg);
  }

  cancel() {
    this.dialogRef.close(null);
  }
}
