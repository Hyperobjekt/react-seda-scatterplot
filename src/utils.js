import axios from 'axios';
import { parse } from 'papaparse';


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
 * 
 * @param {array} varNames e.g. [ 'id', 'all_avg', 'all_coh' ]
 * @param {object} data e.g { '01001': [ '01001', 3.22, 1.2 ], ... }
 * @returns {object} { 'all_avg': { '01001': 3.22, ... }, 'all_coh': { '01001': 3.22, ... }}
 */
const extractVarsFromDataArray = (varNames, data) => {
  console.log(varNames, data)
  return varNames.reduce((obj, v, i) => {
    if(v !== 'id') {
      obj[v] = Object.keys(data)
        .reduce((a, c) => {
          if (data[c][i])
            a[c] = data[c][i]
          return a;
        }, {})
    }
    return obj
  }, {})
}

/**
 * Creates a collection with keys in `varNames` with associated data
 * @param {*} varNames e.g. [ 'w_ses', 'b_ses' ]
 * @param {*} data 
 * @returns {object} { 'w_ses': { '01001': 0.43, ... }, 'b_ses': { '01001': 0.32, ... } }
 */
const createVariableCollection = (varNames, data, metaVars) => {
  return varNames.reduce((acc, curr, i) => {
    if (curr === 'meta') {
      // extract variables from the "meta" file
      metaVars.forEach((v,j) => {
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
 * by default, except for if the data is from the meta file. The meta file
 * is formatted as `string,string,number,number,number,number,number`
 * @param {*} data 
 * @param {string} varName the name of the variable being parsed
 */
const parseCsvData = (data, isMeta) => {
  // parse CSV data
  const parsed = parse(data, {
    transform: (value, column) => {
      return (
        (isMeta && column > 1) || (!isMeta && column > 0)
        ) && (value || value === 0) && !isNaN(parseFloat(value)) ?
          parseFloat(value) : value
    }
  });
  if (parsed.errors.length) {
    const errorMessage = parsed.errors[0].type + ':'
      + parsed.errors[0].code + ' on row '
      + parsed.errors[0].row
    throw new Error(errorMessage)
  }
  // reduce array of data into an object
  // e.g. { '0100001': 2.44, ... }
  return {
    'header': parsed.data[0],
    'data': parsed.data.reduce((acc, curr) => {
      // skip header row
      if (curr[0] !== 'id') {
        acc[curr[0]] = curr.length === 2 ? curr[1] : curr;
      }
      return acc;
    }, {})
  }
}

/**
 * Gets the data url to the provided prefix, varName, state
 * @param {string} endpoint endpoint for where the scatterplot data lives
 * @param {string} prefix data prefix or region (e.g. 'counties')
 * @param {string} varName the variable name to use
 * @param {string} state the state to fetch data, used for schools only (e.g. 01)
 */
const getDataUrlForVarName = (endpoint, prefix, varName, state) => {
  if (prefix === 'schools') {
    if (state) {
      return varName === 'meta' ?
        `${endpoint}meta/schools/${state}.csv` :
        `${endpoint}schools/${state}/${varName}.csv`
    }
  } else {
    return varName === 'meta' ?
      `${endpoint}meta/${prefix}.csv` :
      `${endpoint}${prefix ? prefix + '/' : ''}${varName}.csv`
  }
}

/**
 * Fetches the data for a x / y pair for schools
 * @param {string} endpoint endpoint for where the scatterplot data lives
 * @param {string} var1 
 * @param {string} var2 
 */
export const fetchReducedPair = (endpoint, var1, var2) => {
  const filename = [ var1, var2 ].sort().join('-')
  return axios
    .get(`${endpoint}schools/reduced/${filename}.csv`)
    .then((res) => parseCsvData(res.data, true))
    .then(({header, data }) => extractVarsFromDataArray(header, data))
    .catch((err) => {
      console.error(err);
      return {}
    })
}

/**
 * Fetches data and returns a promise that contains 
 * an array of all the requested vars data on success.
 * @param {Array<String>} vars array of variable names to fetch (e.g. [ 'all_avg', 'all_ses' ])
 * @param {string} prefix prefix to the varname to fetch (e.g. 'districts')
 * @returns {Promise<object>}
 */
export const fetchScatterplotVars = 
  (vars = [], prefix, endpoint, metaVars = [], state) => {
    const fetchVars = vars
      .map(v => metaVars.indexOf(v) > -1 ? 'meta' : v)
      .filter((value, index, self) => self.indexOf(value) === index)
    return Promise.all(
      fetchVars
        .map(v => axios
          .get(getDataUrlForVarName(endpoint, prefix, v, state))
          .then((res) => {
            return parseCsvData(res.data, v === 'meta').data;
          }, (err) => {
            console.error(err);
            throw new Error(`Could not get ${getDataUrlForVarName(endpoint, prefix, v, state)}`)
          })
        )
    )
    .then(data => createVariableCollection(fetchVars, data, metaVars))
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
