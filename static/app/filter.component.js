"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('@angular/core');
var state_service_1 = require("./state.service");
var FilterComponent = (function () {
    function FilterComponent(stateService) {
        this.stateService = stateService;
        this.dateOptions = {
            dateFormat: 'dd.mm.yyyy',
            width: '95%',
            selectionTxtFontSize: '14px'
        };
        this.fields = this.stateService.allFields;
    }
    FilterComponent.prototype.onSelect = function (selectedValues, field) {
        field.selectFilter = selectedValues.length ? selectedValues.map(function (v) { return v.id; }) : null;
        this.stateService.fieldsTerms.next(this.fields.filter(function (f) { return f.enable; }));
        this.stateService.queryTerms.next(this.fields);
    };
    FilterComponent.prototype.getRangeConfig = function (field) {
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
    };
    FilterComponent.prototype.onChanges = function () {
        this.stateService.fieldsTerms.next(this.fields.filter(function (f) { return f.enable; }));
        this.stateService.queryTerms.next(this.fields);
    };
    FilterComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'field-filter',
            inputs: ['field'],
            template: "\n    <div *ngIf=\"field.filterOn\" class=\"filters\">\n      <div class=\"row\">\n          <div class=\"offset-sm-1 col-sm-11\">\n              <div class=\"form-check row\">\n                <div class=\"col-sm-5\">\n                  <label class=\"form-check-label\">\n                    <input [(ngModel)]=\"field.exclude\" (ngModelChange)=\"onChanges($event)\" class=\"form-check-input\" type=\"checkbox\" value=\"\">\n                    Exclude\n                  </label>\n                </div>\n                <div class=\"col-sm-5\">\n                  <label class=\"form-check-label\">\n                    <input [(ngModel)]=\"field.orNull\" (ngModelChange)=\"onChanges($event)\" class=\"form-check-input\" type=\"checkbox\" value=\"\">\n                    None\n                  </label>\n                </div>\n            </div>\n            <div *ngIf=\"field.filterType == 'range'\" >\n            <!--<p>From: <input [(ngModel)]=\"field.numFilter[0]\"/>To: <input [(ngModel)]=\"field.numFilter[1]\"/></p>-->\n            <nouislider [connect]=\"true\" [config]=\"getRangeConfig(field)\" \n                [(ngModel)]=\"field.numFilter\" (ngModelChange)=\"onChanges($event)\"></nouislider>\n            </div>\n            <div *ngIf=\"field.filterType == 'select'\" >\n              <ng-select [multiple]=\"true\" [items]=\"field.selectValues\" [active]=\"field.selectFilter\" (data)=\"onSelect($event, field)\">\n              </ng-select>\n            </div>\n            <div *ngIf=\"field.filterType == 'date'\" >\n                <my-date-range-picker [options]=\"dateOptions\" (dateRangeChanged)=\"onChanges($event)\"\n                    [(ngModel)]=\"field.dateFilter\"></my-date-range-picker>\n            </div>\n          </div>\n      </div>\n    </div>\n  ",
        }), 
        __metadata('design:paramtypes', [state_service_1.StateService])
    ], FilterComponent);
    return FilterComponent;
}());
exports.FilterComponent = FilterComponent;
//# sourceMappingURL=filter.component.js.map