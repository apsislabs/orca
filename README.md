# orca

[![Build Status](https://travis-ci.org/apsislabs/orca.svg?branch=master)](https://travis-ci.org/apsislabs/orca) [![Coverage Status](https://coveralls.io/repos/github/apsislabs/orca/badge.svg?branch=feature%2Fexcludes)](https://coveralls.io/github/apsislabs/orca?branch=feature%2Fexcludes)

---

A code wrapper for real-world javascript separation.

## Usage

Install from `npm`:

```
npm install --save orcajs
```

Import that wrapper for use throughout your application:

```js
import app from 'orcajs';
app.registerAction('*', () => { console.log("test"); });
app.run(); // => test
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

if ( $('#special-div').length > 0 ) {
    // this will break if #special-div is not present
}
```

If that looks familiar, then `orca` is for you.

## What it does

`orca` lets you set up ordered an ordered system of callbacks for dividing your code into discretely executing chunks. This lets you bundle all your code into a single JS file, but limit your `react` component just to the pages they're used on.

```js
import app from 'orcajs';

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

app.registerAction('foo', foo);
app.registerAction('bar', bar);

app.run('foo'); // => log All, Foo
```

## Namespacing

Our system of namespaces allow you to run code in a very structured way.

```js
app.registerAction('*', globalAction);    // default global namespace
app.registerAction('foo', fooAction);     // foo namespace
app.registerAction('bar', barAction);     // bar namespace

app.run('foo');    // runs globals and actions in foo namespace
```

Calling `run` with a namespace will run only the actions in that namespace. Namespaces can be nested, too:

```js
app.registerAction('foo.bar', fooBarAction);
app.registerAction('foo.baz', fooBazAction);

app.run('foo');    // run actions in both foo.bar and foo.baz
```

## Priority

Sometimes sequencing can be important when executing discrete blocks of code. There's an optional third parameter which can be passed to `registerAction`, which will set the priority. Actions will be run in priority order from high to low.

```js
app.registerAction('*', foo, 0);
app.registerAction('*', bar, 5);   // this will run before foo
```
