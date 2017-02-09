import { IMyDateRangeModel } from 'mydaterangepicker';

export class Field {
  name: string;
  shortName: string;
  field: string;
  enable: boolean;
  big: boolean;

  withSort: boolean;
  sort: string;

  withFilter: boolean;
  filterOn: boolean;
  filterType: string;
  exclude: boolean;
  orNull: boolean;

  numFilterMax: number;
  numFilterMin: number;
  numFilterStep: number;
  numFilter: [number, number];

  selectValues: string[];
  selectFilter: string[];

  dateFilter: IMyDateRangeModel;

  userName: string;

  constructor(field: string, name: string, shortName: string, enable: boolean) {
    this.field = field;
    this.name = name;
    this.shortName = shortName;
    this.enable = enable;
    this.big = false;

    this.withFilter = false;
    this.filterOn = false;
  }

  getQuery(): any {
    let res = {'field': this.field, 'enable': this.enable};
    if (this.filterOn) {
      res['exclude'] = this.exclude;
      res['orNull'] = this.orNull;
      if (this.numFilter) {
        res['filter'] = this.numFilter;
      }
      if (this.selectFilter) {
        res['filter'] = this.selectFilter;
      }
      if (this.dateFilter) {
        res['filter'] = [this.dateFilter.beginEpoc, this.dateFilter.endEpoc]
      }
    }
    if (this.sort) {
      res['sort'] = this.sort;
    }
    if (this.userName) {
      res['userName'] = this.userName;
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

    this.numFilter = [min, max];
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

  withDateFilter(): Field {
    this.withFilter = true;
    this.filterType = 'date';
    return this;
  }

  withSorting(direction?: string): Field {
    this.withSort = true;
    this.sort = direction;

    return this;
  }

  withUser(userName: string): Field {
    this.userName = userName;
    return this;
  }
}
