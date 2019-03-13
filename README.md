# React SEDA Scatterplot

[![Travis][build-badge]][build]
[![npm package][npm-badge]][npm]
[![Coveralls][coveralls-badge]][coveralls]

React component for displaying a scatterplot with SEDA data.

## Usage

Pass x, y, and optional z variable for sizing dots. Provide a prefix to specify the region (`counties`, `districts`, or `schools`)

```js
<SedaScatterplot
  xVar='all_ses'
  yVar='all_avg'
  zVar='sz'
  prefix='counties'
/>
```

### Properties

The following props can be passed to the scatterplot through attributes:

  - **xVar**: `string`
  - **yVar**: `string`
  - **zVar**: `string`
  - **prefix**: `string` prefix for fetching files (corresponds to region)
  - **options**: `object` option overrides
  - **hovered**: `string` identifier for item to highlight
  - **selected**: `array` list of selected dot identifiers
  - **selectedColors**: `array` list of colors to use for selected dots
  - **onHover**: `func` event handler for when dot is hovered
  - **onClick**: `func` event handler for when dot is clicked
  - **onReady**: `func` event handler for when chart is ready
  - **onMouseMove**: `func` event handler for when mouse moves on dot

## Available Variables

The following variables can be passed as `xVar`, `yVar`, or `zVar`.  Most variable names are strings formatted as `{demographic}_{metric}`.  For example, to get average test scores for black students the variable name would be `b_avg`

### Metrics

  - **avg**: average test scores
  - **grd**: growth over years
  - **coh**: trend over years
  - **ses**: socioeconomic status (counties and districts only)

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
  - **wb**: white/black gap
  - **wh**: white/hispanic gap
  - **wa**: white/asian gap
  - **pn**: poor/non-poor gap
  - **mf**: male/female gap

### General Variables

In addition to the metric/demographic variables, the following variables exist and apply to all demographics:

  - **sz**: number of students for the region (county, districts, schools)


[build-badge]: https://img.shields.io/travis/Hyperobjekt/react-seda-scatterplot/master.png?style=flat-square
[build]: https://travis-ci.org/Hyperobjekt/react-seda-scatterplot

[npm-badge]: https://img.shields.io/npm/v/npm-package.png?style=flat-square
[npm]: https://www.npmjs.org/package/react-seda-scatterplot

[coveralls-badge]: https://img.shields.io/coveralls/Hyperobjekt/react-seda-scatterplot/master.png?style=flat-square
[coveralls]: https://coveralls.io/github/Hyperobjekt/react-seda-scatterplot
