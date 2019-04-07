import React, { Component } from 'react';
import PropTypes from 'prop-types'
import Scatterplot from './Scatterplot';
import { fetchScatterplotVars, arrayEqual, arrayContains } from './utils';

/**
 * Gets the scatterplot data for a given ID
 * @param {*} id 
 * @param {*} data 
 */
const getDataForId = (id, data) => {
  return Object.keys(data).reduce((acc, curr) => {
    if (data[curr][id]) {
      acc[curr] = data[curr][id]
    }
    return acc;
  }, {})
}

/**
 * Gets the data index for the given ID in scatterplot data
 * @param {*} id 
 * @param {*} series 
 */
const getDataIndex = (id, series) => {
  return series.findIndex(d => d[3] === id)
}

export class SedaScatterplot extends Component {
  static propTypes = {
    endpoint: PropTypes.string.isRequired,
    xVar: PropTypes.string,
    yVar: PropTypes.string,
    zVar: PropTypes.string,
    data: PropTypes.object,
    theme: PropTypes.object,
    prefix: PropTypes.string,
    options: PropTypes.object,
    hovered: PropTypes.string,
    selected: PropTypes.array,
    onHover: PropTypes.func,
    onClick: PropTypes.func,
    onMouseMove: PropTypes.func,
    onReady: PropTypes.func,
    onData: PropTypes.func,
    onError: PropTypes.func,
    onLoading: PropTypes.func,
    baseVars: PropTypes.object,
    classes: PropTypes.object
  }
  
  constructor(props) {
    super(props);
    this.loaded = false;
    this.hoverTimeout = null;
  }

  /** 
   * Set initial data if it exists, 
   * call load to load any missing data 
   */
  componentDidMount() {
    this._loadScatterplotData();
  }

  /**
   * Call load if variable or region (prefix) has changed
   * Toggle highlights on the hovered ID if needed
   */
  componentDidUpdate(prevProps) {
    const { prefix, xVar, yVar, zVar, hovered } = this.props;
    if(this.isDataReady()) {
      if (this.echart && !this.ready) {
        this.ready = true;
        this.props.onReady && this.props.onReady(this.echart);
      }
      if (!this.loaded) {
        this._setLoaded(true)        
      }
    } else {
      if (this.loaded) {
        this._setLoaded(false)
      }
    }
    // load data if needed
    if (
      prevProps.prefix !== prefix ||
      prevProps.xVar !== xVar ||
      prevProps.zVar !== zVar ||
      prevProps.yVar !== yVar
    ) {
      this._loadScatterplotData();
    }
    // update highlighted dots when hovered changes
    if (prevProps.hovered !== hovered) {
      this._toggleHighlight(prevProps.hovered, { show: false })
      if (hovered) {
        this._toggleHighlight(hovered, { show: true });
      }
    }
  }

  /**
   * Gets the state data for the scatterplot
   */
  getData() { 
    return this.props.data && 
      this.props.data[this.props.prefix] ?
        this.props.data[this.props.prefix] : {}
  }

  /** 
   * Get the data series echart configuration for the givn ID
   * 
   * @returns {object} echart options for series https://ecomfe.github.io/echarts-doc/public/en/option.html#series-scatter.type
   */
  getDataSeries(id = 'base') {
    const options = this.getOption();
    return options.series && options.series.length ?
      options.series.find(s => s.id === id) :
      null;
  }

  /** Gets the echart options, alias for echart function */
  getOption() {
    return this.echart ? this.echart.getOption() : {} 
  }

  /** Set echart options, alias for echart function */
  setOption(...args) {
    return this.echart && this.echart(...args);
  }

  /** Gets the option overrides for the scatterplot */
  getOptionOverrides() { 
    return this.scatterplot && 
      this.scatterplot.getOptionOverrides() 
  }

  /** returns true if all data to render the scatterplot is available */
  isDataReady() {
    const { xVar, yVar, zVar, prefix } = this.props;
    const data = this.props.data[prefix] || {};
    return Boolean(data[xVar]) && Boolean(data[yVar]) && 
      Boolean(!zVar || data[zVar]);
  }

  /** Sets data for the given data category */
  _setData(data, prefix) {
    prefix = prefix ? prefix : 'unprefixed';
    this.props.onData && 
          this.props.onData(data, prefix)
  }

  /** Sets the loading state for the scatterplot */
  _setLoaded(loaded) {
    this.loaded = loaded
    this.props.onLoading && this.props.onLoading(!loaded)
  }

