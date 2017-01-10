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
    <table>
        <tr *ngFor="let title of titles">
            <td *ngFor="let field of fields | async" [style.display]="field.enable">{{title[field.name]}}</td>
        </tr>
    </table>
  `,
})
export class TitleTableComponent implements OnInit{
  private titles: Title[];
  private fields: Observable<Field[]>;

  constructor(
    private titleService: TitleService,
    private fieldService: FieldService) { }

  getTitles(): void {
    this.titleService
        .getTitles()
        .then(titles => this.titles = titles);
  }

  ngOnInit(): void {
    this.fields = this.fieldService.getFieldsSubject().debounceTime(300).distinctUntilChanged();
    this.getTitles();
  }
}
