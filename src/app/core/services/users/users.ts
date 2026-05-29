import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUrl } from '../../../shared/environments/base-url';

@Injectable({
  providedIn: 'root',
})
export class Users {
  private readonly http = inject(HttpClient)


  getAllFarmers():Observable<any>
  {
    return this.http.get(`${BaseUrl.url}api/Farmers/verified-farmers`)
  }
}
