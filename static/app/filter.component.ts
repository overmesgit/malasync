import {Component}          from '@angular/core';
import {Field} from "./field";
import {StateService} from "./state.service";
import {SelectComponent} from "ng2-select/ng2-select";
import {IMyOptions} from "mydatepicker";

@Component({
  moduleId: module.id,
  selector: 'field-filter',
  inputs: ['field'],
  template: `
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
                <div class="col-sm-5">
                  <label class="form-check-label">
                    <input [(ngModel)]="field.orNull" (ngModelChange)="onChanges($event)" class="form-check-input" type="checkbox" value="">
                    None
                  </label>
                </div>
            </div>
            <div *ngIf="field.filterType == 'range'" >
            <!--<p>From: <input [(ngModel)]="field.numFilter[0]"/>To: <input [(ngModel)]="field.numFilter[1]"/></p>-->
            <nouislider [connect]="true" [config]="getRangeConfig(field)" 
                [(ngModel)]="field.numFilter" (ngModelChange)="onChanges($event)"></nouislider>
            </div>
            <div *ngIf="field.filterType == 'select'" >
              <ng-select [multiple]="true" [items]="field.selectValues" [active]="field.selectFilter" (data)="onSelect($event, field)">
              </ng-select>
            </div>
            <div *ngIf="field.filterType == 'date'" >
                <my-date-range-picker [options]="dateOptions" (dateRangeChanged)="onChanges($event)"
                    [(ngModel)]="field.dateFilter"></my-date-range-picker>
            </div>
          </div>
      </div>
    </div>
  `,
})
export class FilterComponent {
  fields: Field[];
  field: Field;

  private dateOptions: IMyOptions = {
      dateFormat: 'dd.mm.yyyy',
      width: '95%',
      selectionTxtFontSize: '14px'
  };

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
