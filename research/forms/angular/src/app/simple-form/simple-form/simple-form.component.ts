import { VegetableGroupService } from './../vegetable-group.service';
import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-simple-form',
  templateUrl: './simple-form.component.html',
  styleUrls: ['./simple-form.component.scss']
})
export class SimpleFormComponent {
  formGroup: FormGroup;
  groups$: Observable<string[]>;
  result: string;

  constructor(fb: FormBuilder, vegetableGroupService: VegetableGroupService) {
    this.formGroup = fb.group({
      name: ['', [Validators.required, Validators.maxLength(30)]],
      group: [''],
      tasty: [false],
      description :[''],
    });
    this.groups$ = vegetableGroupService.getVegetables();
  }

  onSubmit() {
    this.result = this.formGroup.value;
  }

}
