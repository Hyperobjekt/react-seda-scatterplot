/**
 * scatterplot states for article one
 * - article storyboard: https://docs.google.com/document/d/1adz0CwXI8WKok8ePVQEcSmlRQwRIjKaKvd8Am6OFfhY/edit
 */

/** State 1: Show white scores on x axis and black scores on y axis */
var state1 = function(scatterplot) {
  scatterplot.setProps({
    xVar: 'w_avg',
    yVar: 'b_avg',
    zVar: 'all_sz',
  });
  // get current echart options
  const options = scatterplot.component.getOption();
  // this state is created from the base
  const base = scatterplot.getState('base');
  const baseOverrides = {
    title: {
      text: 'White and Black Students\' Average Performance',
      subtext: 'U.S. School Districts 2009-2016'
    },
    yAxis: { 
      min:-4,
      max:3,
      name: 'Black Average Performance',
    },
    xAxis: {
      min: -3,
      max: 4,
      name: 'White Average Performance',
    },
    series: [{
      id: 'base',
      type:'scatter',
      itemStyle: {
        color: '#ccc',
        borderColor: 'rgba(0,0,0,0.5)',
        borderWidth: 1
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
  return deepmerge.all([base, baseOverrides ]);
}

/** State 2: Highlight largest 25 districts  */
var state2 = function(scatterplot) {
  // state 2 is based on state 1
  var base = scatterplot.getState('state1');
  var dataSeries = scatterplot.getDataSeries();
  dataSeries['itemStyle'] = Object.assign(dataSeries['itemStyle'], { opacity: 0.2 })
  var top100 = scatterplot.getSeriesDataBySize(dataSeries.data, 10)
  const state = deepmerge(base, {
    series: [
      {
        id: 'top100',
        type: 'scatter',
        data: top100,
        symbolSize: dataSeries.symbolSize,
        itemStyle: {
          borderWidth: 1,
          borderColor: 'rgba(0,0,0,1)',
          color: 'rgba(255,0,0,0.25)'
        }
      }
    ]
  })
  return state;
};

/** State 3: Highlight locations (Detroit, Gwinet, Washington) */
var state3 = function(scatterplot) {
  var highlightIds = [ '0641580', '2612000', '1302550' ]
  var base = scatterplot.getState('state2');
  var dataSeries = scatterplot.getDataSeries();
  var highlightedValues = scatterplot.getSeriesDataForIds(dataSeries.data, highlightIds);
  return deepmerge(base, {
    series: [
      {
        type: 'scatter',
        data: highlightedValues,
        symbolSize: dataSeries.symbolSize,
        itemStyle: {
          borderWidth: 2,
          borderColor: 'rgba(0,0,0,1)',
          color: 'rgba(255,255,0,0.5)'
        }
      }
    ]
  })
};

/** State 4: Load new variables to show White/Black SES Gap and Achievement Gap */
var state4 = function(scatterplot) {
  scatterplot.setProps({
    xVar: 'wb_ses',
    yVar: 'wb_avg',
    zVar: 'all_sz',
  });
  // get current echart options
  const options = scatterplot.component.getOption();
  // this state is created from the base
  const base = scatterplot.getState('base');
  const baseOverrides = {
    title: {
      text: 'White-Black Achievement Gaps',
      subtext: 'by Differences in Average Family Socioeconomic Resources'
    },
    yAxis: { 
      min:-5,
      max:0,
      name: 'White-Black Achievement Gap (Grade Levels)',
    },
    xAxis: {
      min: -1,
      max: 6,
      name: 'White-Black Socioeconomic Disparity',
    },
    series: [{
      id: 'base',
      type:'scatter',
      itemStyle: {
        color: '#ccc',
        borderColor: 'rgba(0,0,0,0.5)',
        borderWidth: 1
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
              name: 'no racial disparity', 
              coord: [0, -5], 
              symbol: 'none',
              lineStyle: {
                color: 'rgba(0,0,0,0.2)'
              }
            },
            { 
              coord: [ 0, 0], 
              symbol: 'none' 
            },
          ]
        ]
      }
    }]
  }
  return deepmerge.all([ base, baseOverrides ]);
}

/** State 5: Highlight largest districts */
var state5 = function(scatterplot) { 
  var options = scatterplot.component.getOption();
  var base = scatterplot.getState('state4');
  return options;
}

/** State 6: Gwinnett, DC, and Detroit school districts */
var state6 = function(scatterplot) { 
  var options = scatterplot.component.getOption();
  return options;
}

/** State 7: Highlight districts around x=0 */
var state7 = function(scatterplot) { 
  var options = scatterplot.component.getOption();
  return options;
}

/** State 8: Highlight Dekalb and Columbus districts */
var state8 = function(scatterplot) { 
  var options = scatterplot.component.getOption();
  return options;
}

/** State 9: Highlight least and most segregated */
var state9 = function(scatterplot) { 
  var options = scatterplot.component.getOption();
  return options;
}

/** State 10: Achievement vs. Gap in Exposure to School Poverty */
var state10 = function(scatterplot) { 
  var options = scatterplot.component.getOption();
  return options;
}

// create the component
var rootEl = document.getElementById('root');
var scatterplot = new Scatterplot(rootEl);

// set the states
scatterplot.addState('state1', state1);
scatterplot.addState('state2', state2);
scatterplot.addState('state3', state3);
scatterplot.addState('state4', state4);
scatterplot.addState('state5', state5);
scatterplot.addState('state6', state6);
scatterplot.addState('state7', state7);
scatterplot.addState('state8', state8);
scatterplot.addState('state7', state9);
scatterplot.addState('state8', state10);

// load the first state
scatterplot.loadState('state1', { notMerge: true });

// when the component is ready, trigger the state change as desired
scatterplot.on('ready', function(scatterplot) {
  setTimeout(() => {
    scatterplot.loadState('state2');
  }, 4000)
  setTimeout(() => {
    scatterplot.loadState('state3')
  }, 8000)
  setTimeout(() => {
    scatterplot.loadState('state4', { notMerge: true })
  }, 12000)
})