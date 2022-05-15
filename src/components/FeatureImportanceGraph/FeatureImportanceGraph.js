import React from "react";
import "./featureimportance.style.scss";
import { extendMoment } from "moment-range";
import { Chart } from "primereact/chart";
import { Calendar } from "primereact/calendar";
import Moment from "moment";
import * as Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import env from "../../evn";
import { MultiSelect } from "primereact/multiselect";
import APIHelper from "../../utils/apiHelper";
// Load module after Highcharts is loaded
require('highcharts/modules/exporting')(Highcharts);
const moment = extendMoment(Moment);
const BASE_URL = "/LabTestResult";


class FeatureImportanceGraph extends React.Component {
  static navigationOptions = { title: null };

  constructor(props) {
    super(props);
    this.state = {
      data: [],
      mappedData: {},
      filterData: null,
      times: [],
      fromFilter: null,
      toFilter: null,
      patientMRN: null,
      conditionType: null,
      conditionDescriptions: [],
      selectedDescriptions: [],
      isNoData: true
    };
  }

  async componentDidUpdate(prevProps) {
    // if data change

    if (prevProps.data !== this.props.data) {


      await this.setState({
        isNoData: true,
        data: this.props.data,
        conditionType: this.props.data[0].ConditionType,
        patientMRN: this.props.data[0].PatientMRN,
        conditionDescriptions: [],
        selectedDescriptions: []
      });
      setTimeout(() => {
        this.getData();
      }, 100);
    }
  }


  getOptions(title) {
    var marker = {
      fillColor: 'red',
      states: {
        hover: {
          fillColor: 'red',
          lineColor: 'red'
        }
      }
    };
    var result = this.state.data.filter((x) => x.ConditionDescription == title),
      finalResult = (result || []).map((x) => {

        if (!x.value) x.Value = x.Value || 0;

        if (x.minRange && x.Value < x.minRange) {
          return {
            y: x.Value,
            marker: marker
          }
        }

        if (x.maxRange && x.Value > x.maxRange) {
          return {
            y: x.Value,
            marker: marker
          }
        }

        return {
          y: x.Value,
          marker: {
            fillColor: 'green',
            states: {
              hover: {
                fillColor: 'green',
                lineColor: 'green'
              }
            }
          }
        }
      }),
      categories = (result || []).map((x) => { return moment(x.Insert_timestamp).format("MM/DD HH:mm").toString() }),
      totalCount = this.state.selectedDescriptions.length,
      color = (this.state.conditionDescriptions.find(x => x.title === title) || {}).color;

    return {

      chart: {
        type: 'line',
        backgroundColor: 'transparent',
        height: totalCount <= 1 ? 230 * 2 : 230
      },
      title: {
        text: null,
        style: { color: "#333333", fontSize: "13.5px" }
      },
      tooltip: {
        formatter: function () {
          console.log(this);
          //return 'Extra data: <b>' + this.point.myData + '</b>';
          var f = this.series.color;
          if (this.point.marker) {
            f = this.point.marker.fillColor;
          }
          return '<span style="font-size:10px;">' + this.x + '</span><br/><span style="color:' + f + '">\u25CF</span> ' + this.series.name + ': <b>' + this.point.y;
        },
        //pointFormat: ' <b>{point.y}</b>'
      },
      plotOptions: {
        line: {
          dataLabels: {
            enabled: true
          },
          enableMouseTracking: true
        }
      },
      exporting: {
        enabled: true
      },
      credits: {
        enabled: false,
      },
      xAxis: {
        categories: categories
      },
      yAxis: {
        title: {
          text: title
        }
      },
      series: [{
        name: title,
        showInLegend: true,
        color: color || '#ef5d22',
        data: finalResult && finalResult.length > 0 ? finalResult : [],
      }]
    }
  }

