# `Scatterplot.js`

Scatterplot is a helper class to build and transition between states.

## Constructor

### `new Scatterplot(rootEl, props)`

  - `rootEl` {DOMElement} element to render the scatterplot in
  - `props` {object} optional props to pass to the React component

## Attributes

### `.component` 

Instance of the React SedaScatterplot component (see [here](../../README.md) for available attributes and methods)

## Methods

### `.on(eventName, handler)`

Binds an event handler to the provided event name.

**Params:**
  - `eventName` {string} the name of the event (e.g. 'ready')
  - `handler` {function} the function that runs when the event happens


### `.addState(stateName, state)`

Adds a state generator to the scatterplot.

**Params:**
  - `stateName` {string} an identifier for the state
  - `state` {function | object} a function that returns the eChart options or an eChart options object

### `.loadState(stateName, options)`

Loads one of the states that has been added to the scatterplot.

**Params:**
  - `stateName` {string} an identifier for the state to load
  - `options` {object} options that are passed to echarts [setOption](https://ecomfe.github.io/echarts-doc/public/en/api.html#echartsInstance.setOption) function when loading the state.

### `.getState(stateName)`

Gets the eChart options for a provided state identifier

**Params:**
  - `stateName` {string} an identifier for the state to load
  - `options` {object} options that are passed to echarts [setOption](https://ecomfe.github.io/echarts-doc/public/en/api.html#echartsInstance.setOption) function when loading the state.

**Returns:**
  - {object} the state corresponding to the `stateName` identifier

### `.setProps(props)`

Sets props on the React scatterplot component.  This is primarily used to switch x, y, or z variables. See the [react component docs](https://github.com/Hyperobjekt/react-seda-scatterplot) for available properties.

**Params:**
  - `props` {object} the props to set

### `.getDataSeries()`

Gets the base data series for the scatterplot

**Returns:**
  - {object} there object representing the base data series with all points in the scatterplot

### `.getSeriesDataBySize(values, num)`

Gets the data points with the largest `z` value in the scatterplot.  Returns `num` points.

**Params:**
  - `values` {array} data points to select from
  - `num` {number} the number of points to return

**Returns:**
  - {array} `num` data points with the largest `z` value

### `.getSeriesDataForIds(values, ids)`

Gets the data points that correspond to the provided IDs.

**Params:**
  - `values` {array} data points to select from
  - `ids` {array} an array of IDs

**Returns:**
  - {array} data points that correspond to the provided IDs

### `.getSeriesDataInRange(values, axis, range)`

Gets the data points within a certain range of x, y, or z values.

**Params:**
  - `values` {array} data points to select from
  - `axis` {string} axis to select along (x, y, or z)
  - `range` {object} object with `min` and `max` values

**Returns:**
  - {array} data points that fall within the range
