import { Component } from '@angular/core';
import { Injectable, NgZone } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { BackgroundMode } from '@ionic-native/background-mode/ngx';
import { Subscription } from "rxjs";


export interface GeneralInfoType {
  interval: number;
  time: number;
}

export interface AccelerationType {
  x: number;
  y: number;
  z: number;
}

export interface RotationType {
  alpha: number;
  beta: number;
  gamma: number;
}

export interface GeolocationType {
	time: number;
  lat: number;
  long: number;
  accuracy: number;
}

export interface DeviceMotionType {
	timestamp: number;
	time: number;
	x: number;
  y: number;
  z: number;
  alpha: number;
  beta: number;
  gamma: number;
}

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

	private docEvtDevMotion:EventListenerOrEventListenerObject = null;
	private geoSubscription: Subscription;
	captureOn: boolean = false;
	acc: AccelerationType = {x:0, y:0, z:0};
	rot: RotationType = {alpha:0, beta:0, gamma:0};
	general: GeneralInfoType = {interval:0, time:0};
	geo: GeolocationType = {time:0, lat:0, long:0, accuracy:0};
	readFrequency: number;
	dateStart: Date;
	countMotionReading: number;
	countGPSReading: number;
	hasDeviceMotion: boolean = false;
	deviceMotionList: DeviceMotionType[] = [];
	geolocationList: GeolocationType[] = [];

  constructor(
  	private zone: NgZone,
  	private geolocation: Geolocation,
  	private backgroundMode: BackgroundMode
  	) {  	
    let self = this;
    this.docEvtDevMotion = (event: DeviceMotionEvent)=>{
        self.processEvent(event);
    }
    let _window: any = window;
    if(_window.DeviceMotionEvent) {
    	this.hasDeviceMotion = true;
    }
  }

processEvent(event: DeviceMotionEvent) {
    //console.log(event);
		this.zone.run(() => {

			var currentTime: number = new Date().getTime();
			var timeDiff: number = currentTime - this.dateStart.getTime();
			this.countMotionReading++;
      this.readFrequency = parseFloat((1000 * this.countMotionReading / (timeDiff)).toFixed(4));

	    this.general.interval = event.interval;
	    this.general.time = parseFloat(event.timeStamp.toFixed(4));

	    if(event.accelerationIncludingGravity.x) {
		    this.acc.x = parseFloat(event.accelerationIncludingGravity.x.toFixed(4));
		    this.acc.y = parseFloat(event.accelerationIncludingGravity.y.toFixed(4));
		    this.acc.z = parseFloat(event.accelerationIncludingGravity.z.toFixed(4));
	  	}

	  	if(event.rotationRate.alpha) {
		    this.rot.alpha = parseFloat(event.rotationRate.alpha.toFixed(4));
		    this.rot.beta = parseFloat(event.rotationRate.beta.toFixed(4));
		    this.rot.gamma = parseFloat(event.rotationRate.gamma.toFixed(4));
	  	}

	  	this.deviceMotionList.push({
	  			timestamp: currentTime,
	  			time: event.timeStamp,
					x: event.accelerationIncludingGravity.x,
				  y: event.accelerationIncludingGravity.y,
				  z: event.accelerationIncludingGravity.z,
				  alpha: event.rotationRate.alpha,
				  beta: event.rotationRate.beta,
				  gamma: event.rotationRate.gamma
	  	});

  	});
}


startCapture(e: any) {
		this.backgroundMode.enable();
		this.backgroundMode.setDefaults({
			title : 'App is running', 
			text : 'Click here to turn it off',
      icon: 'icon',
      color: 'F14F4D', // hex format
      resume: true,
      hidden: false,
      bigText: true,
      // To run in background without notification
      silent: false
		});
		this.backgroundMode.on("activate").subscribe(() => {
   		this.backgroundMode.disableWebViewOptimizations(); 
		});
    this.captureOn = true;
		this.dateStart = new Date();
		this.countMotionReading = 0;
		this.countGPSReading = 0;
		if(this.hasDeviceMotion) {
			window.addEventListener("devicemotion", this.docEvtDevMotion, false);
		}
		let watch = this.geolocation.watchPosition({ maximumAge: 3000, timeout: 5000, enableHighAccuracy: false });
		this.geoSubscription = watch.subscribe((data: Position) => {
			 if(Object.prototype.toString.call(data) === "[object PositionError]") {  
			 	console.log(data); 
			 	return;
			 }
			 //console.log(data);
			 this.countGPSReading++;
			 this.geo.lat = parseFloat(data.coords.latitude.toFixed(4));
			 this.geo.long = parseFloat(data.coords.longitude.toFixed(4));
			 this.geo.accuracy = data.coords.accuracy;
			 this.geo.time = data.timestamp;
			 this.geolocationList.push(this.geo);
		}, 
		(error: PositionError) => console.log(error));
  }

stopCapture(e: any) {
		//window.removeEventListener("devicemotion",this.processEvent.bind(this), true);	
		if(this.hasDeviceMotion) {
			window.removeEventListener("devicemotion", this.docEvtDevMotion, false);
		}
		this.geoSubscription.unsubscribe();
	  this.captureOn = false;
	  this.backgroundMode.disable();
	}

moveToBackground(e: any) {
		this.backgroundMode.moveToBackground();
	}

getGeolocation(e: any) {
    // get current position
    this.geolocation.getCurrentPosition({ maximumAge: 3000, timeout: 5000, enableHighAccuracy: false }).then(pos => {
      alert('lat: ' + pos.coords.latitude + ', lon: ' + pos.coords.longitude);
    }).catch((error) => {
        alert(error);
    });;
	}

}
