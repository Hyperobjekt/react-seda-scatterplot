import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { getScatterplotData } from './utils';
import { getScatterplotOptions } from './style';
import * as _isEqual from 'lodash.isequal';
import * as scale from 'd3-scale';
import * as d3array from 'd3-array';
import * as merge from 'lodash.merge';

// import the core library.
import ReactEchartsCore from 'echarts-for-react/lib/core';

// manually import required echarts components
import echarts from 'echarts/lib/echarts';
import 'echarts/lib/chart/line';
import 'echarts/lib/chart/lines';
import 'echarts/lib/chart/scatter';
import 'echarts/lib/chart/effectScatter';
import 'echarts/lib/chart/custom';
import 'echarts/lib/component/grid';
import 'echarts/lib/component/legend';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/title';
import 'echarts/lib/component/dataZoom';
import 'echarts/lib/component/visualMap';
import 'echarts/lib/component/markPoint';
import 'echarts/lib/component/markLine';
import 'echarts/lib/component/markArea';
// import 'zrender/lib/vml/vml';



/**
 * Gets the range for the provided dataset, while filtering
 * out extreme outliers
 * @param {object} data
 */
const getDataRange = (data) => {
  const values = Object.keys(data)
    .map(k => parseFloat(data[k]))
    .filter(v => v > -9999)
    .sort((a, b) => a - b);
  return [
    d3array.quantile(values, 0.001),
    d3array.quantile(values, 0.999)
  ]
}

/**
 * Returns a scale function that can be used to map data values
 * to dot sizes
 * @param {object} data data to generate scale for
 * @param {object} options range and exponent options for scale
 */
const getDataScale = (
  data,
  { range = [0, 1], exponent = 1 }
) => {
  if (!data) { return () => 0 }
  return scale.scalePow()
    .exponent(exponent)
    .domain(getDataRange(data))
    .range(range)
    .clamp(true);
}

const getDataSeries = (id, series = []) =>
  series && series.length ?
    series.find(s => s.id === id) :
    null;

const makeId = () =>
  Math.random().toString(36).substring(2, 15) +
  Math.random().toString(36).substring(2, 15);

export class Scatterplot extends Component {
  static propTypes = {
    options: PropTypes.object,
    style: PropTypes.object,
    xVar: PropTypes.string,
    yVar: PropTypes.string,
    zVar: PropTypes.string,
    data: PropTypes.object,
    selected: PropTypes.array,
    highlighted: PropTypes.array,
    onHover: PropTypes.func,
    onClick: PropTypes.func,
    onReady: PropTypes.func,
    onMouseMove: PropTypes.func,
    notMerge: PropTypes.bool,
    theme: PropTypes.object,
    freeze: PropTypes.bool,
  }

  constructor(props) {
    super(props);
    this.state = {
      options: false
    }
  }

  /** Do not render updates if component is frozen */
  shouldComponentUpdate(nextProps) {
    return !nextProps.freeze
  }

  componentDidMount() {
    const { theme } = this.props;
    this.updateOptions();
    if (theme) {
      if (typeof theme === 'string') {
        this.setState({ themeId: theme })
      }
      if (typeof theme === 'object') {
        const themeId = makeId();
        this.setState({ themeId })
        echarts.registerTheme(themeId, this.props.theme);
      }
    }
  }

  /**
   * update the scatterplot options when any of the following happen:
   * - one of the x,y,z vars change
   * - data boolean changes
   * - selected ids change
   */
  componentDidUpdate(prevProps) {
    const { loading, data, xVar, yVar, zVar, selected, highlighted, options, freeze } = this.props;
    if (loading) { return; }
    if (
      (
        Boolean(prevProps.data) !== Boolean(data) ||
        prevProps.xVar !== xVar ||
        prevProps.zVar !== zVar ||
        prevProps.yVar !== yVar ||
        !_isEqual(prevProps.highlighted, highlighted) || // highlighted dots changed
        !_isEqual(prevProps.selected, selected) || // selected dots changed
        !_isEqual(prevProps.options, options) || // new options
        (prevProps.freeze && !freeze) // unfreeze
      )
    ) {
      this.updateOptions();
    }
  }

  updateOptions() {
    const options = getScatterplotOptions(
      this._getScatterplotOptions()
    );
    this.setState({ options });
  }

