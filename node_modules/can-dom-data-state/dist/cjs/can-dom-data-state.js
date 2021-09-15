/*can-dom-data-state@0.1.1#can-dom-data-state*/
'use strict';
var namespace = require('can-namespace');
var CID = require('can-cid');
var data = {};
var isEmptyObject = function (obj) {
    for (var prop in obj) {
        return false;
    }
    return true;
};
var setData = function (name, value) {
    var id = CID(this);
    var store = data[id] || (data[id] = {});
    if (name !== undefined) {
        store[name] = value;
    }
    return store;
};
var deleteNode = function () {
    var id = CID.get(this);
    var nodeDeleted = false;
    if (id && data[id]) {
        nodeDeleted = true;
        delete data[id];
    }
    return nodeDeleted;
};
var domDataState = {
    _data: data,
    getCid: function () {
        return CID.get(this);
    },
    cid: function () {
        return CID(this);
    },
    expando: CID.domExpando,
    get: function (key) {
        var id = CID.get(this), store = id && data[id];
        return key === undefined ? store : store && store[key];
    },
    set: setData,
    clean: function (prop) {
        var id = CID.get(this);
        var itemData = data[id];
        if (itemData && itemData[prop]) {
            delete itemData[prop];
        }
        if (isEmptyObject(itemData)) {
            deleteNode.call(this);
        }
    },
    delete: deleteNode
};
if (namespace.domDataState) {
    throw new Error('You can\'t have two versions of can-dom-data-state, check your dependencies');
} else {
    module.exports = namespace.domDataState = domDataState;
}