import {NgModule}      from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {FormsModule}   from '@angular/forms';
import {HttpModule}    from "@angular/http";
import {AppComponent}  from "./app.component";
import {TitleService} from "./title.service";
import {FieldService} from "./field.service";
import {TitleTableComponent} from "./table.component";
import {FieldComponent} from "./field.component";
import './rxjs-extensions';


@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
  ],
  declarations: [
    AppComponent,
    TitleTableComponent,
    FieldComponent
  ],
  providers: [TitleService, FieldService],
  bootstrap: [AppComponent]
})
export class AppModule {
}
