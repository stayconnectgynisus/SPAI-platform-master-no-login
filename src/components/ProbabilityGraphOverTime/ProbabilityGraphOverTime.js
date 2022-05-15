import React from "react";
import { MultiSelect } from "primereact/multiselect";
import "./probability.style.scss";
import { extendMoment } from "moment-range";
import { Calendar } from "primereact/calendar";
import Moment from "moment";
import * as Highcharts from 'highcharts';
import AnnotationsFactory from "highcharts/modules/annotations";
import HighchartsReact from 'highcharts-react-official';
// Load module after Highcharts is loaded
require('highcharts/modules/exporting')(Highcharts);
AnnotationsFactory(Highcharts);

const moment = extendMoment(Moment);

const options = {
  legend: {
    position: "top",
    align: "end",
    padding: 40,
    boxWidth: 10,
    labels: {
      boxWidth: 10,
      usePointStyle: true,
      padding: 20,
    },
  },
};

var conTypeColors = [
  "#7cb5ec",
  "#434348",
  "#90ed7d",
  "#f7a35c",
  "#8085e9",
  "#ca472f",
  "#0b84a5",
  "#6f4e7c",
  "#4773ab",
  "#2b5080",
  "#41274b",
  "#8ba3cc",
  "#a3b5d4",
  "#b9c6dd",
  "#cdd5e7",
  "#dfecf4",
  "#ffffff",
];

function getOptions(mapData) {
  return {
    exporting: {
      enabled: true
    },
    chart: {
      type: 'line',
      backgroundColor: 'transparent',
      height: 430,
    },
    title: {
      text: null,
      style: { color: "#333333", fontSize: "13.5px" }
    },
    tooltip: {
      formatter: function () {
        console.log(this);
        //return 'Extra data: <b>' + this.point.myData + '</b>';
        var f = "<br/>";
        if (this.point.data) {
          f = ' - <span style="color:' + (this.point.PredictionValue == 1 ? 'red' : 'green') + ';font-weight:bold;">' + (this.point.PredictionValue == 1 ? 'Positive' : 'Negative') + '</span></b><br />';
        }
        return '<span style="font-size:10px;">' + this.x + '</span><br/><span style="color:' + this.series.color + '">\u25CF</span> ' + this.series.name + ': <b>' + (this.point.y < 0 ? this.point.y * -1 : this.point.y) + '%' + f;
      },
      //pointFormat: '<span style="color:{series.color}">\u25CF</span> {series.name}: <b>{point.y}</b><br/>'
    },
    plotOptions: {
      line: {
        dataLabels: {
          enabled: false
        },
        enableMouseTracking: true
      }
    },
    credits: {
      enabled: false,
    },
    xAxis: {
      categories: mapData.labels
    },
    yAxis: {
      title: {
        text: null
      }
    },
    series: mapData.datasets,

    annotations: [{
      labels: mapData && mapData.annotations && mapData.annotations.length > 0 ? mapData.annotations : [],
      // labels: [{
      //   point: {
      //     x: 1,
      //     y: 85.2,
      //     xAxis: 0,
      //     yAxis: 0
      //   },
      //   text: 'Veklury 100 mg, Aspirin dose is 1 or 2 tablets, take every 4 hours'
      // }],
      labelOptions: {
        x: -100, y: -15,
        //backgroundColor: 'rgba(255,255,255,0.5)',
      }
    }],
  }
}


class ProbabilityGraphOverTime extends React.Component {
  static navigationOptions = { title: null };

  constructor(props) {
    super(props);
    this.state = {
      data: [],
      mappedData: {},
      showChart: true,
      chartData: {},
      filterData: null,
      times: [],
      fromFilter: null,
      toFilter: null,
      availableOptions: ['Short-Term', 'Mid-Term', 'Long-Term'],
      selectedOptions: ['Short-Term', 'Mid-Term', 'Long-Term']
    };
  }

  componentDidUpdate(prevProps) {
    // if data change

    if (prevProps.data !== this.props.data) {
      this.setState({ data: this.props.data, filterData: [] });
      const mapped = this.mappingData(this.props.data);
      this.setState({ mappedData: mapped });

      const chartData = getOptions(mapped);
      this.setState({ chartData: chartData });
    }
  }
  splitAndJoin(med, d) {
    if (!med) return "";

    med = "<b>Medications (" + moment(d.PredictionDate).format("MM/DD HH:mm").toString() + ")</b><br/>" + med;
    return med.replace(/,/g, '<br/>')
  }
  getFinalSeriesData(data) {
    var finalSeries = [];

    const myString = data.map(x => {
      return x.ConditionType
    });
    const uniqueString = [...new Set(myString)]; //["a", "b", "c", "d"]
    uniqueString.map((c, i) => {
      finalSeries.push({
        name: c,
        showInLegend: true,
        color: conTypeColors[i],
        data: data.filter(x => x.ConditionType == c).map((d) => {
          return { y: d.PredictionValueST == 0 ? d.ProbabilityST * -1 : d.ProbabilityST, data: d, PredictionValue: d.PredictionValueST };
        })
      });
    });
    // #Commented On 14 Aug - Severity of Illness over time (per Condition-Patient) Changes
    // if (this.state.selectedOptions.length == 0 || this.state.selectedOptions.find(x => x == "Short-Term")) {
    //   finalSeries.push({
    //     name: 'Short Term',
    //     showInLegend: true,
    //     color: '#ca472f',
    //     data: data.map((d) => {
    //       return { y: d.ProbabilityST, data: d, PredictionValue: d.PredictionValueST };
    //     })
    //   });
    // }

    // if (this.state.selectedOptions.find(x => x == "Mid-Term")) {
    //   finalSeries.push({
    //     name: 'Mid Term',
    //     showInLegend: true,
    //     color: '#0b84a5',
    //     data: data.map((d) => {
    //       return { y: d.ProbabilityMT, data: d, PredictionValue: d.PredictionValueMT };
    //     })
    //   });
    // }

    // if (this.state.selectedOptions.find(x => x == "Long-Term")) {
    //   finalSeries.push({
    //     name: 'Long Term',
    //     showInLegend: true,
    //     color: '#6f4e7c',
    //     data: data.map((d) => {
    //       return { y: d.ProbabilityLT, data: d, PredictionValue: d.PredictionValueLT };
    //     })
    //   });
    // }
    return finalSeries;
  }