  getData() {
    var actualResulColor = [
      "#173057",
      "#543b74",
      "#92407d",
      "#cd4975",
      "#f4625e",
      "#fe8e3a",
      "#fec106",
      "#a3b5d4",
      "#b9c6dd",
      "#cdd5e7",
      "#dfecf4",
      "#ffffff",
    ]

    if (!this.state.conditionType || !this.state.patientMRN) return;

    var url = BASE_URL + '?patientMRN=' + this.state.patientMRN + '&conditionType=' + this.state.conditionType;
    APIHelper(url)
      .then((data) => {
        if (!data || !data.length) return;

        this.setState({
          selectedDescriptions: []
        });

        var unique = [], i = 0;
        data.map(d => {
          if (!unique.find((x) => x.title == d.ConditionDescription)) {
            unique.push({
              title: d.ConditionDescription,
              color: '#333'//actualResulColor[i]
            })
            if (i <= 1) {
              this.setState(prevState => ({
                selectedDescriptions: [...prevState.selectedDescriptions, d.ConditionDescription]
              }))
            }
            i++;
          }

        });
        this.setState({ conditionDescriptions: unique, data: data, isNoData: false });
      })
      .catch((err) => {
        console.log("FeatureImportance err :", err);
      });
  }
  mappingData(data) {
    // sort the data according to PredictionDate
    data.sort(
      (a, b) => new Date(a.PredictionDate) - new Date(b.PredictionDate)
    );
    console.log('Mapped Data', data)
    // mapped object base on the data
    const mapped = {
      labels: data.map((d) =>
        moment(d.PredictionDate).format("MM/DD HH:mm").toString()
      ),
      datasets: [
        {
          label: `${data[0].ConditionType}-${data[0].PatientMRN}`,
          data: data.map((d) => d.Probability),
          fill: false,
          backgroundColor: "#ef5d22",
          borderColor: "#ef5d22",
        },
      ],
    };
    return mapped;
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
        // mapping the data
        const filterData = {
          labels: filterDates.map((d) =>
            moment(d.PredictionDate).format("MM/DD HH:mm").toString()
          ),
          datasets: [
            {
              label: `${data[0].ConditionType}-${data[0].PatientMRN}`,
              data: filterDates.map((d) => d.Probability),
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
    console.log(filterData, mappedData);

    return (
      <div className={"feature-importance exposure-over-time-container gyn-table-container"} style={{ height: 'auto' }}>
        {/*DATES FILTERS*/}
        <div className="header">
          <h3>Lab tests trends over time (per Condition-Patient)</h3>
          <div style={{ display: 'flex' }}>
            <MultiSelect
              value={this.state.selectedDescriptions}
              options={this.state.conditionDescriptions}
              onChange={(e) =>
                this.setState({ selectedDescriptions: e.value })
              }
              style={{ minWidth: "250px", position: "relative", marginRight: '15px' }}
              filter={true}
              maxSelectedLabels={2}
              filterPlaceholder="Search"
              placeholder="Choose"
              optionLabel="title"
              optionValue="title"
            />
          </div>
        </div>


        <div className="content" style={{ minHeight: 495 }}>
          {/*CHART*/}
          <div style={{ width: '100%', clear: 'both' }}>
            {
              this.state.isNoData && <h3 style={{ fontWeight: 400 }}>No records found</h3>
            }
            {this.state.selectedDescriptions.map((s, i) => (
              <div key={i} style={{position: 'relative'}}>
                <HighchartsReact
                  highcharts={Highcharts}
                  options={this.getOptions(s)}

                />
                <div key={i} style={{clear: 'both', position: 'absolute', right: '0', bottom: '17px'}}>
                  <span style={{display: 'inline-flex'}}>
                    <svg xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline-block', width: '10px', height: '10px'}}>
                      <circle cx="5" cy="5" r="5" fill="green"></circle>
                    </svg>
                    <span style={{ position: "relative", top: "-4px"}}>&nbsp;In Range&nbsp;&nbsp;</span>
                  </span>
                  <span style={{display: 'inline-flex'}}>
                    <svg xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline-block', width: '10px', height: '10px'}}>
                      <circle cx="5" cy="5" r="5" fill="red"></circle>
                    </svg>
                    <span style={{ position: "relative", top: "-4px"}}>&nbsp;Out Range</span>
                  </span>
                </div>
              </div>


            ))}
          </div>


        </div>
      </div>
    );
  }
}

export default FeatureImportanceGraph;
