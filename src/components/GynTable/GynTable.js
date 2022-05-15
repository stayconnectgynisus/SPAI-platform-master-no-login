import React from "react";
import "./gyn.style.scss";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { InputText } from "primereact/inputtext";
import Moment from "react-moment";
import env from "../../evn";
import * as moment from "moment";
import { CSVLink } from "react-csv";
import "mapbox-gl-leaflet";
import "leaflet.vectorgrid";
import { Button } from "primereact/button";
import MButton from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import {
  Circle,
  CircleMarker,
  Map,
  Marker,
  Polygon,
  Polyline,
  Popup,
  Rectangle,
  TileLayer,
} from "react-leaflet";
import APIHelper from "../../utils/apiHelper";
// import MapboxGlLayer from '@mongodb-js/react-mapbox-gl-leaflet';
const baseColStyle = { textAlign: "center", padding : "1%", fontSize: "0.7rem" };
const BASE_URL =   "/exposure/details";
const isProd = env.isProd;

// 47.379/8.5375
// 13/4289/2869
const center = [42.89, 28.69];

// Headers for csv file
const headers = [
  { label: "PINDEX", key: "PINDEX" },
  { label: "PROINDEX", key: "PROINDEX" },
  { label: "Patient MRN", key: "PatientMRN" },
  { label: "Provider MRN", key: "ProviderMRN" },
  { label: "Provider First Name", key: "ProviderFirstName" },
  { label: "Provider Last Name", key: "ProviderLastName" },
  { label: "Exposure Date", key: "ExposureDate" },
  { label: "Exposure Type", key: "ExposureType" },
  { label: "Result Status", key: "ResultStatus" },
  { label: "Total InteractionCount", key: "TotalInteractionCount" },
  { label: "Result Date", key: "ResultDate" },
];
// 13.62/47.37862/8.55126
const position = [47.3543, 8.5496];
class GynTable extends React.Component {
  asyncFilterList = ["PatientMRN", "ProviderMRN", "ToDate", "FromDate"];
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      isAPICallRunning: false,
      currSelected: null,
      filters: {
        infectionType: null,
        resultStatus: null,
        fromDate: null,
        dateFilter: null,
        toDate: null,
        exposureType: null,
      },
      asyncFilters: {},
    };
    //body cells
    this.statusBodyTemplate = this.statusBodyTemplate.bind(this);
  }

  // LIFECYCLES
  componentDidUpdate(prevProps) {
    if (prevProps.selectedItem !== this.props.selectedItem) {
      this.setState({ currSelected: this.props.selectedItem });
    }     
    if (prevProps.data !== this.props.data) {
      const data = this.props.data;
      data.sort(
        (a, b) =>
          new Date(b.ExposureDate).getTime() -
          new Date(a.ExposureDate).getTime()
      );
      this.setState({ data: data });
    }
  }

  componentWillMount() { }
  componentDidMount() {
    // const map = window.L.map('map', {
    //     center: center,
    //     zoom: 9
    // });
    // map.options.minZoom = 2;
    // const gl = window.L.mapboxGL({
    //     // accessToken: '1',
    //     style: require('../../assets/style.json'),
    //     zoom: 9
    // }).addTo(map);
    // map.fitWorld();
    // http://192.168.99.100:32771/data/v3/10/535/358.pbf
    // const openMapTilesUrl = 'http://192.168.99.100:32771/data/v3/{z}/{x}/{y}.pbf';
    // const openMapTilesLayer = window.L.vectorGrid.protobuf(openMapTilesUrl, {
    //     vectorTileLayerStyles: require('../../assets/style.json'),
    //     // subdomains: '0123',
    //     attribution: '© OpenStreetMap contributors, © MapTiler',
    //     // key: 'abcdefghi01234567890' // Get yours at https://maptiler.com/cloud/
    // });
    // openMapTilesLayer.addTo(map);
  }
  componentWillUnmount() { }

  // TEMPLATES
  statusBodyTemplate(rowData) {
    return (
      <>
        <span
          className={`status-${rowData.ResultStatus.toLowerCase()}  status-label`}
          style={{}}
        >
          {rowData.ResultStatus}
        </span>
      </>
    );
  }
  datesBodyTemplate(rowData) {
    return (
      <>
        <Moment format="YYYY/MM/DD - HH:mm">{rowData.ExposureDate}</Moment>
      </>
    );
  }

  onSearch(){
      this.setState({ isAPICallRunning: true });
      this.props.searchData();
  }
  // FILTERS
  renderInfectionFilter(rowData) {
    const options = [
      { label: "COVID-19", value: "COVID-19" },
      { label: "MRSA", value: "MRSA" },
      { label: "Cdiff", value: "Cdiff" },
    ];
    const onChange = (event) => {
      this.dt.filter(event.value, "InfectionType", "equals");
      this.setState({
        filters: { ...this.state.filters, infectionType: event.value },
      });
    };

    const onClear = (event) => {
      this.dt.filter(null, "InfectionType", "equals");
      this.setState({
        filters: { ...this.state.filters, infectionType: null },
      });
    };

    return (
      <div style={{ display: "flex", alignItems: "center" }}>
        <Dropdown
          value={this.state.filters.infectionType}
          options={options}
          onChange={onChange}
          placeholder="Infection Type"
        />
        {this.state.filters.infectionType && (
          <i onClick={onClear} className="pi pi-times"></i>
        )}
      </div>
    );
  }
  renderResultStatusFilter() {
    const options = [
      { label: "Pending", value: "pending" },
      { label: "Suspect", value: "suspect" },
      { label: "Positive", value: "positive" },
      { label: "Negative", value: "negative" },
    ];
    const onChange = (event) => {
      this.dt.filter(event.value, "ResultStatus", "equals");
      this.setState({
        filters: { ...this.state.filters, resultStatus: event.value },
      });
    };
    const onClear = (event) => {
      this.dt.filter(null, "ResultStatus", "equals");
      this.setState({ filters: { ...this.state.filters, resultStatus: null } });
    };
    return (
      <div style={{ display: "flex", alignItems: "center" }}>
        <Dropdown
          value={this.state.filters.resultStatus}
          options={options}
          onChange={onChange}
          placeholder="Results Status"
        />
        {this.state.filters.resultStatus && (
          <i onClick={onClear} className="pi pi-times"></i>
        )}
      </div>
    );
  }
  renderExposureTypeFilter() {
    const options = [
      { label: "Direct", value: "Direct" },
      { label: "Indirect", value: "Indirect" },
      { label: "No Exposure", value: "No Exposure" },
    ];
    const onChange = (event) => {
      this.dt.filter(event.value, "ExposureType", "equals");
      this.setState({
        filters: { ...this.state.filters, exposureType: event.value },
      });
    };
    const onClear = (event) => {
      this.dt.filter(null, "ExposureType", "equals");
      this.setState({ filters: { ...this.state.filters, exposureType: null } });
    };
    return (
      <div style={{ display: "flex", alignItems: "center" }}>
        <Dropdown
          value={this.state.filters.exposureType}
          options={options}
          onChange={onChange}
          placeholder="Results Status"
        />
        {this.state.filters.exposureType && (
          <i onClick={onClear} className="pi pi-times"></i>
        )}
      </div>
    );
  }
  renderDateFilter() {
    const onChange = (event) => { 
      this.dt.filter(event.value, "dates", "equals");
      this.setState({
        filters: { ...this.state.filters, dateFilter: event.value },
      });

      if (event.value[0] && event.value[1]) {
        setTimeout(() => {
          this.onAsyncFilterChanged();
        });
      }
    };

    const onClear = (event) => {
      console.log("onClear ");
      this.dt.filter(null, "dates", "equals");
      this.setState({ filters: { ...this.state.filters, dateFilter: null } });
      setTimeout(() => {
        this.onAsyncFilterChanged();
      });
    };
    return (
      <div style={{ display: "flex", alignItems: "center" }}>
        <Calendar
          value={this.state.filters.dateFilter}
          onChange={onChange}
          selectionMode="range"
          hideOnDateTimeSelect={true}
          readOnlyInput={false}
        />
        {this.state.filters.dateFilter && (
          <i onClick={onClear} className="pi pi-times"></i>
        )}
      </div>
    );
  }

  renderMRNFilter(key) {
    const onChange = (event) => {
      this.dt.filter(event, key, "contains");
      this.setState({
        asyncFilters: { ...this.state.asyncFilters, [key]: event },
      });
      setTimeout(() => {
        this.onAsyncFilterChanged();
      });
    };
    const onClear = (event) => {
      this.dt.filter(null, key, "contains");
      this.setState({
        asyncFilters: { ...this.state.asyncFilters, [key]: null },
      });
      setTimeout(() => {
        this.onAsyncFilterChanged();
      });
    };
    return (
      <div style={{ display: "flex", alignItems: "center" }}>
        <InputText
          value={this.state.asyncFilters[key]}
          onChange={(e) => onChange(e.target.value)}
        />
        {this.state.filters.exposureType && (
          <i onClick={onClear} className="pi pi-times"></i>
        )}
      </div>
    );
  }

  // EVENTS
  onAsyncFilterChanged() {
    // get startDate and endDate for filter params
    const dates = this.getDatesFilters();
    let searchParams = new URLSearchParams({
      ...this.state.asyncFilters,
    }).toString();
    // if date exist add dates to url as params
    if (dates) {
      searchParams += `&startDate=${dates.fromDate}&endDate=${dates.toDate}`;
    } 
    console.log(searchParams);
    // in prod env
    if (isProd) {
      const url = `${BASE_URL}?${searchParams}`;
      console.log("onAsyncFilterChanged url :", url);
      //    need to verify that is working implement
      APIHelper(url)
        .then((data) => {
          console.log("onAsyncFilterChanged :", data);
          // mapping all the InfectionType to be COVID-19
          const d = data
            // .map((o) => {
            //   return o;
            // })
            .sort((a, b) => a.SeenOrder - b.SeenOrder);

          console.log("onAsyncFilterChanged mapping :", d);
          // set data in parent component (App.js)
          this.props.setData(d);
        })
        .catch((err) => {
          console.log("onAsyncFilterChanged err :", err);
        });
    }
  }
  onCurrSelectedChanged(item) {
    // get data for the over time graph (the line chart)
    const dataForOverTime = this.state.data.filter(
      (row) => row.PINDEX === item.PINDEX
    );
    // set dataForOverTime in the parent component (App.js)
    this.props.setDataForOverTime(dataForOverTime);
    // set current selected in current component
    this.setState({ currSelected: item });
    const dates = this.getDatesFilters();
    // emit on selected change event in parent component
    this.props.onSelectedChanged(item, dates);
  }
  onFilterChanged(e) {
    // wait to react to render the dom and update the state
    setTimeout(() => {
      // get the key name of the current chaged filter
      const key = Object.keys(e.filters)[0];
      //  check if is async filter ( is so need to send request to the server to bring data)
      if (this.asyncFilterList.includes(key)) {
        // if is async filter update the asyncFilters object in the state
        this.setState({
          asyncFilters: {
            ...this.state.asyncFilters,
            [key]: e.filters[key].value,
          },
        });
        console.log("asyncFilters :", this.state.asyncFilters);
        // call onAsyncFilterChanged handler
        this.onAsyncFilterChanged();
      } else {
        // if is local filter do some logic here...
      }
    });
  }
  // HELPERS
  getDatesFilters() {
    const { dateFilter } = this.state.filters;
    let dates = null;
    // if fromDate and toDate is exist (the user select range)
    if (dateFilter && dateFilter[0] && dateFilter[1]) {
      // set dates with format "YYYY-MM-DD" - it means YEAR-MONTH-DAY
      dates = {
        fromDate: moment(this.state.filters.dateFilter[0])
          .format("YYYY-MM-DD")
          .toString(),
        toDate: moment(this.state.filters.dateFilter[1])
          .format("YYYY-MM-DD")
          .toString(),
      };
    }
    return dates;
  }

  render() {
    console.log(this.props.data);

    return (
      <>
        <div className="gyn-table-container Detailed-Exposure-Map">
          {/* CSV export */}

          <div className="header">
            <h3 style={{ float: 'left' }}>Detailed Exposure Map</h3>
            <div className="export" style={{ float: 'right' }}>
             
            <Button
              label="Search"
              style={{ display: (this.state.isAPICallRunning || (this.state.data && this.state.data.length > 0) ? 'none' : 'inline-flex') }}
              onClick={() => {
                this.onSearch();
              }}
            />
             <MButton
              variant="contained"
              color="primary"

              className="btnProgress"
              style={{ borderRadius: 3, textTransform: 'none', marginLeft: '5px', opacity: '0.7', 
              display: (!this.state.isAPICallRunning || (this.state.data && this.state.data.length > 0)? 'none' : 'inline-flex') }}

            >
              <CircularProgress color="primary" size="1.5rem" />
              &nbsp;&nbsp;Processing..
            </MButton>
           
            {
            this.state.data && this.state.data.length > 0 && 
            <CSVLink data={this.state.data} headers={headers}>
                Export to CSV
            </CSVLink>
            }
              
            </div>
          </div>
          <div className="content">
            {/* TABLE ELEMENT*/}
            <DataTable
              ref={(el) => (this.dt = el)}
              value={this.state.data}
              selectionMode="single"
              selection={this.state.currSelected}
              onSelectionChange={(e) => this.onCurrSelectedChanged(e.value)}
              paginator
              rows={5}
              emptyMessage="No Results found"
              currentPageReportTemplate="Showing {first} to {last} of {totalRecords} items"
              paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
              rowsPerPageOptions={[5, 10, 25, 50]}
            >
              <Column
                field="PatientMRN"
                header="Patient's MRN"
                filter
                filterElement={this.renderMRNFilter("PatientMRN")}
                sortable
                style={baseColStyle}
              />
              <Column
                field="ProviderMRN"
                header="Provider's MRN"
                filter
                filterElement={this.renderMRNFilter("ProviderMRN")}
                sortable
                style={baseColStyle}
              />
              <Column
                field="ProviderFirstName"
                header="Provider's First Name"
                sortable
                filter
                style={baseColStyle}
              />
              <Column
                field="ProviderLastName"
                header="Provider's Surname"
                filter
                sortable
                style={baseColStyle}
              />
              <Column
                field="ExposureType"
                header="Exposure Type"
                filter
                filterElement={this.renderExposureTypeFilter()}
                sortable
                style={{ ...baseColStyle, overflow: "inherit" }}
              />
              <Column
                field="ExposureDate"
                header="Dates"
                headerStyle={{ width: "15%" }}
                filter
                filterElement={this.renderDateFilter()}
                body={this.datesBodyTemplate}
                sortable
                style={{ ...baseColStyle, overflow: "inherit" }}
              />
              <Column
                field="InfectionType"
                header="Infection Type"
                filter
                filterElement={this.renderInfectionFilter()}
                sortable
                style={{ ...baseColStyle, overflow: "inherit" }}
              />
              <Column
                field="ResultStatus"
                header="Result Status"
                filter
                filterElement={this.renderResultStatusFilter()}
                sortable
                body={this.statusBodyTemplate}
                style={{ ...baseColStyle, overflow: "inherit" }}
              />
              <Column
                field="Department"
                header="Department"
                filter
                sortable
                style={{ ...baseColStyle, overflow: "inherit" }}
              />
            </DataTable>
          </div>
        </div>
        {/*<div id="map"></div>*/}

        {/*<Map center={center} zoom={5}>*/}
        {/*    <MapboxGlLayer*/}
        {/*        attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'*/}
        {/*        style={require('../../assets/style.json')}*/}
        {/*    />*/}
        {/*</Map>*/}
      </>
    );
  }
}

export default GynTable;
