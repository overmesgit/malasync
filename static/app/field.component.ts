import {Component, OnInit}          from '@angular/core';
import {FieldService} from "./field.service";
import {Field} from "./field";

@Component({
  moduleId: module.id,
  selector: 'field-select',
  template: `
    <nouislider [connect]="true" [config]="rangeConfig" [(ngModel)]="someRange" (ngModelChange)="onChanges($event)"></nouislider>
    <div class="field-select">
        <div class="form-check" *ngFor="let field of fields">
          <label class="form-check-label">
            <input [(ngModel)]="field.enable" (ngModelChange)="onChanges($event)" class="form-check-input" type="checkbox" value="">
            {{field.display()}}
          </label>
        </div>
    </div>
  `,
})
export class FieldComponent implements OnInit{
  fields: Field[];
  someRange = [5,10];

  rangeConfig: any = {
    connect: true,
    start: 1,
    end: 10,
    range: {
      min: 0,
      max: 20
    },
    step: 1
  };

  constructor(
    private fieldService: FieldService) { }

  ngOnInit(): void {
    this.fields = this.fieldService.allFields;
  }

  onChanges(): void {
    this.fieldService.fieldsTerms.next(this.fields.filter(f => f.enable))
  }
}
