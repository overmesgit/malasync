import {Injectable, EventEmitter, OnInit}    from '@angular/core';
import {Field} from "./field";
import { Subject }           from 'rxjs/Subject';

@Injectable()
export class FieldService{
  private fieldsTerms = new Subject<Field[]>();
  private fields: Field[];

  getFields(): Field[] {
    return this.fields;
  }

  getFieldsSubject(): Subject<Field[]> {
    return this.fieldsTerms;
  }

  nextFields(nextFields: Field[]): void {
    this.fields = nextFields;
    this.fieldsTerms.next(nextFields);
  }
}
