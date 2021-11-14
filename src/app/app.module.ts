import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgxCanvasGraphModule } from 'ngx-canvas-graph';


import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    NgxCanvasGraphModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