  mappingData(data) {
    // sort the data according to PredictionDate
    data.sort((a, b) => new Date(a.PredictionDate) - new Date(b.PredictionDate));

    var finalSeries = this.getFinalSeriesData(data);


    console.log('Mapped Data', data)
    // mapped object base on the data
    const mapped = {
      labels: data.map((d) =>
        moment(d.PredictionDate).format("MM/DD HH:mm").toString()
      ),
      annotations: data.map((d, i) => {
        if (!d.Medication || d.Medication == "") return {};

        return {
          point: {
            x: i,
            y: d.ProbabilityST,
            xAxis: 0,
            yAxis: 0
          },
          text: this.splitAndJoin(d.Medication, d)
        };
      }),
      datasets: finalSeries,
    };
    return mapped;
  }
  updateSelectedOptions(e) {
    this.setState({ selectedOptions: e });

    setTimeout(() => {
      const mapped = this.mappingData(this.state.filterData && this.state.filterData.length > 0 ? this.state.filterData : this.state.data);
      this.setState({ mappedData: mapped });

      const chartData = getOptions(this.state.mappedData);
      this.setState({ chartData: chartData });
    }, 200)

  }
  onFilterChange(e, filter) {
    // set filter base on the filter name [filter] = dynamic name
    this.setState({ [filter]: e.value });
    setTimeout(() => {
      // get filters and data
      const { data, fromFilter, toFilter } = this.state;
      // if data and filters exist
      if (data.length && fromFilter && toFilter) {
        // get all the data in the filters dates range (fromData toDate)
        const fromDate = new Date(fromFilter),
          toDate = new Date(toFilter),
          filterRange = moment().range(fromDate, toDate);
        const filterDates = data
          .filter((d) => filterRange.contains(moment(d.PredictionDate)))
          .sort(
            (a, b) => new Date(a.PredictionDate) - new Date(b.PredictionDate)
          );

        const mapped = this.mappingData(filterDates);
        this.setState({ mappedData: mapped, filterData: filterDates });

        const chartData = getOptions(this.state.mappedData);
        this.setState({ chartData: chartData });
      }
    });
  }

  pickerTemplate(option) {
    const onFilterChange = (e) => {
      this.setState({ [option.filter]: e.value });
    };
    return (
      <div className="p-clearfix">
        <Calendar
          value={this.state[option.filter]}
          onChange={onFilterChange}
          timeOnly={true}
          hourFormat="12"
          placeholder={option.label}
        />
      </div>
    );
  }

  render() {

    return (
      <div className={"severity-illness exposure-over-time-container gyn-table-container"} style={{ height: 'auto' }}>
        {/*DATES FILTERS*/}
        <div className="header">
          <h3>Severity of Illness over time (per Condition-Patient)</h3>
          {/* #Commented On 14 Aug - Severity of Illness over time (per Condition-Patient) Changes */}
          {/* <div style={{ display: 'flex' }}>
            <MultiSelect
              value={this.state.selectedOptions}
              options={this.state.availableOptions}
              onChange={(e) =>
                this.updateSelectedOptions(e.value)

              }
              style={{ minWidth: "250px", position: "relative", marginRight: '15px' }}
              filter={true}
              maxSelectedLabels={2}
              filterPlaceholder="Search"
              placeholder="Choose"
            />
          </div> */}
        </div>


        <div className="content" style={{ display: 'block' }}>
          <div style={{ width: '100%', clear: 'both', float: 'right', display: 'inline-block', textAlign: 'right' }}>
            <Calendar
              value={this.state.fromFilter}
              showTime
              hideOnDateTimeSelect
              style={{ marginRight: '10px' }}
              onChange={(e) => this.onFilterChange(e, "fromFilter")}
              placeholder={"Date Range - From"}
            />
            <Calendar
              value={this.state.toFilter}
              showTime
              minDate={new Date(this.state.fromFilter)}
              hideOnDateTimeSelect
              onChange={(e) => this.onFilterChange(e, "toFilter")}
              placeholder={"Date Range - To"}
            />
          </div>
          {/*CHART*/}
          {/* <Chart
          className={"chart-line"}
          height={"80"}
          type="line"
          data={filterData ? filterData : mappedData}
          options={options}
        /> */}
          <div style={{ clear: 'both' }}></div>
          {this.state.showChart && this.state.data &&
            <div style={{ width: '100%', clear: 'both' }}>
              <HighchartsReact
                highcharts={Highcharts}
                options={this.state.chartData}
              />
            </div>
          }
        </div>
      </div>
    );
  }
}

export default ProbabilityGraphOverTime;
