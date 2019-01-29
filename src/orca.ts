import castArray from "lodash/castArray";
import cloneDeep from "lodash/cloneDeep";
import concat from "lodash/concat";
import forEach from "lodash/forEach";
import forEachRight from "lodash/forEachRight";
import get from "lodash/get";
import includes from "lodash/includes";
import intersection from "lodash/intersection";
import isFunction from "lodash/isFunction";
import set from "lodash/set";
import uniq from "lodash/uniq";

import {
  OrcaOptions,
  ActionOptions,
  CallbackDefinition,
  RunOptions
} from "./orca.d";

export class Orca {
  _defaultCallbacks: object;
  _callbacks: object;
  _globalKey: string;
  _entryKey: string;

  /**
   * Instantiate new Orca objcet
   * @constructor
   * @param {string} [globalKey=*]       key to use for global callbacks.
   * @param {string} [entryKey=__orca]   key to use for isolating callbacks.
   */
  constructor({ globalKey = "*", entryKey = "__orca" }: OrcaOptions = {}) {
    this._defaultCallbacks = {};
    this._callbacks = {};
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
   * @param {function}        func        Callback function to register.
   * @param {number}          [priority=0]    Priority for the callback call order.
   * @param {string|string[]} [excludes=[]]   Namespaces to exclude this callback.
   */
  registerAction(
    namespace: string,
    func: () => void,
    { priority = 0, excludes = [] }: ActionOptions = {}
  ): void {
    // Defend callbacks against foolish behavior
    if (includes(namespace, this._entryKey)) {
      throw new Error(
        `Registered namespace matches reserved entryKey: ${this._entryKey}.`
      );
    }

    if (!isFunction(func)) {
      throw new TypeError(`Registered callback must be a function.`);
    }

    // Cast excludes to an array
    let excludesArray: string[] = castArray(excludes);

    // Get callbacks, return an empty object by default
    let key: string = `${namespace}.${this._entryKey}[${priority}]`;
    let existingCallbacks: CallbackDefinition[] = get(this._callbacks, key, []);
    let newCallback: CallbackDefinition = { func, excludes: excludesArray };

    // Set the new callback
    set(this._callbacks, key, concat(existingCallbacks, newCallback));
  }

  /**
   * Shorthand for registering a global callback.
   * @param {function}        callback        Callback function to register.
   * @param {number}          [priority=0]    Priority for the callback call order.
   * @param {string|string[]} [excludes=[]]   Namespaces to exclude this callback.
   */
  registerGlobalAction(
    callback: () => void,
    { priority = 0, excludes = [] }: ActionOptions = {}
  ): void {
    this.registerAction(this._globalKey, callback, { priority, excludes });
  }

  /**
   * Run callbacks for given namespaces.
   * @param {string|string[]} [namespaces=[]]     Namespaces to run.
   * @param {boolean}         [runGlobals=true]   Run global callbacks.
   */
  run(
    namespaces: string | string[] = [],
    { runGlobals = true }: RunOptions = {}
  ): void {
    let called: string[] = castArray(namespaces);
    if (runGlobals) called.unshift(this._globalKey);

    forEach(uniq(called), n => {
      this._runNamespace(n, called);
    });
  }

  /**
   * Run a single namespace.
   * @param {string}      namespace   Namespaces to run.
   * @param {string[]}    called      All namespaces called to run.
   */
  _runNamespace(namespace: string, called: string[]) {
    let entries = get(this._callbacks, namespace, {});
    let namespaces: CallbackDefinition[][][] = getValuesDeep(
      entries,
      this._entryKey
    );

    // Iterate over all namespaces
    forEach(namespaces, (n: CallbackDefinition[][]) => {
      forEachRight(n, (priorityLevel: CallbackDefinition[]) => {
        forEach(priorityLevel, (callback: CallbackDefinition) => {
          let { func, excludes } = callback;

          if (intersection(excludes, called).length > 0) {
            return false;
          }

          func();
        });
      });
    });
  }
}

/**
 * Deeply search an object for a needle
 * @param  {any[]|object}   haystack    Iterable object to search
 * @param  {}               needle      Value or object to search for
 * @return {Array}                      Array of matching values
 */
function getValuesDeep(haystack: any[] | object, needle: any): any[] {
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
