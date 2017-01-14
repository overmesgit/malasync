export class Field {
  name: string;
  shortName: string;
  field: string;
  enable: boolean;
  filter: any;

  constructor(field: string, name: string, shortName: string, enable: boolean, filter: any) {
    this.field = field;
    this.name = name;
    this.shortName = shortName;
    this.enable = enable;
    this.filter = filter;
  }

}
