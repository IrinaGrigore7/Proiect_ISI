import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  constructor() { }

  public setItem(key: string, value: any) {
    localStorage.setItem(key, JSON.stringify(value))
  }

  public getItem(key: string) {
    const localStorageInfo = localStorage.getItem(key);
    if(!localStorageInfo)
      return undefined;

    return JSON.parse(localStorageInfo)
  }
}