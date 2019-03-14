# Scatterplot Guide

This is a basic guide on how to create a scatterplot that transition through various states.  This will be used for articles on the Educational Opportunity website to transition states based on scroll position.

## **[Demo](http://seda-scatterplot.surge.sh/)**

## 1. Add Scripts

Any pages that use the scatterplot need to include deepmerge, React, ReactDOM, and the React scatterplot component. You'll also want to include the Scatterplot helper class.

```html
<script src='https://unpkg.com/deepmerge@2.2.1/dist/umd.js'></script>
<script src='https://cdnjs.cloudflare.com/ajax/libs/react/16.8.4/umd/react.production.min.js'></script>
<script src='https://cdnjs.cloudflare.com/ajax/libs/react-dom/16.8.4/umd/react-dom.production.min.js'></script>
<script src='https://unpkg.com/react-seda-scatterplot@1.0.4/umd/react-seda-scatterplot.min.js'></script>
<script src='./Scatterplot.js'></script>
```
> Note: Serving from these CDNs is fine during the development phase.  It would be good practice to bundle them into a single file before the site goes into production.

## 2. Create Scatterplot Instance

Create the scatterplot instance by passing a DOM element to the constructor.

```js
var rootEl = document.getElementById('root');
var scatterplot = new Scatterplot(rootEl);
```

## 3. Create the States

A state is a set of [eChart options](https://ecomfe.github.io/echarts-doc/public/en/option.html) that produce a unique view of the scatterplot.  Each article will transition a scatterplot through a series of states.

### Creating a State

Each state is created with a generator function that is injected with the scatterplot instance and returns the [eChart options](https://ecomfe.github.io/echarts-doc/public/en/option.html) for the state.

```js
var state1 = function(scatterplot) {
  // build the state here
}
```

The `scatterplot` parameter is an instance of `Scatterplot` (see [Scatterplot.md](./Scatterplot.md) for available methods)

> See `article1.js` for some example states

## 4. Add States to the Scatterplot Instance

Call `addState` on the scatterplot instance with a name for the state and a generator function.

```js
scatterplot.addState('state1', state1);
scatterplot.addState('state2', state2);
```

## 5. Changing between states

Once states are added, you can call `loadState` to toggle between the availabile states.  The example below loads the next state after 5 seconds.  For the articles, you would bind the `loadState` calls based on scroll position.

```js
// load the initial state as the default view
scatterplot.loadState('state1', { notMerge: true });

// ready fires once the initial state is loaded
scatterplot.on('ready', function(scatterplot) {
  setTimeout(() => {
    scatterplot.loadState('state2');
  }, 4000)
})
```



