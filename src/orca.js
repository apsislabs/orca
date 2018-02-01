import _ from 'lodash';

/** Class for organizing javascript callbacks. */
class Orca {
    /**
     * Instantiate new Orca objcet
     * @constructor
     * @param {Object} [callbacks={}]      the default callbacks object.
     * @param {string} [globalKey=*]       key to use for global callbacks.
     * @param {string} [entryKey=__orca]   key to use for isolating callbacks.
     */
    constructor({callbacks = {}, globalKey = '*', entryKey = '__orca'} = {}) {
        this._defaultCallbacks = callbacks;
        this._callbacks = callbacks;
        this._globalKey = globalKey;
        this._entryKey  = entryKey;
    }

    /**
     * Empty the callbacks object
     */
    reset() {
        this._callbacks = _.cloneDeep(this._defaultCallbacks);
    }

    /**
     * Register an action with the Orca instance
     * @param {string}          namespace       Namespace to register the callback with.
     * @param {function}        callback        Callback function to register.
     * @param {number}          [priority=0]    Priority for the callback call order.
     * @param {string|string[]} [excludes=[]]   Namespaces to exclude this callback.
     */
    registerAction(namespace, callback, {priority = 0, excludes = []} = {}) {
        // Defend callbacks against foolish behavior
        if ( _.includes(namespace, this._entryKey) ) {
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

    /**
     * Shorthand for registering a global callback.
     * @param {function}        callback        Callback function to register.
     * @param {number}          [priority=0]    Priority for the callback call order.
     * @param {string|string[]} [excludes=[]]   Namespaces to exclude this callback.
     */
    registerGlobalAction(callback, {priority = 0, excludes = []} = {}) {
        this.registerAction(this._globalKey, callback, {priority: priority, excludes: excludes});
    }

    /**
     * Run callbacks for given namespaces.
     * @param {string|string[]} [namespaces=[]]     Namespaces to run.
     * @param {boolean}         [runGlobals=true]   Run global callbacks.
     */
    run(namespaces = [], {runGlobals = true} = {}) {
        if ( !_.isArray(namespaces) ) { namespaces = [namespaces]; }
        if ( runGlobals ) { namespaces.unshift(this._globalKey); }

        let called = namespaces;

        _.each(_.uniq(namespaces), (n) => { this._runNamespace(n, called); });
    }

    /**
     * Run a single namespace.
     * @param {string}      namespace   Namespaces to run.
     * @param {string[]}    called      All namespaces called to run.
     */
    _runNamespace(namespace, called) {
        let entries = _.get(this._callbacks, namespace, {});
        let namespaces = getValuesDeep(entries, this._entryKey);

        _.forEach(namespaces, (n) => {
            _.forEach(_.reverse(n), (priorityLevel) => {
                _.forEach(priorityLevel, (callback) => {
                    let {func, excludes} = callback;
                    if (_.intersection(excludes, called).length > 0) { return false; }
                    if ( _.isFunction(func) ) { func(); }
                });
            });
        });
    }
}

/**
 * Deeply search an object for a needle
 * @param  {Array|Object}   haystack    Iterable object to search
 * @param  {}               needle      Value or object to search for
 * @return {Array}                      Array of matching values
 */
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
