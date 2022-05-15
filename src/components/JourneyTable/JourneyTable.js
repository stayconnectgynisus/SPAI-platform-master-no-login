import React from "react";
import "../GynTable/gyn.style.scss";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dropdown } from "primereact/dropdown";
import { CSVLink } from "react-csv";
import Moment from "react-moment";
import env from "../../evn";

// whiteSpace: "nowrap", overflow: 'scroll'
const baseColStyle = { textAlign: "center", padding: "1%", fontSize: "0.7rem" };
const BASE_URL = env.baseUrl + "/exposure/details";
const isProd = env.isProd;

// Headers for csv file
const headers = [
  // { label: "PINDEX", key: "PINDEX" },
  // { label: "PROINDEX", key: "PROINDEX" },
  { label: "Patient MRN", key: "PatientMRN" },
  { label: "Provider MRN", key: "ProviderMRN" },
  { label: "Provider First Name", key: "ProviderFirstName" },
  { label: "Provider Last Name", key: "ProviderLastName" },
  { label: "First Seen", key: "FirstSeen" },
  { label: "Result Date", key: "ResultDate" },
  { label: "Result Status", key: "ResultStatus" },
  { label: "Patient Count", key: "pPatientCount" },
  { label: "Provider Count", key: "pProviderCount" },
  { label: "Patient Risk Level", key: "PatientRiskLevel" },
  { label: "Provider Risk Level", key: "ProviderRiskLevel" },
];

class JourneyTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      currSelected: null,
      filters: {
        resultStatus: null,
      },
    };
  }

  // LIFECYCLES
  componentWillMount() {}
  componentDidMount() {}
  componentWillUnmount() {}
  componentDidUpdate(prevProps) {
    // if selectedItem change
    if (prevProps.selectedItem !== this.props.selectedItem) {
      this.setState({ currSelected: this.props.selectedItem });
    }
    // if data change
    if (prevProps.data !== this.props.data && this.props.data.length > 0) {
      this.props.data.sort(
        (a, b) =>
          new Date(a.FirstSeen).getTime() - new Date(b.FirstSeen).getTime()
      );
      this.setState({ data: this.props.data });
    }
  }

  // TEMPLATES
  statusBodyTemplate(rowData) {
    return (
      <>
        {rowData.ResultStatus ? (
          <span
            className={`status-${
              rowData.ResultStatus
                ? rowData.ResultStatus.toLowerCase()
                : rowData.ResultStatus
            }  status-label`}
            style={{}}
          >
            {rowData.ResultStatus}
          </span>
        ) : (
          <p>Not Available</p>
        )}
      </>
    );
  }
  datesBodyTemplate(rowData, key) {
    return (
      <>
        {rowData[key] ? (
          <Moment format="YYYY/MM/DD - HH:mm">{rowData[key]}</Moment>
        ) : (
          <p>No test result</p>
        )}
      </>
    );
  }
  riskLevelBodyTemplate(rowData, key) {
    return (
      <>
        {rowData[key] ? (
          <span className={`level-${rowData[key]} status-label`}>
            {rowData[key]}
          </span>
        ) : null}
      </>
    );
  }

  // FILTERS
  renderResultStatusFilter() {
    const options = [
      { label: "Pending", value: "pending" },
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

  render() {
    return (
      <div className="gyn-table-container">
        <div className="header">
          <h3>
            Exposure Journey & Risk Analysis - Epidemiological Investigation
          </h3>
          {/* CSV EXPORT */}
        <div className="export">
          <CSVLink data={this.state.data} headers={headers}>
            Export to CSV
          </CSVLink>
        </div>
        </div>
        <div className="content">

        {/* TABLE */}
        <DataTable
          ref={(el) => (this.dt = el)}
          value={this.state.data}
          selectionMode="single"
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
            sortable
            style={baseColStyle}
          />
          <Column
            field="ProviderMRN"
            header="Provider's MRN"
            sortable
            style={baseColStyle}
          />
          <Column
            field="ProviderFirstName"
            header="Provider's First Name"
            sortable
            style={baseColStyle}
          />
          <Column
            field="ProviderLastName"
            header="Provider's Surname"
            sortable
            style={baseColStyle}
          />
          <Column
            field="FirstSeen"
            header="First Seen"
            sortable
            style={baseColStyle}
            body={(data) => this.datesBodyTemplate(data, "FirstSeen")}
          />
          <Column
            field="ResultDate"
            header="Result Date"
            sortable
            style={{ ...baseColStyle, overflow: "inherit" }}
            body={(data) => this.datesBodyTemplate(data, "ResultDate")}
          />
          <Column
            field="ResultStatus"
            header="Result Status"
            sortable
            body={this.statusBodyTemplate}
            style={{ ...baseColStyle, overflow: "inherit" }}
          />
          <Column
            field="pPatientCount"
            header="Cumulative Indirect Exposure"
            sortable
            style={baseColStyle}
          />
          <Column
            field="PatientRiskLevel"
            header="Patient Risk Level"
            body={(row) => this.riskLevelBodyTemplate(row, "PatientRiskLevel")}
            sortable
            style={baseColStyle}
          />
          <Column
            field="pProviderCount"
            header="Cumulative Exposures to Positive Patients"
            sortable
            style={baseColStyle}
          />
          <Column
            field="ProviderRiskLevel"
            header="Provider Risk Level"
            body={(row) => this.riskLevelBodyTemplate(row, "ProviderRiskLevel")}
            sortable
            style={baseColStyle}
          />
          <Column
            field="Department"
            header="Department"
            sortable
            style={baseColStyle}
          />
        </DataTable>
        </div>

      </div>
    );
  }
}

export default JourneyTable;
