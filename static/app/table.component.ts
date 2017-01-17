import {Component}          from '@angular/core';
import {StateService} from "./state.service";
import {Title} from "./title";
import {Field} from "./field";
import {BehaviorSubject, Subject} from "rxjs";

@Component({
  moduleId: module.id,
  selector: 'title-table',
  template: `
    <table id="title-table" class="table table-striped table-bordered table-hover">
      <thead>
        <tr>
          <td *ngFor="let field of fields | async" (click)="changeSorting(field)">{{field.shortName}}
            <i *ngIf="field.withSort && !field.sort" class="fa fa-sort"></i>
            <i *ngIf="field.withSort && field.sort == 'asc'" class="fa fa-sort-asc"></i>
            <i *ngIf="field.withSort && field.sort == 'desc'" class="fa fa-sort-desc"></i>
          </td>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let title of titles | async">
            <td *ngFor="let field of fields | async" >{{title[field.field]}}</td>
        </tr>
      </tbody>
    </table>
  `,
})
export class TitleTableComponent {
  private titles: Subject<Title[]>;
  private fields: BehaviorSubject<Field[]>;

  constructor(
    private stateService: StateService) {
    this.titles = this.stateService.filteredTitles;
    this.fields = this.stateService.fieldsTerms;
  }

  changeSorting(field: Field): void {

    if (field.withSort) {
      if (!field.sort) {
        field.sort = 'desc';
      } else {
        if (field.sort == 'desc') {
          field.sort = 'asc';
        } else {
          field.sort = null;
        }
      }
      let next = this.fields.getValue();
      for (let f of next) {
        if (f != field) {
          f.sort = null;
        }
      }
      this.fields.next(next);
    }
  }

}
