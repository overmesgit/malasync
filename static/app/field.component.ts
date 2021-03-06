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
        Fields <button class="btn btn-sm btn-primary float-sm-right" (click)="onClearAll($event)">Default</button>
      </div>
      <div class="card-block">
        <ul class="list-group list-group-flush" dnd-sortable-container [sortableData]="fields">
          <li class="list-group-item" *ngFor="let field of fields; let i = index" dnd-sortable [sortableIndex]="i" (onDropSuccess)="onDrop($event)">
              <div class="form-check row">
                <div class="col-lg-9">
                    <label class="form-check-label">
                      <input [(ngModel)]="field.enable" (ngModelChange)="onChanges($event)" class="form-check-input" type="checkbox" value="">
                        {{field.userName}} {{field.name}}
                    </label>
                </div>
                <div class="col-lg-3 field-settings">
                  <label *ngIf="field.field == 'image'" class="form-check-label col-sm-1">
                    <input [(ngModel)]="field.big" class="form-check-input" type="checkbox" value="">
                    <i class="fa fa-arrows-alt"></i>
                  </label>
                  <label *ngIf="field.withFilter" class="form-check-label col-sm-1">
                    <input [(ngModel)]="field.filterOn" (ngModelChange)="onChanges($event)" class="form-check-input" type="checkbox" value="">
                    <i class="fa fa-filter"></i>
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

  onDrop(): void {
    this.stateService.fieldsTerms.next(this.fields.filter(f => f.enable));
  }

  onClearAll(): void {
    this.stateService.replaceFields(this.stateService.initCopy);
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
