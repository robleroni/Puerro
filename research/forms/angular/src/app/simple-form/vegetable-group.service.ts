import { Injectable } from '@angular/core';
import { of, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VegetableGroupService {

  constructor() { }

  /**
   * Returns an array of vegetable groups
   */
  getVegetables(): Observable<string[]> {
    return of(
      ["Bulps", "Flowers", "Fruits", "Fungi", "Leaves", "Roots", "Seeds", "Steams", "Tubers"]
    );
  }
}
