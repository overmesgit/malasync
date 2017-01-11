import {Component, OnInit}          from '@angular/core';
import {FieldService} from "./field.service";
import {Field} from "./field";

@Component({
  moduleId: module.id,
  selector: 'field-select',
  template: `
      <p *ngFor="let field of fields">
        {{field.name}}:<input type="checkbox" [(ngModel)]="field.enable" (ngModelChange)="onChanges($event)"/>
      </p>
  `,
})
export class FieldComponent implements OnInit{
  fields: Field[];

  constructor(
    private fieldService: FieldService) { }

  ngOnInit(): void {
    this.fields = this.fieldService.allFields;
  }

  onChanges(): void {
    this.fieldService.fieldsTerms.next(this.fields.filter(f => f.enable))
  }
}
