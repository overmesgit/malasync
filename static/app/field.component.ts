import {Component}          from '@angular/core';
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
          <div *ngIf="field.withFilter && field.filterType == 'range'" >
            <!--<p>From: <input [(ngModel)]="field.numFilter[0]"/>To: <input [(ngModel)]="field.numFilter[1]"/></p>-->
            <nouislider [connect]="true" [config]="filterConfigs[field.field]"
             [(ngModel)]="field.numFilter" (ngModelChange)="onChanges($event)"></nouislider>
          </div>
        </div>
    </div>
  `,
})
export class FieldComponent{
  fields: Field[];

  filterConfigs: any = {};

  constructor(
    private stateService: StateService) {
    this.fields = this.stateService.allFields;
    for(let f of this.fields) {
      if(f.withFilter && f.filterType == 'range') {
        this.filterConfigs[f.field] = this.getRangeConfig(f.numFilterMin, f.numFilterMax, f.numFilterStep)
      }
    }
  }

  getRangeConfig(min: number, max: number, step: number): any {
    return {
      connect: true,
      start: 1,
      range: {
        min: min,
        max: max
      },
      step: step,
      tooltips: [true, true]
    };
  }

  onChanges(): void {
    this.stateService.fieldsTerms.next(this.fields.filter(f => f.enable))
  }
}