  /**
   * Gets an echart series for all of the data corresponding to IDs
   * in `props.highlighted`
   * @param {array} scatterData data from the base series
   * @param {function} sizeScale a function that returns circle size based on zVar
   */
  _getHighlightedSeries(scatterData, sizeScale) {
    const { highlighted = [], options, zVar } = this.props;
    // data index for the id property
    const idDim = zVar ? 3 : 2;
    const baseSeries = {
      id: 'highlighted',
      type: 'scatter',
      symbolSize: zVar ? ((value) => sizeScale(value[2])) : 10,
      z:3
    }
    const overrides = options ?
      getDataSeries('highlighted', options.series) : {};
    const data = highlighted
      .map((id, i) => scatterData.find(d => d[idDim] === id))
      .filter(d => Boolean(d))
    return merge(
      { ...baseSeries, data: data },
      overrides ? overrides : {}
    )
  }

  /**
   * Gets a data series with selected items
   */
  _getSelectedSeries(scatterData, sizeScale) {
    const { selected = [], options, zVar } = this.props;
    // data index for the id property
    const idDim = zVar ? 3 : 2;
    const baseSeries = {
      id: 'selected',
      type: 'scatter',
      symbolSize: (value) => sizeScale(value[2]),
      z:4
    }
    const overrides = options ?
      getDataSeries('selected', options.series) : {};
    const data = selected
      .map((id, i) => scatterData.find(d => d[idDim] === id))
      .filter(d => Boolean(d))
    return merge(
      { ...baseSeries, data: data },
      overrides ? overrides : {}
    )
  }

  /**
   * Get series with default styles and selected highlights
   */
  _getBaseSeries(scatterData, sizeScale) {
    const { options } = this.props;
    const overrides = options ?
      getDataSeries('base', options.series) : {};
    const series = merge({
      id: 'base',
      type: 'scatter',
      data: scatterData,
      symbolSize: (value) => sizeScale(value[2]),
      z:2
    }, overrides ? overrides : {})
    return series;
  }

  /**
   * Gets scatterplot data series, or return empty array if
   * data is not ready yet
   */
  _getScatterplotSeries() {
    const { data, xVar, yVar, zVar, options } = this.props;
    const otherSeries = options && options.series ?
      options.series.filter(
        s => ['base', 'selected', 'highlighted'].indexOf(s.id) === -1
      ) : []
    if (
      (data && data[xVar] && data[yVar]) &&
      ((zVar && data[zVar]) || !zVar)
    ) {
      const sizeScale = zVar ?
        getDataScale(data[zVar], { range: [ 6, 48 ] }) :
        (() => 10);
      const scatterData = zVar ?
        getScatterplotData(data[xVar], data[yVar], data[zVar]) :
        getScatterplotData(data[xVar], data[yVar])
      const series = [
        this._getBaseSeries(scatterData, sizeScale),
        this._getSelectedSeries(scatterData, sizeScale),
        this._getHighlightedSeries(scatterData, sizeScale),
        ...otherSeries
      ];
      return series;
    }
    return [];
  }


  /**
   * Gets the options with overrides and series data for the scatterplot
   */
  _getScatterplotOptions = () => {
    const { options } = this.props;
    const series = this._getScatterplotSeries()
    const fullOptions = {
      ...options,
      series
    };
    return fullOptions;
  }


  /**
   * Bind events when the chart is ready
   */
  _onChartReady(e) {
    this.props.onHover &&
      e.on('mouseover', this.props.onHover)
    this.props.onHover &&
      e.on('mouseout', this.props.onHover)
    this.props.onMouseMove &&
      e.on('mousemove', this.props.onMouseMove)
    this.props.onClick &&
      e.on('click', this.props.onClick)
    this.props.onMouseOver &&
      e.getDom().addEventListener('mouseover', this.props.onMouseEnter)
    this.props.onMouseOut &&
      e.getDom().addEventListener('mouseout', this.props.onMouseLeave)
    this.echart = e;
    this.props.onReady && this.props.onReady(e)
  }

  getOptionOverrides() { return this.state.options }

  render() {
    return (
      this.state.options &&
        <ReactEchartsCore
          echarts={echarts}
          onChartReady={this._onChartReady.bind(this)}
          style={{ position: 'absolute', top:0, left:0, width: '100%', height: '100%', ...this.props.style }}
          option={this.state.options}
          notMerge={this.props.notMerge}
          theme={this.state.themeId}
          showLoading={this.props.loading}
          loadingOption={{
            color: '#0078d4'
          }}
        />
    )
  }
}

export default Scatterplot
