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
import {PaginationComponent} from "./pagination.component";
import { NouisliderComponent } from 'ng2-nouislider';


@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
  ],
  declarations: [
    NouisliderComponent,
    AppComponent,
    TitleTableComponent,
    FieldComponent,
    PaginationComponent,
  ],
  providers: [TitleService, FieldService],
  bootstrap: [AppComponent]
})
export class AppModule {
}
