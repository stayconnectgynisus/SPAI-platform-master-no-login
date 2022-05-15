import React from "react";
import "./exposure.style.scss";
import { extendMoment } from "moment-range";
import { Chart } from "primereact/chart";
import { Calendar } from "primereact/calendar";
import Moment from "moment";
import * as Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

const moment = extendMoment(Moment);

const options = {
  // title: {
  //     display: true,
  //     text: 'My Title',
  //     textAlign: 'left',
  //     fontSize: 16
  // },
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

function getOptions(mapData) {
  return {
    title: {
      text: null,
      style: { color: "#333333", fontSize: "13.5px" }
    },
    chart: {
      type: 'line',
      
    },
    // tooltip: {
    //   pointFormat: ' <b>{point.y}</b>'
    // },
    plotOptions: {
      line: {
            dataLabels: {
                enabled: true
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
          text:null
      }
  },
    series: [{
      name: mapData && mapData.datasets && mapData.datasets.length > 0 ? mapData.datasets[0].label : '',
      showInLegend: true,
      color: '#ef5d22',
      data: mapData && mapData.datasets && mapData.datasets.length > 0 ? mapData.datasets[0].data : [],
    }]
  }
}
class ExposureGraphOverTime extends React.Component {
  static navigationOptions = { title: null };

  constructor(props) {
    super(props);
    this.state = {
      data: [],
      mappedData: {},
      filterData: null,
      times: [],
      currSelected: null,
      fromFilter: null,
      toFilter: null,
    };
  }

  componentDidUpdate(prevProps) {
    // if selectedItem change
    if (prevProps.selectedItem !== this.props.selectedItem) {
      this.setState({ currSelected: this.props.selectedItem });
    }
    // if data change
    if (prevProps.data !== this.props.data) {
      this.setState({ data: this.props.data });
      const mapped = this.mappingData(this.props.data);
      this.setState({ mappedData: mapped });
    }
  }

  mappingData(data) {
    // sort the data according to ExposureDate
    data.sort((a, b) => new Date(a.ExposureDate) - new Date(b.ExposureDate));
    // mapped object base on the data
    const mapped = {
      labels: data.map((d) =>
        moment(d.ExposureDate).format("MM/DD HH:mm").toString()
      ),
      datasets: [
        {
          label: data[0].PatientMRN,
          data: data.map((d) => d.TotalInteractionCount),
          fill: false,
          backgroundColor: "#ef5d22",
          borderColor: "#ef5d22",
        },
      ],
    };
    console.log('Mapped Overtime', mapped)
    return mapped;
  }

  componentWillMount() { }

  componentDidMount() { }

  componentWillUnmount() { }

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
          .filter((d) => filterRange.contains(moment(d.ExposureDate)))
          .sort((a, b) => new Date(a.ExposureDate) - new Date(b.ExposureDate));
        // mapping the data
        const filterData = {
          labels: filterDates.map((d) =>
            moment(d.ExposureDate).format("MM/DD HH:mm").toString()
          ),
          datasets: [
            {
              label: data[0].PatientMRN,
              data: filterDates.map((d) => d.TotalInteractionCount),
              fill: false,
              backgroundColor: "#ef5d22",
              borderColor: "#ef5d22",
            },
          ],
        };
        // set filtered data
        this.setState({ filterData: filterData });
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
    const { filterData, mappedData } = this.state;

    return (
      <div className={"exposure-over-time-container gyn-table-container"} style={{height: 'auto'}}>
        {/*DATES FILTERS*/}
        <div className="header">
          <h3>Exposure Graph Over Time</h3>
          <div>
            <Calendar
              value={this.state.fromFilter}
              showTime
              hideOnDateTimeSelect
              style={{ marginRight: '15px' }}
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
        </div>
        <div className="content" style={{display: 'block'}}>
          {filterData && filterData.length}

          {/*CHART*/}
          {/* <Chart
            className={"chart-line"}
            height={"80"}
            type="line"
            data={filterData ? filterData : mappedData}
            options={options}
          /> */}

          <div style={{ width: '100%', clear: 'both' }}>
            <HighchartsReact
              highcharts={Highcharts}
              options={getOptions(filterData ? filterData : mappedData)}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default ExposureGraphOverTime;
