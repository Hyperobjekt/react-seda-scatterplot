/**
 * Helper class for easier scatterplot updates
 */
function Scatterplot(container, props) {
  
  var _self = this;
  var _ready = false;
  var _handlers = {};
  
  this.states = {
    // default state shared by all scatterplots
    // https://ecomfe.github.io/echarts-doc/public/en/option.html
    base: {
      grid: {
        top: 24,
        bottom: 48,
        left: 24,
        right: 48,
      },
      yAxis: { 
        position: 'right',
        nameLocation: 'middle',
        nameGap: 32,
        nameTextStyle: {
          fontSize: 12,
          fontWeight: 'normal'
        },
        splitLine: {
          show: false,
        },
        axisLabel: {
          inside: false,
          textVerticalAlign: 'middle',
          color: '#999',
          fontSize: 12,
          align: 'right',
        }
      },
      xAxis: {
        nameGap: 32,
        nameTextStyle: {
          fontSize: 12,
          fontWeight: 'normal'
        },
        axisLabel: {
          inside: false,
          textVerticalAlign: 'middle',
          color: '#999',
          fontSize: 12,
        }
      },
      series: [{
        type: 'scatter',
        itemStyle: {
          color: '#ccc',
          borderColor: 'rgba(0,0,0,0.5)',
          borderWidth: 1
        },
      }],
      tooltip: {
        trigger: 'item'
      },
    }
  }
  
  // add a ref prop to get a reference to the react component instance
  this.props = Object.assign( 
    (props || {}), 
    { 
      prefix: 'districts',
      options: this.states.base,
      ref: function(ref) { 
        _self.component = ref; 
      },
      onReady: function(echartInstance) {
        _ready = true;
        _self.trigger('ready', [_self])
      }
    }
  );
  
  /**
   * Triggers an event with `eventName` and runs all handlers
   */
  this.trigger = function(eventName, data) {
    _handlers[eventName] && 
    _handlers[eventName].forEach(function(h) {
      h.apply(null, data)
    })
  }
  
  /**
   * Registers an event handler with the associated eventName
   * If it's a ready handler and everything is ready, run immediately.
   */
  this.on = function(eventName, handler) {
    if (_handlers[eventName] )
      _handlers[eventName].push(handler)
    else
      _handlers[eventName] = [ handler ]
    if (eventName === 'ready' && _ready) {
      handler(_self.component, _self.component.echart)
    }
  }
  
  /**
   * Set a state generator for the scatterplot
   */
  this.addState = function(stateName, state) {
    this.states[stateName] = state;
  }

  /**
   * Load a state for the scatterplot
   */
  this.loadState = function(stateName, options) {
    this.component.echart.setOption(this.getState(stateName), options)
  }

  /**
   * Get an existing state for the scatterplot
   */
  this.getState = function(stateName) {
    if (this.states.hasOwnProperty(stateName)) {
      if (typeof this.states[stateName] === 'function')
       return this.states[stateName](this)
      if (typeof this.states[stateName] === 'object')
        return this.states[stateName]
    } else {
      throw new Error('no state found for ' + stateName)
    }
  }

  this.getDataSeries = function() {
    var options = this.component.getOption();
    if (options.series && options.series.length) {
      return options.series.find(s => s.id === 'scatter')
    }
    return null;
  }

  /**
   * Set an object of props for the react component
   */
  this.setProps = function(props) {
    const oldProps = Object.assign({}, {...this.component.props });
    Object.keys(props).forEach(
      function(p) {
        _self.component.props[p] = props[p];
      }
    );
    this.component.componentDidUpdate(oldProps);
  }
  
  // render the component
  ReactDOM.render(
    React.createElement(sedaScatterplot, this.props, null),
    container
  );
}

/**
 * Returns an array with the IDs that correspond to
 * the largest `num` values.
 */
Scatterplot.prototype.getSeriesDataBySize = function(values, num) {
  num = num || 100;
  var sorted = values
    .sort(function(a, b) {
      return b[2] - a[2];
    });
  return sorted.slice(0, num)
}

/**
 * Returns an array with the IDs that correspond to
 * the largest `num` values.
 */
Scatterplot.prototype.getSeriesDataForIds = function(values, ids) {
  return ids
    .map(function(id) {
      return values.find(v => v[3] === id);
    })
    .filter(v => v);
}

/** Returns an array of values that fall within the range on the provided axis */
Scatterplot.prototype.getSeriesDataInRange = function(values, axis, range) {
  var index = axis === 'x' ? 0 : 
    axis === 'y' ? 1 : 2;
  return values.filter(function(v) {
    return v[index] > range.min && v[index] < range.max;
  })
}
