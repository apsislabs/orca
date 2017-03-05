import _ from 'lodash';

class Orca {
    constructor({callbacks = {}, globalKey = '*', entryKey = '__orca'} = {}) {
        this._callbacks = callbacks;
        this._globalKey = globalKey;
        this._entryKey  = entryKey;
    }

	reset() {
		this._callbacks = {};
	}

    registerAction(namespace, callback, {priority = 0, excludes = []} = {}) {
        // Defend callbacks against foolish behavior
        if ( namespace.includes(this._entryKey) ) {
            throw new Error(`Registered namespace matches reserved entryKey: ${this._entryKey}.`);
        } else if ( !_.isFunction(callback) ) {
            throw new TypeError(`Cannot register callback of type: ${typeof callback}`);
        }

        // Get callbacks, return an empty object by default
        let key = `${namespace}.${this._entryKey}[${priority}]`;
        let callbacks = _.get(this._callbacks, key, []);
        if ( !_.isArray(excludes) ) { excludes = [excludes]; }

        _.set(this._callbacks, key, _.concat(callbacks, {func: callback, excludes: excludes}));
    }

    registerGlobalAction(callback, {priority = 0, excludes = []} = {}) {
        this.registerAction(this._globalKey, callback, {priority: priority, excludes: excludes});
    }

    run(namespaces = [], runGlobals = true) {
        if ( !_.isArray(namespaces) ) { namespaces = [namespaces]; }
        if ( runGlobals ) { namespaces.unshift(this._globalKey); }

        let called = namespaces;

        _.each(_.uniq(namespaces), (n) => { this._runNamespaces(n, called); });
    }

    _runNamespaces(namespace, called) {
        let entries = _.get(this._callbacks, namespace, {});
        let namespaces = getValuesDeep(entries, this._entryKey);

        _.forEach(namespaces, (n) => {
            _.forEach(_.reverse(n), (priorityLevel) => {
                _.forEach(priorityLevel, (callback) => {
                    let {func, excludes} = callback;
                    if (_.intersection(excludes, called).length > 0) { return false; }

                    if ( _.isFunction(func) ) {
                        func();
                    } else {
                        console.warn(`Attempted to execute a callback of type: ${typeof func}`);
                        console.warn("\t", func);
                    }
                });
            });
        });
    }
}

function getValuesDeep(haystack, needle) {
    let results = [];

    _.forEach(haystack, (v, k) => {
        if ( k === needle ) {
            results.push(v);
        } else {
            results = results.concat(getValuesDeep(v, needle));
        }
    });

    return results;
}

export { Orca as Orca };
export default new Orca();
