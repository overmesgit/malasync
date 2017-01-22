

export class Field {
  name: string;
  shortName: string;
  field: string;
  enable: boolean;

  withSort: boolean;
  sort: string;

  withFilter: boolean;
  filterOn: boolean;
  filterType: string;

  numFilterMax: number;
  numFilterMin: number;
  numFilterStep: number;
  numFilter: [number, number];

  selectValues: string[];
  selectFilter: string[];

  constructor(field: string, name: string, shortName: string, enable: boolean) {
    this.field = field;
    this.name = name;
    this.shortName = shortName;
    this.enable = enable;

    this.withFilter = false;
    this.filterOn = false;
  }

  getQuery(): any {
    let res = {'field': this.field};
    if (this.numFilter) {
      res['filter'] = this.numFilter;
    }
    if (this.selectFilter) {
      res['filter'] = this.selectFilter;
    }
    if (this.sort) {
      res['sort'] = this.sort;
    }
    return res;
  }

  withNumFilter(min: number, max: number, step?: number, init?: [number, number]) {
    this.withFilter = true;
    this.filterType = 'range';
    this.numFilterMin = min;
    this.numFilterMax = max;

    this.numFilterStep = 1;
    if (step) {
      this.numFilterStep = step;
    }

    if (init) {
      this.numFilter = init;
    }
    return this;
  }

  withSelectFilter(values: string[]): Field {
    this.withFilter = true;
    this.filterType = 'select';
    this.selectValues = values;
    return this;
  }

  withSorting(direction?: string): Field {
    this.withSort = true;
    this.sort = direction;

    return this;
  }
}
