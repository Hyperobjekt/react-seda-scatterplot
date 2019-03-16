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
import 'echarts/lib/component/grid';
import 'echarts/lib/component/legend';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/title';
import 'echarts/lib/component/visualMap';
import 'echarts/lib/component/markPoint';
import 'echarts/lib/component/markLine';
// import 'echarts/lib/component/markArea';
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

export class Scatterplot extends Component {
  static propTypes = {
    options: PropTypes.object,
    style: PropTypes.object,
    xVar: PropTypes.string,
    yVar: PropTypes.string,
    zVar: PropTypes.string,
    data: PropTypes.object,
    selected: PropTypes.array,
    selectedColors: PropTypes.array,
    onHover: PropTypes.func,
    onClick: PropTypes.func,
    onReady: PropTypes.func,
    onMouseMove: PropTypes.func,
    notMerge: PropTypes.bool
  }

  constructor(props) {
    super(props);
    this.state = {
      options: false
    }
  }

  componentDidMount() {
    this.updateOptions();
  }

  /**
   * update the scatterplot options when any of the following happen:
   * - one of the x,y,z vars change
   * - data keys change (new data loaded)
   * - selected ids change
   */
  componentDidUpdate(prevProps) {
    const { data, xVar, yVar, zVar, selected, options } = this.props;
    if (
      !_isEqual(
        Object.keys(prevProps.data || {}), 
        Object.keys(data || {})
      ) ||
      prevProps.xVar !== xVar ||
      prevProps.zVar !== zVar ||
      prevProps.yVar !== yVar ||
      !_isEqual(prevProps.selected, selected) ||
      !_isEqual(prevProps.options, options)
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
   * Gets an `markPoint.data` array for the selected items
   */
  _getSelectedPoints(scatterData, sizeScale) {
    const { selected, selectedColors } = this.props;
    if (!selected || !selected.length) { return [] }
    return selected.map((id, i) => {
      const point = scatterData.find(d => d[3] === id);
      if (!point) { return false; }
      return {
        name: id,
        coord: [point[0], point[1]],
        value: point,
        symbol: 'circle',
        symbolSize: sizeScale(point[2]),
        label: { show: false },
        itemStyle: {
          borderColor: selectedColors[i % selectedColors.length],
          borderWidth: 2,
          color: 'rgba(0,0,0,0)',
          shadowColor: '#fff',
          shadowBlur: 2
        }
      }
    }).filter(d => Boolean(d))
  }

  /** 
   * Get series with default styles and selected highlights 
   */
  _getBaseSeries() {
    const { data, xVar, yVar, zVar, options } = this.props;
    const sizeScale = 
      getDataScale(data[zVar], { range: [ 6, 48 ] });
    const scatterData = 
      getScatterplotData(data[xVar], data[yVar], data[zVar]);
    const overrides = options ? getDataSeries('base', options.series) : {};
    return merge({
      id: 'base',
      type: 'scatter',
      data: scatterData,
      symbolSize: (value) => sizeScale(value[2]),
      markPoint: {
        data: this._getSelectedPoints(scatterData, sizeScale)
      }
    }, overrides ? overrides : {})
  }

  /**
   * Gets scatterplot data series, or return empty array if 
   * data is not ready yet
   */
  _getScatterplotSeries() { 
    const { data, xVar, yVar, zVar, options } = this.props;
    const otherSeries = options && options.series ?
      options.series.filter(s => s.id !== 'base') : []
    if (data && data[xVar] && data[yVar] && data[zVar]) {
      return [ 
        this._getBaseSeries(),
        ...otherSeries
      ];
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
        />
    )
  }
}

export default Scatterplot
