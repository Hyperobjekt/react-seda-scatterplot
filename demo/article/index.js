
// base echarts configuration for scatterplot
// https://ecomfe.github.io/echarts-doc/public/en/option.html
var scatterplotOneOptions = {
  grid: {
    top: 24,
    bottom: 48,
    left: 24,
    right: 48,
  },
  title: {
    text: 'White and Black Students\' Average Performance',
    subtext: 'U.S. School Districts 2009-2016'
  },
  yAxis: { 
    position: 'right',
    min:-4,
    max:3,
    name: 'Black Average Performance',
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
    min: -3,
    max: 4,
    name: 'White Average Performance',
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
  tooltip: {
    trigger: 'item'
  },
  series: [{
    itemStyle: {
      color: '#ccc',
      borderColor: 'rgba(0,0,0,0.5)',
      borderWidth: 1
    },
    markPoint: {
      itemStyle: {
        color: '#f00'
      }
    },
    markLine: {
      animation: false,
      silent: true,
      label: {
        position: 'middle',
        formatter: function(value) {
          return value.name
        } 
      },
      data: [
        [
          { 
            name: 'white student scores = black student scores', 
            coord: [-3, -3], 
            symbol: 'none',
            lineStyle: {
              color: '#999'
            }
          },
          { coord: [ 3,  3], symbol: 'none' },
        ],
        [
          { 
            name: '', 
            coord: [0, -4], 
            symbol: 'none',
            lineStyle: {
              color: 'rgba(0,0,0,0.2)'
            }
          },
          { 
            coord: [ 0,  3], 
            symbol: 'none' 
          },
        ],
        [
          { 
            name: '', 
            coord: [-3, 0], 
            symbol: 'none',
            lineStyle: {
              color: 'rgba(0,0,0,0.2)'
            }
          },
          { 
            coord: [4, 0], 
            symbol: 'none' 
          },
        ]
      ]
    }
  }]
}

// all of the states for the scatterplot
// states can be an object, or a function that returns an
// options object
var states = {

  // base state (on load)
  'base': scatterplotOneOptions,

  // State 1: Highlight largest 25 districts
  'state1': function(scatterplot) {
    var options = scatterplot.component.getOption();
    var top100 = scatterplot.getLargestBySize(options.series[0].data, 10)
    return{
      series: [
        options.series[0],
        {
          type: 'scatter',
          data: top100,
          symbolSize: options.series[0].symbolSize,
          itemStyle: {
            borderWidth: 1,
            borderColor: 'rgba(0,0,0,1)',
            color: 'rgba(255,0,0,0.15)'
          }
        }
      ]
    }
  },

  //State 2: Highlight interesting areas
  'state2': function(scatterplot) {
    var highlightIds = [ '0641580', '2612000', '1302550' ]
    var options = scatterplot.component.getOption();
    var highlightedValues = scatterplot.getValuesById(options.series[0].data, highlightIds);
    console.log(highlightedValues)
    return ({
      series: [
        options.series[0],
        options.series[1],
        {
          type: 'scatter',
          data: highlightedValues,
          symbolSize: options.series[0].symbolSize,
          itemStyle: {
            borderWidth: 2,
            borderColor: 'rgba(0,0,0,1)',
            color: 'rgba(255,255,0,0.5)'
          }
        }
      ]
    })
  }
}

// create the component
var rootEl = document.getElementById('root');
var componentProps = {
  xVar: 'w_avg',
  yVar: 'b_avg',
  zVar: 'sz',
  prefix: 'districts',
  selectedColors: [ '#f00' ],
  selected: false,
  options: states['base']
};
var scatterplotOne = new Scatterplot(
  rootEl, 
  componentProps,
  states
);

// when the component is ready, toggle states as needed
scatterplotOne.on('ready', function(scatterplot) {
  // Toggle through different states here
  console.log(scatterplotOne, scatterplot)
  setTimeout(() => {
    scatterplot.loadState('state1')
  }, 3000)
  setTimeout(() => {
    scatterplot.loadState('state2')
  }, 6000)
})