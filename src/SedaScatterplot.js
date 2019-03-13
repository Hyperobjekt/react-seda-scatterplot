import React, { Component } from 'react';
import PropTypes from 'prop-types'
import Scatterplot from './Scatterplot';
import { fetchScatterplotVars } from './utils';

/**
 * 
 * @param {*} id 
 * @param {*} data 
 */
const getDataForId = (id, data) => 
  Object.keys(data).reduce((acc, curr) => {
    if (data[curr][id]) {
      acc[curr] = data[curr][id]
    }
    return acc;
  }, {})

/**
 * 
 * @param {*} id 
 * @param {*} series 
 */
const getDataIndex = (id, series) => {
  return series.findIndex(d => d[3] === id)
}

export class SedaScatterplot extends Component {
  static propTypes = {
    xVar: PropTypes.string,
    yVar: PropTypes.string,
    zVar: PropTypes.string,
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

  componentDidMount() {
    this._loadScatterplotData();
  }

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

  getData() { 
    return this.state.data && 
      this.state.data[this.props.prefix] ?
        this.state.data[this.props.prefix] : {}
  }

  /** Gets the echart options, alias for echart function */
  getOption() {
    return this.echart ? this.echart.getOption() : {} 
  }

  /** Set echart options, alias for echart function */
  setOption(...args) {
    return this.echart && this.echart(...args);
  }

  _setReady() {
    this.setState({ready: true}, () => {
      this.props.onReady && this.props.onReady(this.echart);
    });
  }

  /** Sets data for the given data category */
  _setData(data, prefix) {
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
      this.props.onDataLoaded && 
        this.props.onDataLoaded(this.state.data)
      if (!this.state.ready && this.echart) {
        this._setReady()
      }
    })

  }

  /**
   * Loads variables for a region if they do not exist in the data
   */
  _loadScatterplotData() {
    const { prefix, xVar, yVar, zVar } = this.props;
    const { data } = this.state;
    const vars = [];
    zVar && (!data || !data[zVar]) && vars.push(zVar);
    xVar && (!data || !data[xVar]) && vars.push(xVar);
    yVar && (!data || !data[yVar]) && vars.push(yVar);
    if (vars.length === 0) { return; }
    this.setState({ loading: true })
    this.echart && this.echart.showLoading()
    fetchScatterplotVars(vars, prefix)
      .then(data => {
        this._setData(data, prefix);
        this.setState({loading: false});
        this.echart && this.echart.hideLoading();
        return data;        
      })
      .catch(err => {
        this.echart && this.echart.hideLoading()
        this.setState({
          errorMessage: err.message ? err.message : err,
          loading: false
        })
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
    const { data } = this.props;
    const locationData = {
      id: e.data[3],
      ...getDataForId(e.data[3], data)
    };
    this.props.onClick && this.props.onClick(locationData, e)
  }

  /**
   * Set the echart instance on ready and pass it to the onReady
   * handler if it exists
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
    const { data } = this.props;
    // get the data array for the hovered location
    const hoverData = 
      e && e.data && e.data.hasOwnProperty('value') ?
        e.data['value']: e.data;
    // get the data from the state for the location
    const locationData = hoverData && e.type === 'mouseover' ? ({
      id: hoverData[3],
      ...getDataForId(hoverData[3], data)
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
        onReady={this._onReady}
        onHover={this._onHover}
        onMouseMove={this._onMouseMove}
        onClick={this._onClick}
        data={this.state.data[this.props.prefix ? this.props.prefix : 'unprefixed']}
        xVar={this.props.xVar}
        yVar={this.props.yVar}
        zVar={this.props.zVar}
        selected={this.props.selected}
        selectedColors={this.props.selectedColors}
        options={this.props.options}
      />  
    )
  }
}

export default SedaScatterplot
