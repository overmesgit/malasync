"use strict";
var Field = (function () {
    function Field(field, name, shortName, enable) {
        this.field = field;
        this.name = name;
        this.shortName = shortName;
        this.enable = enable;
        this.big = false;
        this.withFilter = false;
        this.filterOn = false;
    }
    Field.prototype.getQuery = function () {
        var res = { 'field': this.field, 'enable': this.enable };
        if (this.filterOn) {
            res['exclude'] = this.exclude;
            res['orNull'] = this.orNull;
            if (this.numFilter) {
                res['filter'] = this.numFilter;
            }
            if (this.selectFilter) {
                res['filter'] = this.selectFilter;
            }
            if (this.filterType == 'date') {
                if (this.dateFilter) {
                    res['filter'] = [this.dateFilter.beginEpoc, this.dateFilter.endEpoc];
                }
                else {
                    res['filter'] = null;
                }
            }
        }
        if (this.sort) {
            res['sort'] = this.sort;
        }
        if (this.userName) {
            res['userName'] = this.userName;
        }
        return res;
    };
    Field.prototype.withNumFilter = function (min, max, step, init) {
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
            this.filterOn = true;
            this.numFilter = init;
        }
        return this;
    };
    Field.prototype.withSelectFilter = function (values) {
        this.withFilter = true;
        this.filterType = 'select';
        this.selectValues = values;
        return this;
    };
    Field.prototype.withDateFilter = function () {
        this.withFilter = true;
        this.filterType = 'date';
        return this;
    };
    Field.prototype.withSorting = function (direction) {
        this.withSort = true;
        this.sort = direction;
        return this;
    };
    Field.prototype.withUser = function (userName) {
        this.userName = userName;
        return this;
    };
    return Field;
}());
exports.Field = Field;
//# sourceMappingURL=field.js.map