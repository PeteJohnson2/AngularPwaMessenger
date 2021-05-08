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
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable( {
  providedIn: 'root'
} )
export class NetConnectionService {
  private localConnectionMonitor: Observable<boolean>;
  private localCconnectionStatus: boolean;

  constructor() {
    this.localCconnectionStatus = navigator.onLine;
    this.localConnectionMonitor = new Observable( ( observer ) => {
      window.addEventListener( 'offline', ( e ) => {
        this.localCconnectionStatus = false;
        observer.next( false );
      } );
      window.addEventListener( 'online', ( e ) => {
        this.localCconnectionStatus = true;
        observer.next( true );
      } );
    } );
  }

  get connectionMonitor(): Observable<boolean> {
    return this.localConnectionMonitor;
  }

  get connetionStatus(): boolean {
    return this.localCconnectionStatus;
  }
}
