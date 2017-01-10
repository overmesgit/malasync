import {Component, OnInit}          from '@angular/core';
import {FieldService} from "./field.service";
import {Field} from "./field";

let init_fields: Field[] = [
  new Field("id", true),
  new Field("type", true),
  new Field("title", true),
  new Field("members_score", true),
  new Field("last_update", true),
  new Field("aired_from", true),
  new Field("aired_to", true),
  new Field("duration", true),
  new Field("english", true),
  new Field("episodes", true),
  new Field("favorites", true),
  new Field("genres", true),
  new Field("image", true),
  new Field("japanese", true),
  new Field("members", true),
  new Field("related", true),
  new Field("producers", true),
  new Field("rating", true),
  new Field("scores", true),
  new Field("status", true),
  new Field("synopsis", true),
];

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
    this.fields = init_fields;
    this.onChanges();
  }

  onChanges(): void {
    this.fieldService.nextFields(this.fields.filter(f => f.enable))
  }
}
