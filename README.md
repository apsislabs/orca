# orca

[![Build Status](https://travis-ci.org/apsislabs/orca.svg?branch=master)](https://travis-ci.org/apsislabs/orca) [![Coverage Status](https://coveralls.io/repos/github/apsislabs/orca/badge.svg)](https://coveralls.io/github/apsislabs/orca)

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

`orca` lets you set up ordered an ordered system of callbacks for dividing your code into discretely executing chunks. This lets you bundle all your code into a single JS file, but limit code to just to the pages they're used on.

```js
import app from 'orcajs';

// Define Callbacks
function all() { console.log("All"); }
function foo() { console.log("Foo"); }
function bar() { console.log("Bar"); }

// Register Actions
app.registerGlobalAction(all);
app.registerAction('foo', foo);
app.registerAction('bar', bar);

app.run('foo'); // => log All, Foo
```

## Namespacing

Namespacing allows you to run code in a structured way. Calling `run` with a namespace will run only the actions in that namespace.

```js
app.registerGlobalAction(all);   // global namespace
app.registerAction('foo', foo);  // foo namespace
app.registerAction('bar', bar);  // bar namespace

app.run('foo');    // runs `all` and `foo`, but not `bar`
```

### Nesting

Namespaces can be nested with the `.` character:

```js
app.registerAction('foo.bar', fooBar);
app.registerAction('foo.baz', fooBaz);

app.run('foo');     // runs `fooBar` and `fooBaz`
app.run('foo.bar'); // runs `fooBar`, but not `fooBaz`
```

### Executing Multiple Namespaces

Multiple namespaces can be run at once:

```js
app.run(['foo', 'bar']);
```

### Excluding Callbacks from Namespaces

Callbacks can be excluded from specific namespaces:

```js
app.registerGlobalAction(foo, {excludes: ['bar']});

app.run();          // runs `foo`
app.run('foo');     // runs `foo`
app.run('bar');     // does not run `foo`
```

If you'd like to run a namespace, but exclude global actions, you can pass a second argument to `run`:

```js
app.registerGlobalAction(foo);
app.registerAction('bar', baz);

app.run();                           // runs `foo`
app.run('bar', {runGlobals: false}); // does not run `foo`
```

## Priority

Sometimes sequencing can be important when executing discrete blocks of code. There's an optional third parameter which can be passed to `registerAction`, which will set the priority. Actions will be run in priority order from high to low.

```js
app.registerGlobalAction(foo, {priority: 0});
app.registerGlobalAction(bar, {priority: 5});   // this will run before foo
```

---

# Built by Apsis

[![apsis](https://s3-us-west-2.amazonaws.com/apsiscdn/apsis.png)](https://www.apsis.io)

`orca` was built by Apsis Labs. We love sharing what we build! Check out our [other libraries on Github](https://github.com/apsislabs), and if you like our work you can [hire us](https://www.apsis.io/work-with-us/) to build your vision.
