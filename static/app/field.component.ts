import {Component, OnInit}          from '@angular/core';
import {Field} from "./field";
import {StateService} from "./state.service";

@Component({
  moduleId: module.id,
  selector: 'field-select',
  template: `
    <div class="field-select">
        <div *ngFor="let field of fields">
          <div class="form-check">
            <label class="form-check-label">
              <input [(ngModel)]="field.enable" (ngModelChange)="onChanges($event)" class="form-check-input" type="checkbox" value="">
              {{field.name}}
            </label>
          </div>
          <nouislider *ngIf="field.field == 'id'" [connect]="true"
           [config]="rangeConfig" [(ngModel)]="field.filter" (ngModelChange)="onChanges($event)"></nouislider>
        </div>
    </div>
  `,
})
export class FieldComponent implements OnInit{
  fields: Field[];

  rangeConfig: any = {
    connect: true,
    start: 1,
    range: {
      min: 0,
      max: 15000
    },
    step: 1
  };

  constructor(
    private stateService: StateService) { }

  ngOnInit(): void {
    this.fields = this.stateService.allFields;
  }

  onChanges(): void {
    this.stateService.fieldsTerms.next(this.fields.filter(f => f.enable))
  }
}
