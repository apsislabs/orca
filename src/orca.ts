import castArray from "lodash/castArray";
import cloneDeep from "lodash/cloneDeep";
import concat from "lodash/concat";
import forEach from "lodash/forEach";
import get from "lodash/get";
import includes from "lodash/includes";
import intersection from "lodash/intersection";
import isArray from "lodash/isArray";
import isFunction from "lodash/isFunction";
import reverse from "lodash/reverse";
import set from "lodash/set";
import uniq from "lodash/uniq";

interface OrcaOptions {
  callbacks?: any;
  globalKey?: string;
  entryKey?: string;
}

interface ActionOptions {
  priority?: number;
  excludes?: string | Array<string>;
}

interface RunOptions {
  runGlobals?: boolean;
}

/** Class for organizing javascript callbacks. */
export class Orca {
  _defaultCallbacks: object;
  _callbacks: object;
  _globalKey: string;
  _entryKey: string;

  /**
   * Instantiate new Orca objcet
   * @constructor
   * @param {Object} [callbacks={}]      the default callbacks object.
   * @param {string} [globalKey=*]       key to use for global callbacks.
   * @param {string} [entryKey=__orca]   key to use for isolating callbacks.
   */
  constructor({
    callbacks = {},
    globalKey = "*",
    entryKey = "__orca"
  }: OrcaOptions = {}) {
    this._defaultCallbacks = callbacks;
    this._callbacks = callbacks;
    this._globalKey = globalKey;
    this._entryKey = entryKey;
  }

  /**
   * Empty the callbacks object
   */
  reset() {
    this._callbacks = cloneDeep(this._defaultCallbacks);
  }

  /**
   * Register an action with the Orca instance
   * @param {string}          namespace       Namespace to register the callback with.
   * @param {function}        callback        Callback function to register.
   * @param {number}          [priority=0]    Priority for the callback call order.
   * @param {string|string[]} [excludes=[]]   Namespaces to exclude this callback.
   */
  registerAction(
    namespace: string,
    callback: () => any,
    { priority = 0, excludes = [] }: ActionOptions = {}
  ) {
    // Defend callbacks against foolish behavior
    if (includes(namespace, this._entryKey)) {
      throw new Error(
        `Registered namespace matches reserved entryKey: ${this._entryKey}.`
      );
    }

    if (!isFunction(callback)) {
      throw new TypeError(`Registered callback must be a function.`);
    }

    // Get callbacks, return an empty object by default
    let key = `${namespace}.${this._entryKey}[${priority}]`;
    let callbacks = get(this._callbacks, key, []);
    excludes = castArray(excludes);

    set(
      this._callbacks,
      key,
      concat(callbacks, { func: callback, excludes: excludes })
    );
  }

  /**
   * Shorthand for registering a global callback.
   * @param {function}        callback        Callback function to register.
   * @param {number}          [priority=0]    Priority for the callback call order.
   * @param {string|string[]} [excludes=[]]   Namespaces to exclude this callback.
   */
  registerGlobalAction(
    callback: () => any,
    { priority = 0, excludes = [] }: ActionOptions = {}
  ) {
    this.registerAction(this._globalKey, callback, {
      priority: priority,
      excludes: excludes
    });
  }

  /**
   * Run callbacks for given namespaces.
   * @param {string|string[]} [namespaces=[]]     Namespaces to run.
   * @param {boolean}         [runGlobals=true]   Run global callbacks.
   */
  run(
    namespaces: string | Array<string> = [],
    { runGlobals = true }: RunOptions = {}
  ) {
    if (!isArray(namespaces)) {
      namespaces = [namespaces];
    }

    if (runGlobals) {
      namespaces.unshift(this._globalKey);
    }

    let called = namespaces;

    forEach(uniq(namespaces), n => {
      this._runNamespace(n, called);
    });
  }

  /**
   * Run a single namespace.
   * @param {string}      namespace   Namespaces to run.
   * @param {string[]}    called      All namespaces called to run.
   */
  _runNamespace(namespace: string, called: Array<string>) {
    let entries = get(this._callbacks, namespace, {});
    let namespaces = getValuesDeep(entries, this._entryKey);

    forEach(namespaces, n => {
      forEach(reverse(n), priorityLevel => {
        forEach(priorityLevel, callback => {
          let { func, excludes } = callback;
          if (intersection(excludes, called).length > 0) {
            return false;
          }
          if (isFunction(func)) {
            func();
          }
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
function getValuesDeep(haystack: Array<any> | object, needle: any) {
  let results = [];

  forEach(haystack, (v: any, k: string | number) => {
    if (k === needle) {
      results.push(v);
    } else {
      results = results.concat(getValuesDeep(v, needle));
    }
  });

  return results;
}

export default new Orca();
