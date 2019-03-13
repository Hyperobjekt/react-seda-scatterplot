/**
 * Helper class for easy scatterplot updates
 */
function Scatterplot(container, props, states) {
  
  var _self = this;
  var _ready = false;
  var _handlers = {};
  
  this.states = states;
  
  // add a ref prop to get a reference to the react component instance
  this.props = Object.assign( 
    props, 
    { 
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
  
  this.loadState = function(stateName) {
    if (this.states.hasOwnProperty(stateName)) {
      if (typeof states[stateName] === 'function')
       this.component.echart.setOption(this.states[stateName](this))
      if (typeof states[stateName] === 'object')
        this.component.echart.setOption(this.states[stateName])
    } else {
      throw new Error('no state found for ' + stateName)
    }
  }

    
  /**
   * Sets a prop on the component and triggers an update
   */
  this.setProp = function(propName, value) {
    const oldProps = Object.assign({}, {...this.component.props });
    this.component.props[propName] = value;
    this.component.componentDidUpdate(oldProps)
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
Scatterplot.prototype.getLargestBySize = function(values, num) {
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
Scatterplot.prototype.getValuesById = function(values, ids) {
  return ids
    .map(function(id) {
      return values.find(v => v[3] === id);
    })
    .filter(v => v);
}
