import axios from 'axios';
import { parse } from 'papaparse';

/** load endpoint from env variable or use fallback */
const endpoint = 'https://d2fypeb6f974r1.cloudfront.net/dev/scatterplot/';

/** variables that are part of the base scatterplot file */ 
const baseVars = ['id', 'name', 'lat', 'lon', 'all_avg', 'all_ses', 'sz' ];

/**
 * Takes multiple data sets with identifiers and merges them
 * into one for use with echarts scatterplot. Filters out 
 * entries where there are not values in all data sets.
 * @param {object} sets a variable amount of data sets - e.g. { "01001": 3.45, ... }
 * @returns {object} e.g. { "01001": [ 3.45, 5.10, 01001 ], ... }
 */
const mergeDatasets = (...sets) => {
  // filter out IDs that are not common to all sets
  const ids = Object.keys(sets[0]).filter(id =>
    sets.reduce((acc, curr) =>
      acc ? 
        curr.hasOwnProperty(id) && 
        parseFloat(curr[id]) > -9999 &&
        parseFloat(curr[id]) > -9999 &&
        id !== "" && id !== "id"
        : false
    , true)
  )
  // create an object with all merged data
  const merged = ids.reduce(
    (acc, curr) => {
      acc[curr] = [
        ...sets.map(s => parseFloat(s[curr])),
        curr
      ]
      return acc;
    }, {}
  )
  return merged;
}

/**
 * Creates a collection with keys in `varNames` with associated data
 * @param {*} varNames e.g. [ 'w_ses', 'b_ses' ]
 * @param {*} data 
 * @returns {object}
 */
const createVariableCollection = (varNames, data) => {
  return varNames.reduce((acc, curr, i) => {
    if (curr === 'base') {
      // extract variables from the "base" file
      baseVars.forEach((v,j) => {
        if(j > 0) {
          acc[v] = Object.keys(data[i])
            .reduce((a, c) => {
              if (data[i][c][j])
                a[c] = data[i][c][j]
              return a;
            }, {})
        }  
      })
    } else {
      acc[curr] = data[i];
    }
    return acc;
  }, {})
}

/**
 * Parses a CSV string of scatterplot data.  Data is `string,number`
 * by default, except for if the data is from the base file. The base file
 * is formatted as `string,string,number,number,number,number,number`
 * @param {*} data 
 * @param {string} varName the name of the variable being parsed
 */
const parseCsvData = (data, varName) => {
  // parse CSV data
  const parsed = parse(data, {
    transform: (value, column) => {
      return (
        (varName === 'base' && column > 1) ||
        (varName !== 'base' && column > 0)
        ) && (value || value === 0) ?
          parseFloat(value) :
          value
    }
  });
  if (parsed.errors.length) {
    throw new Error(parsed.errors[0])
  }
  // reduce array of data into an object
  // e.g. { '0100001': 2.44, ... }
  return parsed.data.reduce((acc, curr) => {
    acc[curr[0]] = curr.length === 2 ? curr[1] : curr;
    return acc;
  }, {});
}

/**
 * Fetches data and returns a promise that contains 
 * an array of all the requested vars data on success.
 * @param {Array<String>} vars array of variable names to fetch (e.g. [ 'all_avg', 'all_ses' ])
 * @param {string} prefix prefix to the varname to fetch (e.g. 'districts')
 * @returns {Promise<object>}
 */
export const fetchScatterplotVars = (vars = [], prefix) => {
  const fetchVars = vars
    .map(v => baseVars.indexOf(v) > -1 ? 'base' : v)
    .filter((value, index, self) => self.indexOf(value) === index)
  return Promise.all(
    fetchVars
      .map(v => axios
        .get(`${endpoint}${prefix ? prefix + '-' : ''}${v}.csv`)
        .then((res) => {
          return parseCsvData(res.data, v);
        })
      )
  )
  .then(data => createVariableCollection(fetchVars, data))
}

/**
 * Returns provided datasets merged into an array that
 * can be used with eCharts data series.
 * @param  {...any} sets a variable number of data sets (e.g { '0100001' : 2.44, ... })
 */
export const getScatterplotData = (...sets) => {
  if (sets.length < 1) {
    throw new Error('Cannot create scatterplot data with less than two variables')
  }
  const merged = mergeDatasets(...sets);
  return Object.keys(merged).map(k => merged[k])
}