  /**
   * Loads variables for a region if they do not exist in the data
   */
  _loadScatterplotData() {
    const { xVar, yVar, zVar, prefix } = this.props;
    const data = this.props.data[prefix] || {};
    const vars = [];
    zVar && (!data || !data[zVar]) && vars.push(zVar);
    xVar && (!data || !data[xVar]) && vars.push(xVar);
    yVar && (!data || !data[yVar]) && vars.push(yVar);
    if (vars.length === 0) {
      return; 
    }
    return this._fetchVariables(vars);
  }

  _fetchVariables(vars) {
    const { prefix, endpoint, baseVars } = this.props;
    if (!endpoint) { 
      throw new Error('No endpoint specified for scatterplot') 
    }
    // get base collection variables if any
    const collectionVars = (baseVars && baseVars[prefix]) || [];
    return fetchScatterplotVars(vars, prefix, endpoint, collectionVars)
      .then(data => {
        this._setData(data, prefix);
        return data;        
      })
      .catch(err => {
        console.error(err)
        this.props.onError && this.props.onError(err);
      })
  }

  /**
   * Gets the series and data index for a given ID 
   * @param {string} id 
   * @returns {object} { seriesIndex, dataIndex }
   */
  _getIndiciesForId(id) {
    const { series } = this.echart.getOption();
    // check in reverse order to get the top-most level
    for(let i = series.length-1; i > -1; i--) {
      if (series[i] && series[i].data) {
        const dataIndex = getDataIndex(id, series[i].data);
        if (dataIndex > -1) {
          return { seriesIndex: i, dataIndex }
        }
      }
    }
    // no id found, return -1
    return { seriesIndex: -1, dataIndex: -1 }
  }

  /**
   * Toggle highlighted state for items in the scatterplot
   */
  _toggleHighlight(hoveredId, { show = true }) {
    const { series } = this.echart.getOption();
    const { seriesIndex, dataIndex } = this._getIndiciesForId(hoveredId);
    if (seriesIndex && dataIndex) {
      this.echart && this.echart.dispatchAction({
        type: show ? 'highlight' : 'downplay',
        seriesIndex: seriesIndex,
        dataIndex: dataIndex
      })
    } else {
      console.warn('no id to toggle highlight', hoveredId);
    }
  }

  /**
   * Get this clicked location data and pass it to the handler
   * if it exists.
   */
  _onClick = (e) => {
    if (!this.props.onClick) { return; }
    const prefix = this.props.prefix || 'unprefixed';
    const { data } = this.props;
    const locationData = {
      id: e.data[3],
      ...getDataForId(e.data[3], data[prefix])
    };
    this.props.onClick && this.props.onClick(locationData, e)
  }

  /**
   * Set the echart instance on ready and set the
   * component status to ready if data has loaded.
   */
  _onReady = (echart) => {
    this.echart = echart;
  }

  /**
   * Get the data for the hovered feature and call the
   * handler if it exists
   */
  _onHover = (e) => {
    if (!this.props.onHover) { return; }
    const prefix = this.props.prefix || 'unprefixed';
    const { data } = this.props;
    // index of the id property in the scatterplot data
    const idIndex = this.props.zVar ? 3 : 2;
    // get the data array for the hovered location
    const hoverData = 
      e && e.data && e.data.hasOwnProperty('value') ?
        e.data['value']: e.data;
    // get the data from the state for the location
    const locationData = hoverData && e.type === 'mouseover' ? ({
      id: hoverData[idIndex],
      ...getDataForId(hoverData[idIndex], data[prefix])
    }) : null;
    // if there is a location then call onHover immediately
    if (locationData) {
      this.props.onHover(locationData, e);
      // clear the timeout if it is waiting to clear the hovered feature
      if (this.hoverTimeout) {
        clearTimeout(this.hoverTimeout);
        this.hoverTimeout = null;
      }
    } else {
      // set a timeout to inform the callback no items are hovered
      this.hoverTimeout = setTimeout(() => {
        this.props.onHover(null, e);
      }, 200)
    }
  }

  /**
   * Call the mouse move handler if it exists
   */
  _onMouseMove = (e) => {
    if (!this.props.onMouseMove) { return; }
    this.props.onMouseMove(e);
  }

  render() {
    const data = this.isDataReady() ?
      this.props.data[this.props.prefix ? this.props.prefix : 'unprefixed'] :
      null
    return (
      <Scatterplot 
        ref={(ref) => this.scatterplot = ref}
        onReady={this._onReady}
        onHover={this._onHover}
        onMouseMove={this._onMouseMove}
        onClick={this._onClick}
        data={data}
        xVar={this.props.xVar}
        yVar={this.props.yVar}
        zVar={this.props.zVar}
        selected={this.props.selected}
        highlighted={this.props.highlighted}
        options={this.props.options}
        notMerge={this.props.notMerge}
        theme={this.props.theme}
        loading={!this.isDataReady()}
      />  
    )
  }
}

export default SedaScatterplot
