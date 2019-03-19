import React, { Component } from 'react';
import PropTypes from 'prop-types'
import Scatterplot from './Scatterplot';
import { fetchScatterplotVars } from './utils';



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
    initialData: PropTypes.object,
    theme: PropTypes.object,
    prefix: PropTypes.string,
    options: PropTypes.object,
    hovered: PropTypes.string,
    selected: PropTypes.array,
    selectedColors: PropTypes.array,
    onHover: PropTypes.func,
    onClick: PropTypes.func,
    onReady: PropTypes.func,
    onMouseMove: PropTypes.func,
    onDataLoaded: PropTypes.func,
    onError: PropTypes.func,
    onLoading: PropTypes.func,
    baseVars: PropTypes.object,
  }

  state = {
    data: {},
    ready: false,
    loading: true,
    errorMessage: null
  }
  
  constructor(props) {
    super(props);
    this.hoverTimeout = null;
  }

  /** 
   * Set initial data if it exists, 
   * call load to load any missing data 
   */
  componentDidMount() {
    const { prefix, initialData } = this.props;
    if (initialData) {
      this._setData(initialData, prefix, true);
    }
    this._loadScatterplotData();
  }

  /**
   * Call load if variable or region (prefix) has changed
   * Toggle highlights on the hovered ID if needed
   */
  componentDidUpdate(prevProps) {
    const { prefix, xVar, yVar, zVar, hovered } = this.props;    
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
    return this.state.data && 
      this.state.data[this.props.prefix] ?
        this.state.data[this.props.prefix] : {}
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

  getOptionOverrides() { 
    return this.scatterplot && 
      this.scatterplot.getOptionOverrides() 
  }

  /** Sets ready state of this component and fires callback */
  _setReady() {
    this.setState({ready: true}, () => {
      this.props.onReady && this.props.onReady(this.echart);
    });
  }

  /** Sets data for the given data category */
  _setData(data, prefix, silent = false) {
    prefix = prefix ? prefix : 'unprefixed';
    this.setState({
      data: { 
        ...this.state.data, 
        [prefix] : {
          ...this.state.data[prefix],
          ...data
        }
      }
    }, () => {
      if (!silent) {
        this.props.onDataLoaded && 
          this.props.onDataLoaded(this.state.data)
      }
      if (!this.state.ready && this.echart) {
        this._setReady()
      }
    })

  }

  /** Sets the loading state for the scatterplot */
  _setLoadingState(loading) {
    this.setState({loading});
    this.echart && loading && this.echart.showLoading(); 
    this.echart && !loading && this.echart.hideLoading();
    this.props.onLoading && this.props.onLoading(loading)
  }

  /**
   * Loads variables for a region if they do not exist in the data
   */
  _loadScatterplotData() {
    const { prefix, xVar, yVar, zVar, endpoint, baseVars } = this.props;
    const { data } = this.state;
    const vars = [];
    if (!endpoint) { 
      throw new Error('no endpoint specified for scatterplot') 
    }
    zVar && (!data || !data[zVar]) && vars.push(zVar);
    xVar && (!data || !data[xVar]) && vars.push(xVar);
    yVar && (!data || !data[yVar]) && vars.push(yVar);
    if (vars.length === 0) { return; }
    // variables that are part of the base scatterplot file
    const defaultBase = {
      'counties': ['id', 'name', 'lat', 'lon', 'all_avg', 'all_ses', 'sz' ],
      'districts': ['id', 'name', 'lat', 'lon', 'all_avg', 'all_ses', 'sz' ],
      'schools': ['id', 'name', 'lat', 'lon', 'all_avg', 'frl_pct', 'sz' ]
    }
    // get base collection variables if any
    const collectionVars = (baseVars && baseVars[prefix]) || defaultBase[prefix] || [];
    this._setLoadingState(true);
    fetchScatterplotVars(vars, prefix, endpoint, collectionVars)
      .then(data => {
        console.log('success', data)
        this._setData(data, prefix);
        this._setLoadingState(false);
        return data;        
      })
      .catch(err => {
        console.error(err)
        this.setState({
          errorMessage: err.message ? err.message : err
        })
        this._setLoadingState(false);
        this.props.onError && this.props.onError(err);
      })
  }

  /**
   * Toggle highlighted state for items in the scatterplot
   */
  _toggleHighlight(hoveredId, { show = true }) {
    const { series } = this.echart.getOption();
    if (series[0] && series[0].data) {
      this.echart && this.echart.dispatchAction({
        type: show ? 'highlight' : 'downplay',
        seriesIndex: 0,
        dataIndex: getDataIndex(hoveredId, series[0].data)
      })
    } else {
      console.warn('no series to toggle highlight', series, this.echart.getOption());
    }
  }

  /**
   * Get this clicked location data and pass it to the handler
   * if it exists.
   */
  _onClick = (e) => {
    if (!this.props.onClick) { return; }
    const prefix = this.props.prefix || 'unprefixed';
    const { data } = this.state;
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
    if (!this.props.onReady) { return; }
    if (!this.state.ready && !this.state.loading) {
      this._setReady()
    }
  }

  /**
   * Get the data for the hovered feature and call the
   * handler if it exists
   */
  _onHover = (e) => {
    if (!this.props.onHover) { return; }
    const prefix = this.props.prefix || 'unprefixed';
    const { data } = this.state;
    // get the data array for the hovered location
    const hoverData = 
      e && e.data && e.data.hasOwnProperty('value') ?
        e.data['value']: e.data;
    // get the data from the state for the location
    const locationData = hoverData && e.type === 'mouseover' ? ({
      id: hoverData[3],
      ...getDataForId(hoverData[3], data[prefix])
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
    return (
      <Scatterplot 
        ref={(ref) => this.scatterplot = ref}
        onReady={this._onReady}
        onHover={this._onHover}
        onMouseMove={this._onMouseMove}
        onClick={this._onClick}
        data={this.state.data[this.props.prefix ? this.props.prefix : 'unprefixed']}
        xVar={this.props.xVar}
        yVar={this.props.yVar}
        zVar={this.props.zVar}
        selected={this.props.selected}
        highlighted={this.props.highlighted}
        selectedColors={this.props.selectedColors}
        options={this.props.options}
        notMerge={this.props.notMerge}
        theme={this.props.theme}
      />  
    )
  }
}

export default SedaScatterplot
