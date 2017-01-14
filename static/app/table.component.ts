import {Component}          from '@angular/core';
import {StateService} from "./state.service";
import {Title} from "./title";
import {Field} from "./field";
import { Observable }        from 'rxjs/Observable';
@Component({
  moduleId: module.id,
  selector: 'title-table',
  template: `
    <table id="title-table" class="table table-striped table-bordered table-hover">
      <thead>
        <tr>
          <td *ngFor="let field of fields | async" [style.display]="field.enable">{{field.shortName}}</td>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let title of titles | async">
            <td *ngFor="let field of fields | async" [style.display]="field.enable">{{title[field.field]}}</td>
        </tr>
      </tbody>
    </table>
  `,
})
export class TitleTableComponent {
  private titles: Observable<Title[]>;
  private fields: Observable<Field[]>;

  constructor(
    private stateService: StateService) {
    this.titles = this.stateService.filteredTitles;
    this.fields = this.stateService.fieldsTerms;
  }

}
