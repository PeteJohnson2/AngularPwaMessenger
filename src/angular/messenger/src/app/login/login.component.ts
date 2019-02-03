/**
 *    Copyright 2018 Sven Loesekann
   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at
       http://www.apache.org/licenses/LICENSE-2.0
   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
 */
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { MyUser } from '../model/myUser';
import { FormGroup, FormControl, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { MainComponent } from '../main/main.component';
import { AuthenticationService } from '../services/authentication.service';
import { LocaldbService } from '../services/localdb.service';
import { LocalUser } from '../model/localUser';
import { JwttokenService } from '../services/jwttoken.service';
import { LocalCrypto } from './localCrypto';
import { NetConnectionService } from '../services/net-connection.service';


@Component( {
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
} )
export class LoginComponent implements OnInit {
  signinForm: FormGroup;
  loginForm: FormGroup;
  loginFailed = false;
  signinFailed = false;
  pwMatching = true;
  private connected = false;

  constructor( public dialogRef: MatDialogRef<MainComponent>,
    @Inject( MAT_DIALOG_DATA ) public data: any,
    private authenticationService: AuthenticationService,
    private localdbService: LocaldbService,
    private jwttokenService: JwttokenService,
    private netConnectionService: NetConnectionService,
    fb: FormBuilder ) {
    this.signinForm = fb.group( {
      username: ['', Validators.required],
      password: ['', Validators.required],
      password2: ['', Validators.required],
      email: ['', Validators.required]
    }, {
        validator: this.validate.bind( this )
      } );
    this.loginForm = fb.group( {
      username: ['', Validators.required],
      password: ['', Validators.required]
    } );    
  }

  ngOnInit() {
    this.connected = this.netConnectionService.connetionStatus;
    this.netConnectionService.connectionMonitor.subscribe( conn => this.connected = conn );
  }

  validate( group: FormGroup ) {
    if ( group.get( 'password' ).touched || group.get( 'password2' ).touched ) {
      this.pwMatching = group.get( 'password' ).value === group.get( 'password2' ).value && group.get( 'password' ).value !== '';
      if ( !this.pwMatching ) {
        group.get( 'password' ).setErrors( { MatchPassword: true } );
        group.get( 'password2' ).setErrors( { MatchPassword: true } );
      } else {
        group.get( 'password' ).setErrors( null );
        group.get( 'password2' ).setErrors( null );
      }
    }
    return this.pwMatching;
  }

  onSigninClick(): void {
    let myUser = new MyUser();
    myUser.username = this.signinForm.get( 'username' ).value;
    myUser.password = this.signinForm.get( 'password' ).value;
    myUser.email = this.signinForm.get( 'email' ).value;
    //      console.log(this.signinForm);
    //      console.log(myUser);
    this.authenticationService.postSignin( myUser ).subscribe( us => this.signin( us ), err => console.log( err ) );
  }

  onLoginClick(): void {
    let myUser = new MyUser();
    myUser.username = this.loginForm.get( 'username' ).value;
    myUser.password = this.loginForm.get( 'password' ).value;
    //      console.log(myUser);    
    if ( this.connected ) {
      this.authenticationService.postLogin( myUser ).subscribe( us => {
        let myLocalUser: LocalUser = {
          base64Avatar: null,
          createdAt: null,
          email: null,
          hash: null,
          publicKey: null,
          salt: null,
          username: us.username
        };
        this.localdbService.loadUser( myLocalUser ).then( localUserList =>
          localUserList.first().then( myLocalUser => this.login( us, myLocalUser ) ) );
        return;
      }
        , err => console.log( err ) );
    } else {
      let myLocalUser: LocalUser = {
        base64Avatar: null,
        createdAt: null,
        email: null,
        hash: null,
        publicKey: null,
        salt: null,
        username: myUser.username
      };
      myUser.password = null;
      this.localdbService.loadUser( myLocalUser ).then( localUserList =>
        localUserList.first().then( myLocalUser => this.login( myUser, myLocalUser ) ) );
    }
  }


signin( us: MyUser ): void {
  this.data.myUser = null;
  if( us.username !== null ) {
  LocalCrypto.generateKey( this.signinForm.get( 'password' ).value, null ).then( ( result ) => {
    const localUser: LocalUser = {
      base64Avatar: us.base64Avatar,
      createdAt: us.createdAt,
      email: us.email,
      hash: result.a,
      salt: result.b,
      username: us.username,
      publicKey: ''
    };
    this.localdbService.storeUser( localUser ).then( userId => console.log( userId ) );
  }, ( rejected ) => console.log( rejected ) );
  this.signinFailed = false;
  this.dialogRef.close();
} else {
  this.signinFailed = true;
}
  }

login( us: MyUser, localUser: LocalUser ): void {
  this.data.myUser = us;
  if( us.username !== null || localUser.username !== null) {
  this.netConnectionService.connectionMonitor.subscribe( online => {
    if ( online ) {
      this.jwttokenService.jwtToken = us.token;
    }
  } );
  this.jwttokenService.localLogin = true;
  this.loginFailed = false;
  this.dialogRef.close( this.data.myUser );
} else {
  this.loginFailed = true;
}
  }

onCancelClick(): void {
  this.dialogRef.close();
}
}