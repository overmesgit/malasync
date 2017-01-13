import {Component, OnInit}          from '@angular/core';
import {TitleService} from "./title.service";
import {Title} from "./title";
import {FieldService} from "./field.service";
import {Field} from "./field";
import { Observable }        from 'rxjs/Observable';
@Component({
  moduleId: module.id,
  selector: 'title-table',
  template: `
    <table id="title-table" class="table table-striped table-bordered table-hover">
      <thead>
        <tr>
          <td *ngFor="let field of fields | async" [style.display]="field.enable">{{field.name}}</td>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let title of titles | async">
            <td *ngFor="let field of fields | async" [style.display]="field.enable">{{title[field.name]}}</td>
        </tr>
      </tbody>
    </table>
  `,
})
export class TitleTableComponent {
  private titles: Observable<Title[]>;
  private fields: Observable<Field[]>;

  constructor(
    private titleService: TitleService,
    private fieldService: FieldService) {
    this.titles = this.titleService.filteredTitles;
    this.fields = this.fieldService.fieldsTerms;
  }

}
