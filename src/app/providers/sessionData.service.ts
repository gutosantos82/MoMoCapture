import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SessionDataService {

  public uuid: string = "";
  public httpResponse: string = "";
  public httpRequest: string = "";
  public backgroundMode: string = "";

  constructor(
  ) {
  }

}