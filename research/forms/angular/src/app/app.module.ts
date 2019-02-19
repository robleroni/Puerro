import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { SimpleFormModule } from './simple-form/simple-form.module';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    SimpleFormModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
