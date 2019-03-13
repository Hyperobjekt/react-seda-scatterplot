import React, {Component} from 'react'
import {render} from 'react-dom'

import SedaScatterplot from '../../src'

const baseOptions = {
  grid: {
    top: 24,
    bottom: 24,
    left: 24,
    right: 24,
  },
  yAxis: { 
    position: 'right',
    axisLabel: {
      inside: false,
      textVerticalAlign: 'middle',
      color: '#999',
      fontSize: 12,
      align: 'right',
    }
  },
  xAxis: {
    axisLabel: {
      inside: false,
      textVerticalAlign: 'middle',
      color: '#999',
      fontSize: 12,
    }
  },
  tooltip: {
    trigger: 'item'
  },
  series: [{
    itemStyle: {
      color: '#ccc',
      borderColor: 'rgba(0,0,0,0.5)',
      borderWidth: 1
    }
  }]
}


class Demo extends Component {
  render() {
    return <div style={{ width: 640, height: 480, position: 'relative'}}>
      <SedaScatterplot 
        xVar='all_ses'
        yVar='all_avg'
        zVar='sz'
        prefix='counties'
        options={baseOptions}
      />
    </div>
  }
}

render(<Demo/>, document.querySelector('#demo'))
