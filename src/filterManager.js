define([
    "./utils",
    "./filterComponent",
    "./filterModel",
    "css!./filter.css"
], function(utils, filterComponentFactory, filterModelFactory) {

    function FilterManager(grid) {
        this.grid = grid;
        this.colModels = {};
    }

    FilterManager.prototype.isFilterPresent = function () {
        return Object.keys(this.colModels).length > 0;
    };

    FilterManager.prototype.isFilterPresentForCol = function (key) {
        var model =  this.colModels[key];
        var filterPresent = model!==undefined && model.isFilterActive();
        return filterPresent;
    };

    FilterManager.prototype.doesFilterPass = function (item) {
        var fields = Object.keys(this.colModels);
        for (var i = 0, l = fields.length; i < l; i++) {

            var field = fields[i];
            var model = this.colModels[field];

            //if no filter, always pass
            if (model===undefined) {
                continue;
            }

            var value = item[field];
            if (!model.doesFilterPass(value)) {
                return false;
            }

        }
        //all filters passed
        return true;
    };

    FilterManager.prototype.clearAllFilters = function() {
        this.colModels = {};
    };

    FilterManager.prototype.positionPopup = function(eventSource, ePopup, ePopupRoot) {
        var sourceRect = eventSource.getBoundingClientRect();
        var parentRect = ePopupRoot.getBoundingClientRect();

        var x = sourceRect.left - parentRect.left;
        var y = sourceRect.top - parentRect.top + sourceRect.height;

        ePopup.style.left = x + "px";
        ePopup.style.top = y + "px";
    };

    FilterManager.prototype.showFilter = function(colDef, eventSource) {

        var model = this.colModels[colDef.field];
        if (!model) {
            var rowData = this.grid.getRowData();
            var uniqueValues = utils.uniqueValues(rowData, colDef.field);
            if (colDef.comparator) {
                uniqueValues.sort(colDef.comparator);
            } else {
                uniqueValues.sort();
            }
            model = filterModelFactory(uniqueValues);
            this.colModels[colDef.field] = model;
        }

        var ePopupParent = this.grid.getPopupParent();
        var filterComponent = filterComponentFactory(model, this.grid, colDef);
        var eFilterGui = filterComponent.getGui();

        this.positionPopup(eventSource, eFilterGui, ePopupParent)

        utils.addAsModalPopup(ePopupParent, eFilterGui);

        filterComponent.guiAttached();
    };

    return function(eBody) {
        return new FilterManager(eBody);
    };

});