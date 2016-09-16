# wraptor

A code wrapper for real-world javascript separation.

## Usage

Install from `npm`:

```
npm install --save wraptor
```

Set up a singleton for your application wrapper:

```js
import Wraptor from 'wraptor';
export default let wrap = new Wraptor();
```

Import that wrapper for use throughout your application:

```js
import wrap from 'wrap.js';
wrap.registerAction('*', () => { console.log("test"); });
wrap.run();
```

## What the hell does that mean

In a perfect world, you'd have a small, perfect javascript bundle, built of magic and rainbows. It would be fast, efficient, with full test coverage, and compatible with every browser.

But we know that's not the world you live in. If you're working on anything like any of the web apps we've seen over the past 5 years, you've got some frankenstein monster that's half legacy jQuery and half "I learned this in a weekend" Angular --- and worse, you've probably got something like this:

```js
if ($('body').hasClass('special-page')) {
    // execute code that only works on this page here.
    // Don't execute it anywhere else or everything
    // will break.
}
```

If that looks familiar, then `wraptor` is for you.

## What it does

`Wraptor` lets you set up ordered an ordered system of callbacks for dividing your code into discretely executing chunks. This lets you bundle all your code into a single JS file, but limit your `react` component just to the pages they're used on.

```js
import Wraptor from 'wraptor';

let wrap = new Wrapter();

// Run on all pages
function all() {
    console.log("All");
}

// Only run on foo pages
function foo() {
    console.log("Foo");
}

// Only run on bar pages
function bar() {
    console.log("Bar");
}

wrap.registerAction('foo', foo);
wrap.registerAction('bar', bar);

wrap.run('foo'); // => log All, Foo
```

## Namespacing

Our system of namespaces allow you to run code in a very structured way.

```js
wrap.registerAction('*', globalAction);    // default global namespace
wrap.registerAction('foo', fooAction);     // foo namespace
wrap.registerAction('bar', barAction);     // bar namespace

wrap.run('foo');                // runs globals and actions in foo namespace
```

Calling `run` with a namespace will run only the actions in that namespace. Namespaces can be nested, too:

```js
wrap.registerAction('foo.bar', fooBarAction);
wrap.registerAction('foo.baz', fooBazAction);

wrap.run('foo'); // run actions in both foo.bar and foo.baz
```

## Priority

Sometimes sequencing can be important when executing discrete blocks of code. There's an optional third parameter which can be passed to `registerAction`, which will set the priority. Actions will be run in priority order from high to low.

```js
wrap.registerAction('*', foo, 0);
wrap.registerAction('*', bar, 5);   // this will run before foo
```
