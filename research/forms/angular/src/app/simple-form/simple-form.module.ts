import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SimpleFormComponent } from './simple-form/simple-form.component';
import { VegetableGroupService } from './vegetable-group.service';

@NgModule({
  imports: [
    CommonModule
  ],
  exports: [
    SimpleFormComponent
  ],
  declarations: [SimpleFormComponent],
  providers: [
    VegetableGroupService
  ]
})
export class SimpleFormModule { }
