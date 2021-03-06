import {NgModule, enableProdMode}      from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {FormsModule}   from '@angular/forms';
import {HttpModule}    from "@angular/http";
import {AppComponent}  from "./app.component";
import {StateService} from "./state.service";
import {TitleTableComponent} from "./table.component";
import {FieldComponent} from "./field.component";
import './rxjs-extensions';
import {PaginationComponent} from "./pagination.component";
import { NouisliderComponent } from 'ng2-nouislider';
import {SelectModule} from 'ng2-select/ng2-select';
import {UserSelectComponent} from "./user.component";
import {FilterComponent} from "./filter.component";
import {DndModule} from "ng2-dnd";
import { MyDateRangePickerModule } from 'mydaterangepicker';

class win extends Window {
  prod: boolean;
}
if ((window as win).prod) {
  enableProdMode();
}
@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    SelectModule,
    DndModule.forRoot(),
    MyDateRangePickerModule
  ],
  declarations: [
    NouisliderComponent,
    AppComponent,
    TitleTableComponent,
    FieldComponent,
    PaginationComponent,
    UserSelectComponent,
    FilterComponent
  ],
  providers: [StateService],
  bootstrap: [AppComponent]
})
export class AppModule {
}
