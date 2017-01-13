import {Injectable}    from '@angular/core';
import {Field} from "./field";
import {BehaviorSubject} from "rxjs/BehaviorSubject";

let init_fields: Field[] = [
  new Field("id", true),
  new Field("type", true),
  new Field("title", true),
  new Field("members_score", true),
  new Field("aired_from", true),
  new Field("aired_to", true),
  new Field("duration", false),
  new Field("english", false),
  new Field("episodes", false),
  new Field("favorites", false),
  new Field("genres", true),
  new Field("image", false),
  new Field("japanese", false),
  new Field("members", true),
  new Field("related", true),
  new Field("producers", false),
  new Field("rating", true),
  new Field("scores", true),
  new Field("status", true),
  new Field("synopsis", false),
];

@Injectable()
export class FieldService{
  public allFields = init_fields;
  public fieldsTerms = new BehaviorSubject<Field[]>(init_fields.filter(f => f.enable));
  public currentPage = new BehaviorSubject(1);
  public titlesCount = new BehaviorSubject(1);
}
