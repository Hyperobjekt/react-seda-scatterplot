# React SEDA Scatterplot Component

[![Travis][build-badge]][build]
[![npm package][npm-badge]][npm]

React component for displaying a scatterplot loaded from CSV data.

## Usage

Pass x, y, and optional z variable for sizing dots. Provide a prefix to specify the region (`counties`, `districts`, or `schools`)

```js
<SedaScatterplot
  endpoint='https://d2fypeb6f974r1.cloudfront.net/dev/scatterplot/'
  xVar='all_ses'
  yVar='all_avg'
  zVar='all_sz'
  prefix='counties'
/>
```

### Props

The following props can be passed to the scatterplot component:

  - **endpoint** `string` *required* URL to the endpoint with CSV data
  - **xVar**: `string` variable name to use for x axis
  - **yVar**: `string` variable name to use for y axis
  - **zVar**: `string` variable name to use for z axis (circle size)
  - **prefix**: `string` prefix for fetching files (corresponds to region)
  - **baseVars**: `object` a map of `{ [prefix]: ['var1', 'var2', 'var3', ... ]}` to indicate which variables are available in the `{prefix}-base.csv` file.
  - **options**: `object` option overrides
  - **hovered**: `string` identifier for item to highlight
  - **highlighted**: `array` list of highlighted dot identifiers
  - **selected**: `array` list of selected dot identifiers
  - **selectedColors**: `array` list of colors to use for selected dots
  - **data**: `object` data to pass to the scatterplot, if no data is passed it will load from the endpoint
  - **theme**: `object|string` theme object or string for echart
  - **classes**: `object` allows passing of classes to child elements (e.g. `{ 'error': 'scatterplot-errror' }`)
  - **onHover**: `func` event handler for when dot is hovered
  - **onClick**: `func` event handler for when dot is clicked
  - **onReady**: `func` event handler for when chart is ready
  - **onMouseMove**: `func` event handler for when mouse moves on dot
  - **onDataLoaded**: `func` event handler for when new scatterplot data loads
  - **onError**: `func` event handler for errors
  - **onLoading**: `func` event handler for loading status

## Component Ref

The following attributes and methods are available if you get a `ref` or the component.

### Attributes

  - `echart`: the [echartsinstance](https://ecomfe.github.io/echarts-doc/public/en/api.html#echartsInstance) for the scatterplot

### Methods

  - `getData()`: gets the scatterplot data in the component state
  - `getDataSeries(id)`: gets a data [series](https://ecomfe.github.io/echarts-doc/public/en/option.html#series) in the echarts options with the corresponding id
  - `getOption()`: alias for echarts [getOption](https://ecomfe.github.io/echarts-doc/public/en/api.html#echartsInstance.getOption)
  - `setOption(options)`: alias for echart [setOption](https://ecomfe.github.io/echarts-doc/public/en/api.html#echartsInstance.setOption)


## SEDA Scatterplot Variables

The SEDA scatterplot data is available at this endpoint:

```
https://d2fypeb6f974r1.cloudfront.net/dev/scatterplot/
```

The following variables can be passed as `xVar`, `yVar`, or `zVar` and will be fetched from the endpoint.  Most variable names are strings formatted as `{demographic}_{metric}`.  For example, to get average test scores for black students the variable name would be `b_avg`

### Metrics

  - **avg**: average test scores
  - **grd**: growth over years
  - **coh**: trend over years
  - **ses**: socioeconomic status (counties and districts only)
  - **seg**: segregation measure (counties and districts only)
  - **pct**: percent of paired demographic (e.g. w_pct = percent of white students)

### Demographics

  - **all**: all students
  - **w**: white students
  - **b**: black students
  - **h**: hispanic students
  - **a**: asian students
  - **p**: poor students
  - **m**: male students
  - **f**: female students
  - **p**: poor students
  - **np**: non-poor students
  - **frl**: students qualifying for free or reduced lunch program (schools only)
  - **wb**: white/black gap
  - **wh**: white/hispanic gap
  - **wa**: white/asian gap
  - **pn**: poor/non-poor gap
  - **mf**: male/female gap


### General Variables

In addition to the metric/demographic variables, the following variables exist and apply to all demographics:

  - **all_sz**: number of students for the region (county, districts, schools)

## Custom Endpoints

This component can be used with any data by creating your own endpoint.  The endpoint is a URL that contains CSV files for individual variables. CSV files should follow the naming format:

```
{prefix}-{varName}.csv
```

> Note: You can leave out the `prefix` if you are only showing one category of data. (`{varName}.csv`)

CSV files should have the following data format:

```
{identifier},{varName}
```


[build-badge]: https://img.shields.io/travis/Hyperobjekt/react-seda-scatterplot/master.png?style=flat-square
[build]: https://travis-ci.org/Hyperobjekt/react-seda-scatterplot

[npm-badge]: https://img.shields.io/npm/v/react-seda-scatterplot.png?style=flat-square
[npm]: https://www.npmjs.org/package/react-seda-scatterplot

