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
var FieldComponent = (function () {
    function FieldComponent(stateService) {
        this.stateService = stateService;
        this.fields = this.stateService.allFields;
    }
    FieldComponent.prototype.onDrop = function () {
        this.stateService.fieldsTerms.next(this.fields.filter(function (f) { return f.enable; }));
    };
    FieldComponent.prototype.onClearAll = function () {
        this.stateService.replaceFields(this.stateService.initCopy);
    };
    FieldComponent.prototype.getRangeConfig = function (field) {
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
    FieldComponent.prototype.onChanges = function () {
        this.stateService.fieldsTerms.next(this.fields.filter(function (f) { return f.enable; }));
        this.stateService.queryTerms.next(this.fields);
    };
    FieldComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'field-select',
            template: "\n    <div class=\"card field-select\">\n      <div class=\"card-header\">\n        Fields <button class=\"btn btn-sm btn-primary float-sm-right\" (click)=\"onClearAll($event)\">Default</button>\n      </div>\n      <div class=\"card-block\">\n        <ul class=\"list-group list-group-flush\" dnd-sortable-container [sortableData]=\"fields\">\n          <li class=\"list-group-item\" *ngFor=\"let field of fields; let i = index\" dnd-sortable [sortableIndex]=\"i\" (onDropSuccess)=\"onDrop($event)\">\n              <div class=\"form-check row\">\n                <div class=\"col-lg-9\">\n                    <label class=\"form-check-label\">\n                      <input [(ngModel)]=\"field.enable\" (ngModelChange)=\"onChanges($event)\" class=\"form-check-input\" type=\"checkbox\" value=\"\">\n                        {{field.userName}} {{field.name}}\n                    </label>\n                </div>\n                <div class=\"col-lg-3 field-settings\">\n                  <label *ngIf=\"field.field == 'image'\" class=\"form-check-label col-sm-1\">\n                    <input [(ngModel)]=\"field.big\" class=\"form-check-input\" type=\"checkbox\" value=\"\">\n                    <i class=\"fa fa-arrows-alt\"></i>\n                  </label>\n                  <label *ngIf=\"field.withFilter\" class=\"form-check-label col-sm-1\">\n                    <input [(ngModel)]=\"field.filterOn\" (ngModelChange)=\"onChanges($event)\" class=\"form-check-input\" type=\"checkbox\" value=\"\">\n                    <i class=\"fa fa-filter\"></i>\n                  </label>\n                </div>\n              </div>\n              <field-filter [field]=\"field\"></field-filter>\n        </ul>\n      </div>\n    </div>\n    \n  ",
        }), 
        __metadata('design:paramtypes', [state_service_1.StateService])
    ], FieldComponent);
    return FieldComponent;
}());
exports.FieldComponent = FieldComponent;
//# sourceMappingURL=field.component.js.map