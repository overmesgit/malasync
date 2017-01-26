import {Component}          from '@angular/core';
import {Field} from "./field";
import {StateService} from "./state.service";
import {SelectComponent} from "ng2-select/ng2-select";

@Component({
  moduleId: module.id,
  selector: 'field-select',
  template: `
    <div class="card field-select">
      <div class="card-header">
        Fields
      </div>
      <div class="card-block">
        <ul class="list-group list-group-flush">
          <li class="list-group-item" *ngFor="let field of fields">
              <div class="form-check row">
                <div class="col-sm-8">
                    <label class="form-check-label">
                      <input [(ngModel)]="field.enable" (ngModelChange)="onChanges($event)" class="form-check-input" type="checkbox" value="">
                        {{field.userName}} {{field.name}}
                    </label>
                </div>
                <div *ngIf="field.withFilter" class="col-sm-4">
                   <label class="form-check-label col-sm-1">
                    <input [(ngModel)]="field.filterOn" (ngModelChange)="onChanges($event)" class="form-check-input" type="checkbox" value="">
                    Filter
                  </label>
                </div>
              </div>
              <field-filter [field]="field"></field-filter>
        </ul>
      </div>
    </div>
    
  `,
})
export class FieldComponent {
  fields: Field[];

  constructor(private stateService: StateService) {
    this.fields = this.stateService.allFields;
  }

  onSelect(selectedValues: any[], field: Field): void {
    field.selectFilter = selectedValues.length ? selectedValues.map(v => v.id) : null;
    this.stateService.fieldsTerms.next(this.fields.filter(f => f.enable));
    this.stateService.queryTerms.next(this.fields);
  }

  getRangeConfig(field: Field): any {
    return {
      connect: true,
      start: 1,
      range: {
        min: field.numFilterMin,
        max: field.numFilterMax
      },
      step: field.numFilterStep,
      tooltips: [true, true]
    };
  }

  onChanges(): void {
    this.stateService.fieldsTerms.next(this.fields.filter(f => f.enable));
    this.stateService.queryTerms.next(this.fields);
  }
}
