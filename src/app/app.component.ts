import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { UUID } from 'angular2-uuid';
import { SessionDataService } from './providers/sessionData.service';
import { BackgroundMode } from '@ionic-native/background-mode/ngx';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private nativeStorage: NativeStorage,
    private sessionData: SessionDataService,
    private backgroundMode: BackgroundMode
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      //this.statusBar.styleDefault();
      if (this.platform.is('cordova')) {
        this.splashScreen.hide();
        this.nativeStorage.getItem('uuid')
          .then(
            data => { 
              this.sessionData.uuid = data;
              console.log('Already stored item uuid:' + data)
            },
            error => {
              //console.error(error)
              let uuid = UUID.UUID();
              this.sessionData.uuid = uuid;
              this.nativeStorage.setItem('uuid', uuid)
                .then(
                  () => console.log('Stored item uuid:' + uuid),
                  error => console.error('Error storing item uuid', error)
                );
            }
          );
        this.backgroundMode.on("activate").subscribe(() => {
           this.backgroundMode.disableWebViewOptimizations(); 
           this.backgroundMode.disableBatteryOptimizations();
           this.sessionData.backgroundMode += new Date().toLocaleString() + ": activate\n";
        });

        this.backgroundMode.on("enable").subscribe(() => {
           this.sessionData.backgroundMode += new Date().toLocaleString() + ": enable\n";
        });
        this.backgroundMode.on("disable").subscribe(() => {
           this.sessionData.backgroundMode += new Date().toLocaleString() + ": disable\n";
        });
        this.backgroundMode.on("deactivate").subscribe(() => {
           this.sessionData.backgroundMode += new Date().toLocaleString() + ": deactivate\n";
        });
        this.backgroundMode.on("failure").subscribe(() => {
           this.sessionData.backgroundMode += new Date().toLocaleString() + ": failure\n";
        });
      } else {
        this.sessionData.uuid = UUID.UUID();
      }
    });
  }
}
