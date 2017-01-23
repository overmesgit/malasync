import {Component}          from '@angular/core';
import {Field} from "./field";
import {StateService} from "./state.service";
import {SelectComponent} from "ng2-select/ng2-select";

@Component({
  moduleId: module.id,
  selector: 'field-select',
  template: `
    <div class="field-select">
        <div *ngFor="let field of fields">
          <div class="form-check row">
            <div class="col-sm-8">
                <label class="form-check-label">
                  <input [(ngModel)]="field.enable" (ngModelChange)="onChanges($event)" class="form-check-input" type="checkbox" value="">
                    {{field.name}}
                </label>
            </div>
            <div *ngIf="field.withFilter" class="col-sm-4">
               <label class="form-check-label col-sm-1">
                <input [(ngModel)]="field.filterOn" (ngModelChange)="onChanges($event)" class="form-check-input" type="checkbox" value="">
                Filter
              </label>
            </div>
          </div>
          <div *ngIf="field.filterOn" class="filters">
            <div class="row">
                <div class="offset-sm-1 col-sm-11">
                    <div class="form-check row">
                      <div class="col-sm-5">
                        <label class="form-check-label">
                          <input [(ngModel)]="field.exclude" (ngModelChange)="onChanges($event)" class="form-check-input" type="checkbox" value="">
                          Exclude
                        </label>
                      </div>
                      <div class="col-sm-4">
                        <label class="form-check-label">
                          <input [(ngModel)]="field.orNull" (ngModelChange)="onChanges($event)" class="form-check-input" type="checkbox" value="">
                          OrNull
                        </label>
                      </div>
                    
                  </div>
                  <div *ngIf="field.filterType == 'range'" >
                  <!--<p>From: <input [(ngModel)]="field.numFilter[0]"/>To: <input [(ngModel)]="field.numFilter[1]"/></p>-->
                  <nouislider [connect]="true" [config]="filterConfigs[field.field]" 
                      [(ngModel)]="field.numFilter" (ngModelChange)="onChanges($event)"></nouislider>
                  </div>
                  <div *ngIf="field.filterType == 'select'" >
                    <ng-select [multiple]="true" [items]="field.selectValues" (data)="onSelect($event, field)">
                    </ng-select>
                </div>
                </div>
            </div>
            
          </div>
        </div>
    </div>
  `,
})
export class FieldComponent {
  fields: Field[];

  filterConfigs: any = {};

  constructor(private stateService: StateService) {
    this.fields = this.stateService.allFields;
    for (let f of this.fields) {
      if (f.withFilter && f.filterType == 'range') {
        this.filterConfigs[f.field] = this.getRangeConfig(f.numFilterMin, f.numFilterMax, f.numFilterStep)
      }
    }
  }

  onSelect(selectedValues: any[], field: Field): void {
    field.selectFilter = selectedValues.length ? selectedValues.map(v => v.id) : null;
    this.stateService.fieldsTerms.next(this.fields.filter(f => f.enable));
    this.stateService.queryTerms.next(this.fields);
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
    this.stateService.fieldsTerms.next(this.fields.filter(f => f.enable));
    this.stateService.queryTerms.next(this.fields);
  }
}
