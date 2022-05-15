import React from "react";
import "../GynTable/gyn.style.scss";
import "./condition.scss";
import { DataTable } from "primereact/datatable";
import { MultiSelect } from "primereact/multiselect";
import { Column } from "primereact/column";
import env from "../../evn";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import MButton from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import * as moment from "moment";
import Moment from "react-moment";
import "react-perfect-scrollbar/dist/css/styles.css";
import MultiCascader from "rsuite/lib/MultiCascader";
import SettingsIcon from "@material-ui/icons/Settings";
import PerfectScrollbar from "react-perfect-scrollbar";
import { object } from "prop-types";
import * as Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import Checkbox from "../Checkbox/Checkbox";
import Dialog from "@material-ui/core/Dialog";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import MuiDialogContent from "@material-ui/core/DialogContent";
import MuiDialogActions from "@material-ui/core/DialogActions";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import Typography from "@material-ui/core/Typography";
import { withStyles } from "@material-ui/core/styles";
import APIHelper from "../../utils/apiHelper";
import sample from "../ConditionPredictionTable/sample.json"

// var MultiCascader = require('rsuite/lib/MultiCascader');
const styles = (theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(2),
  },
  closeButton: {
    position: "absolute",
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
});

const DialogTitle = withStyles(styles)((props) => {
  const { children, classes, onClose, ...other } = props;
  return (
    <MuiDialogTitle disableTypography className={classes.root} {...other}>
      <Typography variant="h6">{children}</Typography>
      {onClose ? (
        <IconButton
          aria-label="close"
          className={classes.closeButton}
          onClick={onClose}
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  );
});

const DialogContent = withStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
  },
}))(MuiDialogContent);

const DialogActions = withStyles((theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(1),
  },
}))(MuiDialogActions);

const baseColStyle = {
  textAlign: "center",
  padding: "1% !important",
  fontSize: "0.7rem",
  position: "relative",
};

const absCenter = {
  position: "absolute",
  left: 0,
  right: 0,
  margin: "auto",
  width: "33px",
  top: 0,
  bottom: 0,
  height: "33px",
};

const BASE_URL = env.baseUrl;
const isProd = env.isProd;

// DEMO DATA
const departmentData = [
  { DepartmentCode: "ICU", Department: "Intensive Care Unit" },
  { DepartmentCode: "AC", Department: "Acute Care" },
  { DepartmentCode: "CAR", Department: "Cardiology" },
];
const conditionData = sample;

const conditionList = [
  {
    ConditionICD10: "070.30",
    Condition:
      "Hepatitis B virus infection Hepatitis B virus infection Hepatitis B virus infection Hepatitis B virus infection Hepatitis B virus infection Hepatitis B virus infection",
  },
  { ConditionICD10: "070.32", Condition: "Chronic hepatitis B" },
  { ConditionICD10: "070.51", Condition: "Hep C w/o coma, acute/NOS" },
  { ConditionICD10: "070.70", Condition: "Hepatitis-C" },
  { ConditionICD10: "070.70", Condition: "Syphilis" },
  // {name: 'Paris', code: 'PRS'}
];

function addRows(n) {
  for (let i = 0; i < n; i++) {
    conditionData.push({
      PatientMRN: 12345,
      PatientFirstName: "John",
      PatientLastName: "Doe",
      ConditionType: "Diabetes",
      Performance:
        "PERSONBLAT=0.97, AUC=0.95, TP=0.97, TN=0.96, F1=0.97, AUC=0.95, TP=0.97, TN=0.96 ,F1=0.97, AUC=0.95, TP=0.97, TN=0.96",
      Department: "Acute Care",
      ActualResult: "Positive",
      PredictionValue: 0,
      Probability: 93,
      ActualResultDate: "10/3/1990",
      PredictionDate: "10/3/1990",
      Probability: 87,
    });
  }
}

// addRows(50);

// CHART OPTIONS
const options = {
  title: {
    display: true,
    text: "Projected distribution of conditions",
  },
};

// const getOptions = ({ title }) => ({
//   title: {
//     display: true,
//     text: title,
//   },
// });

function gradientColor(color) {
  return {
    radialGradient: {
      cx: 0.5,
      cy: 0.3,
      r: 0.7,
    },
    stops: [
      [0, color],
      [1, Highcharts.color(color).brighten(-0.3).get("rgb")], // darken
    ],
  };
}
function getOptions(title, data) {
  console.log(data);
  return {
    chart: {
      height: 265,
      backgroundColor: "transparent",
      plotBackgroundColor: null,
      plotBorderWidth: null,
      plotShadow: false,
      type: "pie",
      spacingTop: 0,
      spacingRight: 0,
      spacingBottom: 0,
      spacingLeft: 0,
      plotBorderWidth: 0,
    },
    title: {
      text: null,
      style: { color: "#333333", fontSize: "13.5px" },
    },
    tooltip: {
      pointFormat: " <b>{point.y}</b> ({point.percentage:.0f}%)",
    },
    plotOptions: {
      series: {
        groupPadding: 0,
      },
      pie: {
        //size: '200px',
        // Set point padding to 0
        pointPadding: 0,
        // Set group padding to 0
        groupPadding: 0,
        allowPointSelect: true,
        cursor: "pointer",
        dataLabels: {
          enabled: false,
          format: "<b>{point.name}</b>: {point.percentage:.1f} %",
          connectorColor: "silver",
          distance: -15,
        },
        point: {
          events: {
            legendItemClick: function (a, b, c) {
              if (
                this.visible == true &&
                (this.series.data.length == 1 ||
                  this.series.data.length - 1 ==
                  this.series.data.filter((a) => {
                    return a.visible == false;
                  }).length)
              ) {
                return false;
              }
              return true;
            },
          },
        },
      },
    },
    credits: {
      enabled: false,
    },
    xAxis: {
      lineWidth: 0,
      visible: false,
      startOnTick: false,
      endOnTick: false,
      minPadding: 0,
      maxPadding: 0,
    },
    yAxis: {
      lineWidth: 0,
      visible: false,
      startOnTick: false,
      endOnTick: false,
    },
    accessibility: {
      point: {
        valueSuffix: "%",
      },
    },
    series: [
      {
        name: "Share",
        showInLegend: true,
        data: data,
      },
    ],
  };
}

const columns = [
  { label: "Patient's MRN", key: "PatientMRN", isSelected: true },
  { label: "Patient First Name", key: "PatientFirstName", isSelected: true },
  { label: "Patient Last Name", key: "PatientLastName", isSelected: true },
  { label: "Condition Type", key: "ConditionType", isSelected: true },

  //{ label: "Prediction Value", key: "PredictionValue", isSelected: true },
  { label: "Prediction, Severity (0-100%) - Short-Term", key: "PredictionValueST", isSelected: true },
  { label: "Est. Risk Scale - Short-Term", key: "EstRiskScaleST", isSelected: true },
  {
    label: "First Prediction Date (Severity Short-Term)",
    key: "FirstSeverityST",
    isSelected: true,
  },

  { label: "Prediction, Severity (0-100%) - Mid-Term", key: "PredictionValueMT", isSelected: true },
  { label: "Est. Risk Scale - Mid-Term", key: "EstRiskScaleMT", isSelected: true },
  {
    label: "First Prediction Date (Severity Mid-Term)",
    key: "FirstSeverityMT",
    isSelected: true,
  },


  { label: "Prediction, Severity (0-100%) - Long-Term", key: "PredictionValueLT", isSelected: false },
  { label: "Est. Risk Scale - Long-Term", key: "EstRiskScaleLT", isSelected: false },

  {
    label: "First Prediction Date (Severity Long-Term)",
    key: "FirstSeverityLT",
    isSelected: false,
  },
  // { label: "Est. Risk Scale", key: "EstRiskScale", isSelected: true },



  // { label: "Severity (0-100%)", key: "Probability", isSelected: true },
  { label: "Updated Prediction Date", key: "PredictionDate", isSelected: false },
  //First Prediction Date (Severity)



  {
    label: "Risk Factors (by SPAI)",
    key: "FeatureImportance",
    isSelected: false,
  },
  { label: "Performance", key: "Performance", isSelected: false },
  { label: "Actual Result", key: "ActualResult", isSelected: true },
  { label: "Actual Result Date", key: "ActualResultDate", isSelected: true },
  { label: "Location", key: "Department", isSelected: true },
];

const defaultFilter = localStorage.getItem("conditions");

class ConditionPredictionTable extends React.Component {
  MAX_SELECTED = 10;
  pageIndex = 0;
  lastSearchUrl;
  constructor(props) {
    super(props);
    this.state = {
      openModel: false,
      data: isProd ? [] : conditionData, // TODO : REMOVE IT
      isAPICallRunning: false,
      conditionTypeChartData: [],
      actualResultChartData: [],
      currSelected: null,
      first: 0,
      checkedItems: new Map(),
      checkedColumns: {},
      // conditionList: isProd ? [] : conditionList,
      conditionList: [],
      departmentList: [],
      conditionFilter: defaultFilter ? JSON.parse(defaultFilter) : [],
      departmentFilter: [],
      fromFilter: null,
      toFilter: null,
      actualResultDateFilter: null,
      predictionDateFilter: null,
    };
  }

  componentDidMount() {
    // init condition list
    if (this.state.conditionList.length < 1) this.initConditionListMeta();
    // init department list
    if (!this.state.departmentList.length) this.initDepartmentList();

    // mapping data for pie chart
    this.initChartData(this.state.data);
    this.prepareColumns();
  }

  // HELPERS
  getDatesFilters() {
    let dates = null;
    // if fromDate and toDate is exist (the user select range)
    if (this.state.fromFilter && this.state.toFilter) {
      // set dates with format "YYYY-MM-DD" - it means YEAR-MONTH-DAY
      dates = {
        fromDate: moment(this.state.fromFilter).format("YYYY-MM-DD").toString(),
        toDate: moment(this.state.toFilter).format("YYYY-MM-DD").toString(),
      };
    }
    return dates;
  }

  initConditionListMeta() {
    // TODO: MAKE SURE THAT IS THE URL
    console.log("initConditionListMeta");
    const url = `/meta/list`;
    // if (isProd) {
    APIHelper(url).then((data) => {
      // console.log("conditionList :", data);
      const formatedMenu = this.formatConditionListMenu(data);
      this.setState({ conditionList: formatedMenu });
    });
    // }
  }
  // format the menu for conditionlist
  // formatConditionListMenu = data => data.filter((v, i, a) => a.findIndex(t => (t.moduleType === v.moduleType)) === i)
  //   .map(meta => ({
  //     value: meta.moduletype,
  //     label: meta.moduletype,
  //     children: data.filter(v => v.moduletype === meta.moduletype).map(meta => ({ value: meta.ConditionICD10, label: meta.Condition }))
  //   }));

  formatConditionListMenu(data) {
    var conditionList = [...new Set(data.map((item) => item.moduletype))];
    return conditionList.map((m) => ({
      value: m,
      label: m,
      children: data
        .filter((v) => v.moduletype === m)
        .map((meta) => ({ value: meta.ConditionICD10, label: meta.Condition })),
    }));
  }
  initDepartmentList() {
    const url = `/department/list`;
    if (isProd) {
      APIHelper(url).then((data) => {
        console.log("departmentList :", data);
        this.setState({ departmentList: data });
      });
    } else {
      APIHelper(url).then((data) => {
        if (data && data.length && data.length > 0) {
          console.log("departmentList :", data);
          this.setState({ departmentList: data });
        }
      });
    }
  }

  datesBodyTemplate(rowData, key) {
    return (
      <>
        {rowData[key] && (
          <Moment format="YYYY/MM/DD HH:MM:SS">{rowData[key]}</Moment>
        )}
      </>
    );
  }
  datesBodyTemplateFroFirstPredection(rowData, key) {
    return <>{rowData[key] && this.renderFirstPredection(rowData, key)}</>;
  }
  renderFirstPredection(rowData, key) {
    return (
      moment(rowData[key]).format("YYYY/MM/DD HH:MM:SS").toString() +
      (rowData["FirstSeverity"]
        ? " (" + rowData["FirstSeverity"].toString() + ")"
        : "")
    );
  }

  onFilterChange(e, filter) {
    this.setState({ [filter]: e.value });
  }

  onSearch() {
    // BUILD URL
    let url = `/conditionprediction?`;

    // handle conditions filters
    const conditions = this.state.conditionFilter;
    if (conditions.length > 0) {
      const moduleTypes = [];
      const conditionTypes = [];

      conditions.forEach((condition) => {
        const getModuleIndex = this.state.conditionList.findIndex(
          (val) => val.value === condition
        );

        if (getModuleIndex !== -1) {
          this.state.conditionList[getModuleIndex].children.forEach((val) => {
            conditionTypes.push(val.value);
          });
          moduleTypes.push(condition);
        } else {
          const module = this.state.conditionList.filter((val) => {
            return val.children.filter((v) => v.value === condition) !== -1;
          });
          if (module.length > 0) {
            if (!moduleTypes.includes(module[0].value))
              moduleTypes.push(module[0].value);

            conditionTypes.push(condition);
          }
        }
      });
      localStorage.setItem("conditions", JSON.stringify(conditions));
      url += `moduleType=${moduleTypes.join(
        ","
      )}&conditionType=${conditionTypes.join(",")}&`;
    }

    // handle departments filters
    const departments = this.state.departmentFilter.toString();
    if (departments) url += `department=${departments}&`;

    // handle dates filters
    const dates = this.getDatesFilters();
    if (dates) url += `startDate=${dates.fromDate}&endDate=${dates.toDate}`;

    console.log("url :", url);
    this.lastSearchUrl = url;

    this.pageIndex = 0;
    url += `&page=${this.pageIndex}`;
    // only for test here
    if (isProd) {
      this.setState({ isAPICallRunning: true });
      // send request to the server
      APIHelper(url)
        .then((data) => {
          this.setState({ isAPICallRunning: false });
          if (data && !data.length) {
            return;
          }

          // var lastData = { key: '', value: null }, o = null;
          // data.map(d => {
          //   o = data.filter(f => f.PatientMRN == d.PatientMRN && f.ConditionType == d.ConditionType && f.PredictionDate).sort((a, b) => b.PredictionDate - a.PredictionDate)[0];
          //   if (o) {
          //     d.FirstPredictionDate = o.PredictionDate;
          //     d.FirstProbability = o.Probability ? " (" + o.Probability + ")" : null;
          //   }
          // });

          // get data from the server

          //   data = data.map((o, index) => {
          //     if (index == 0) o.EstRiskScale = "low";
          //     else if (index == 1) o.EstRiskScale = "medium high";
          //     else if (index == 2) o.EstRiskScale = "high";
          //     else o.EstRiskScale = "medium low";
          //     return o;
          //   });
          console.log("FILTERED DATA :", data);
          this.addCustomColumns(data);
          this.setState({ data: data });
          this.setState({ first: 0 });
          this.initChartData(data);
        })
        .catch((err) => {
          this.setState({ isAPICallRunning: false });
          console.log(" err :", err);
        });
    } else {
      this.setState({ isAPICallRunning: true });
      setTimeout(() => {
        this.setState({ isAPICallRunning: false });
      }, 3000);
    }
  }
  addCustomColumns(data) {
    data.map((item) => {
      if (!item) return;
      
      item.EstRiskScaleSTInNum  = this.getEstRiskScalOrder(item.EstRiskScaleST);
      item.EstRiskScaleMTInNum  = this.getEstRiskScalOrder(item.EstRiskScaleMT);
      item.EstRiskScaleLTInNum  = this.getEstRiskScalOrder(item.EstRiskScaleLT);
    });
  }
  getEstRiskScalOrder(value) {
    if (!value) return 1;

    let ord = 1;
    switch (value.toLocaleLowerCase()) {
      case "high":
        ord = 5;
        break;
      case "medium high":
        ord = 4;
        break;
      case "medium":
        ord = 3;
        break;
      case "low medium":
      case "medium low":
        ord = 2;
        break;
      case "low":
        ord = 1;
        break;
      default:
        break;
    }
    return ord;
  }
  initNextPageData() {
    this.pageIndex++;
    let url = `${this.lastSearchUrl}&page=${this.pageIndex}`;
    console.log("url :", url);
    if (isProd) {
      APIHelper(url).then((data) => {
        this.setState({ data: this.state.data.concat(data) });
      });
    } else {
      addRows(50);
    }
  }
  setConditionFilter(c) { }
  handleClickOpen() {
    this.setState({ openModel: true });
    this.prepareColumns();
  }
  handleClose(isSave) {
    this.setState({ openModel: false });
    if (isSave) {
      this.saveColumns();
    }
  }
  handleColumnChange(e) {
    const item = e.target.name;
    const isChecked = e.target.checked;
    this.setState((prevState) => ({
      checkedItems: prevState.checkedItems.set(item, isChecked),
    }));
  }
  prepareColumns() {
    var selectedColumns = localStorage.getItem("selected_columns_v3");
    if (selectedColumns) selectedColumns = JSON.parse(selectedColumns);
    else selectedColumns = this.defaultColumns();

    var checkMap = new Map();
    for (const key in selectedColumns) {
      checkMap.set(key, selectedColumns[key]);
    }
    this.setState({ checkedColumns: selectedColumns, checkedItems: checkMap });
  }
  saveColumns() {
    var selectedColumns = this.defaultColumns();
    this.state.checkedItems.forEach((value, key) => {
      selectedColumns[key] = value;
    });
    this.setState({ checkedColumns: selectedColumns });
    localStorage.setItem("selected_columns_v3", JSON.stringify(selectedColumns));
  }
  defaultColumns() {
    var selectedColumns = {};
    columns.map((c) => {
      selectedColumns[c.key] = c.isSelected;
    });
    return selectedColumns;
  }
  renderDateFilter(key) {
    const onChange = (event) => {
      this.dt.filter(event.value, key, "equals");
      this.setState({ [key]: event.value });
    };

    const onClear = (event) => {
      this.dt.filter(null, key, "equals");
      this.setState({ [key]: null });
    };
    return (
      <div style={{ display: "flex", alignItems: "center" }}>
        <Calendar
          value={this.state[key]}
          onChange={onChange}
          selectionMode="single"
          hideOnDateTimeSelect={true}
          readOnlyInput={false}
        />
        {this.state[key] && <i onClick={onClear} className="pi pi-times"></i>}
      </div>
    );
  }

  onCurrSelectedChanged(item) {
    // get data for the over time graph (the line chart)
    const dataForOverTime = this.state.data.filter(
      (row) =>
        row.PatientMRN === item.PatientMRN 
        //&& row.ConditionType === item.ConditionType #Commented On 14 Aug - Severity of Illness over time (per Condition-Patient) Changes
    );
    // set dataForOverTime in the parent component (App.js)
    this.props.setProbabilityDataOverTime(dataForOverTime);
    // set current selected in current component
    this.setState({ currSelected: item });
    // emit on selected change event in parent component
  }

  initChartData(data) {
    const conditionTypeCounters = {};
    const actualResultCounters = {};
    data.map((item) => {
      if (item.PredictionValueST == 1) {
        if (!conditionTypeCounters[item.ConditionType])
          conditionTypeCounters[item.ConditionType] = 0;
        conditionTypeCounters[item.ConditionType]++;
      }

      if (item.ActualResult.toLowerCase() === "positive") {
        if (!actualResultCounters[item.ConditionType])
          actualResultCounters[item.ConditionType] = 0;
        actualResultCounters[item.ConditionType]++;
      }
    });

    console.log("counters :", conditionTypeCounters);

    const generateData = (counters, colors) => ({
      labels: Object.keys(counters),
      datasets: [
        {
          data: Object.values(counters),
          backgroundColor: colors,
          hoverBackgroundColor: colors,
        },
      ],
    });

    var conTypeColors = [
      "#33557f",
      "#3a6090",
      "#416b9f",
      "#4773ab",
      "#4c7cb8",
      "#668cc2",
      "#8ba3cc",
      "#a3b5d4",
      "#b9c6dd",
      "#cdd5e7",
      "#dfecf4",
      "#ffffff",
    ];
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
    ];
    const conditionTypeChartData = [];
    var i = 0;
    for (const key in conditionTypeCounters) {
      conditionTypeChartData.push({
        name: key,
        y: conditionTypeCounters[key],
        color: gradientColor(conTypeColors[i]),
        selected: i == 0,
      });
      i++;
    }
    i = 0;
    const actualResultChartData = [];
    for (const key in actualResultCounters) {
      actualResultChartData.push({
        name: key,
        y: actualResultCounters[key],
        color: gradientColor(actualResulColor[i]),
        selected: i == 0,
      });
      i++;
    }

    this.setState({ conditionTypeChartData: conditionTypeChartData });
    this.setState({ actualResultChartData: actualResultChartData });

    console.log("conditionTypeChartData :", conditionTypeChartData);
    console.log("actualResultChartData :", actualResultChartData);
  }

  formatPrediction(value) {
    if (!value || typeof (value) != "number") return value;

    return value.toFixed('1');
  }

  onPage(e) {
    // {first: 55, rows: 5, page: 11, pageCount: 12}
    // let isLastPage = e.page === e.pageCount - 1;

    // if (isLastPage) {
    //   //    need to load more data here;
    //   this.initNextPageData();
    // }
    console.log("e :", e);
    this.setState({ first: e.first });
  }

  render() {
    return (
      <React.Fragment>
        <div className="gyn-table-container main-container">
          <div className="header">
            <h3>Profile Assessment driven by SPAI</h3>
            <div style={{ display: "flex", alignItems: "center" }}>
              <MultiCascader
                data={this.state.conditionList}
                style={{
                  minWidth: "250px",
                  position: "relative",
                  marginRight: "15px",
                }}
                onChange={(conditionFilter) =>
                  this.setState({ conditionFilter })
                }
                value={this.state.conditionFilter}
              />
              {/* <MultiSelect
              value={this.state.conditionFilter}
              options={this.state.conditionList}
              onChange={(e) =>
                e.value.length <= this.MAX_SELECTED &&
                this.setState({ conditionFilter: e.value })
              }
              style={{ minWidth: "250px", position: "relative", marginRight: '15px' }}
              filter={true}
              maxSelectedLabels={2}
              filterPlaceholder="Search"
              placeholder="Choose Conditions"
              optionLabel="Condition"
              optionValue="ConditionICD10"
            /> */}
              <Calendar
                value={this.state.fromFilter}
                showTime
                hideOnDateTimeSelect
                style={{ marginRight: "15px" }}
                onChange={(e) => this.onFilterChange(e, "fromFilter")}
                placeholder={"Date Range - From"}
              />
              <Calendar
                value={this.state.toFilter}
                showTime
                minDate={new Date(this.state.fromFilter)}
                hideOnDateTimeSelect
                style={{ marginRight: "15px" }}
                onChange={(e) => this.onFilterChange(e, "toFilter")}
                placeholder={"Date Range - To"}
              />

              <MultiSelect
                value={this.state.departmentFilter}
                options={this.state.departmentList}
                onChange={(e) =>
                  e.value.length <= this.MAX_SELECTED &&
                  this.setState({ departmentFilter: e.value })
                }
                style={{ minWidth: "12em", marginRight: "15px" }}
                filter={true}
                maxSelectedLabels={2}
                filterPlaceholder="Search"
                placeholder="Choose Departments"
                optionLabel="Department"
                optionValue="DepartmentCode"
              />
              <Button
                label="Search"
                style={{
                  display: this.state.isAPICallRunning ? "none" : "inline-flex",
                }}
                onClick={() => {
                  this.onSearch();
                }}
              />
              <MButton
                variant="contained"
                color="primary"
                className="btnProgress"
                style={{
                  borderRadius: 3,
                  textTransform: "none",
                  marginLeft: "5px",
                  opacity: "0.7",
                  display: !this.state.isAPICallRunning
                    ? "none"
                    : "inline-flex",
                }}
              >
                <CircularProgress color="primary" size="1.5rem" />
                &nbsp;&nbsp;Processing..
              </MButton>
            </div>
          </div>

          <div className="content" style={{ paddingTop: "30px" }}>
            <div className="table">
              <a
                onClick={(e) => this.handleClickOpen()}
                className="float-right"
                style={{
                  cursor: "pointer",
                  display: "inline-flex",
                  float: "right",
                  clear: "both",
                  marginBottom: "5px",
                }}
              >
                <SettingsIcon style={{ width: "18px", height: "17px" }} />
                &nbsp;Choose Columns
              </a>

              <DataTable
                ref={(el) => (this.dt = el)}
                value={this.state.data}
                sortMode="multiple"
                selectionMode="single"
                multiSortMeta={[
                  {
                    field: "PredictionDate",
                    order: -1,
                  },
                  {
                    field: "EstRiskScaleSTInNum",
                    order: -1,
                  },
                ]}
                paginator
                rows={5}
                first={this.state.first}
                sortX={true}
                selection={this.state.currSelected}
                onSelectionChange={(e) => this.onCurrSelectedChanged(e.value)}
                onPage={(e) => this.onPage(e)}
                emptyMessage="No Results found"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} items"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
                rowsPerPageOptions={[5, 10, 25, 50]}
              >
                {this.state.checkedColumns &&
                  this.state.checkedColumns.PatientMRN === true && (
                    <Column
                      field="PatientMRN"
                      sortField="PatientMRN"
                      filter
                      header="Patient's MRN"
                      sortable
                      style={baseColStyle}
                    />
                  )}

                {this.state.checkedColumns &&
                  this.state.checkedColumns.PatientFirstName === true && (
                    <Column
                      field="PatientFirstName"
                      filter
                      header="Patient First Name"
                      sortable
                      style={baseColStyle}
                    />
                  )}

                {this.state.checkedColumns &&
                  this.state.checkedColumns.PatientLastName === true && (
                    <Column
                      field="PatientLastName"
                      filter
                      header="Patient Last Name"
                      sortable
                      style={baseColStyle}
                    />
                  )}

                {this.state.checkedColumns &&
                  this.state.checkedColumns.ConditionType === true && (
                    <Column
                      field="ConditionType"
                      filter
                      header="Condition Type"
                      sortable
                      style={{ baseColStyle, width: "150px" }}
                    />
                  )}

                {/* {this.state.checkedColumns &&
                  this.state.checkedColumns.PredictionValue === true && (
                    <Column
                      field="PredictionValue"
                      filter
                      header="Prediction Value"
                      sortable
                      style={baseColStyle}
                      allowOverflow={true}
                      body={(rowData) => (
                        <span
                          className={`status-label status-${
                            rowData.PredictionValue === 1
                              ? "positive"
                              : "negative"
                          }`}
                        >
                          {rowData.PredictionValue}
                        </span>
                      )}
                    />
                  )} */}

                {this.state.checkedColumns &&
                  this.state.checkedColumns.PredictionValueST === true && (
                    <Column
                      field="PredictionValueST"
                      filter
                      header="Prediction, Severity (0-100%) - Short-Term"
                      sortable
                      style={{ baseColStyle, textAlign: 'center' }}
                      allowOverflow={true}
                      body={(rowData) => (
                        <span style={{ width: '70px' }}>
                          <span className={`status-label status-${rowData.PredictionValueST == 1 ? "positive" : "negative"}`}>{rowData.PredictionValueST}</span>
                          <span style={{ width: '35px', fontWeight: "bold" }}>&nbsp;, {this.formatPrediction(rowData.ProbabilityST)}</span>
                        </span>
                      )}
                    />
                  )}

                {this.state.checkedColumns &&
                  this.state.checkedColumns.EstRiskScaleST === true && (
                    <Column
                      field="EstRiskScaleSTInNum"
                      filter
                      header="Est. Risk Scale - Short-Term"
                      sortable
                      style={{ baseColStyle, width: "100px" }}
                      body={(rowData) => (
                        <div>
                          <span id={rowData.EstRiskScaleST && rowData.EstRiskScaleST.toLocaleLowerCase()} className={`est-risk-scale`} >
                            <span className="spantext">
                              {rowData.EstRiskScaleST && rowData.EstRiskScaleST.toLocaleLowerCase()}
                            </span>
                          </span>
                        </div>
                      )}
                    />
                  )}

                {this.state.checkedColumns && this.state.checkedColumns.FirstSeverityST === true && (
                  <Column
                    field="FirstSeverityST"
                    filter
                    header="First Prediction Date (Severity Short-Term)"
                    sortable
                    body={(rowData) => (
                      <span>
                        {rowData.FirstPreditionDate && moment(rowData.FirstPreditionDate).format("YYYY/MM/DD HH:MM:SS").toString()}
                        {rowData.FirstSeverityST && (
                          <span><br />{' (' + rowData.FirstSeverityST + ')'}</span>
                        )}
                      </span>
                    )}
                    style={{ baseColStyle, width: "150px" }}
                  />
                )}



                {this.state.checkedColumns &&
                  this.state.checkedColumns.PredictionValueMT === true && (
                    <Column
                      field="PredictionValueMT"
                      filter
                      header="Prediction, Severity (0-100%) - Mid-Term"
                      sortable
                      style={{ baseColStyle, textAlign: 'center' }}
                      allowOverflow={true}
                      body={(rowData) => (
                        <span style={{ width: '70px' }}>
                          <span className={`status-label status-${rowData.PredictionValueMT == 1 ? "positive" : "negative"}`}>{rowData.PredictionValueMT}</span>
                          <span style={{ width: '35px', fontWeight: "bold" }}>&nbsp;, {this.formatPrediction(rowData.ProbabilityMT)}</span>
                        </span>
                      )}
                    />
                  )}

                {this.state.checkedColumns &&
                  this.state.checkedColumns.EstRiskScaleMT === true && (
                    <Column
                      field="EstRiskScaleMTInNum"
                      filter
                      header="Est. Risk Scale - Mid-Term"
                      sortable
                      style={{ baseColStyle, width: "100px" }}
                      body={(rowData) => (
                        <div>
                          <span id={rowData.EstRiskScaleMT && rowData.EstRiskScaleMT.toLocaleLowerCase()} className={`est-risk-scale`} >
                            <span className="spantext">
                              {rowData.EstRiskScaleMT && rowData.EstRiskScaleMT.toLocaleLowerCase()}
                            </span>
                          </span>
                        </div>
                      )}
                    />
                  )}

                {this.state.checkedColumns && this.state.checkedColumns.FirstSeverityMT === true && (
                  <Column
                    field="FirstSeverityMT"
                    filter
                    header="First Prediction Date (Severity Mid-Term)"
                    sortable
                    body={(rowData) => (
                      <div>
                        {rowData.FirstPreditionDate && moment(rowData.FirstPreditionDate).format("YYYY/MM/DD HH:MM:SS").toString()}
                        {rowData.FirstSeverityMT && (
                          <span><br />{' (' + rowData.FirstSeverityMT + ')'}</span>
                        )}
                      </div>
                    )}
                    style={{ baseColStyle, width: "150px" }}
                  />
                )}


                {this.state.checkedColumns &&
                  this.state.checkedColumns.PredictionValueLT === true && (
                    <Column
                      field="PredictionValueLT"
                      filter
                      header="Prediction, Severity (0-100%) - Long-Term"
                      sortable
                      style={{ baseColStyle, textAlign: 'center' }}
                      allowOverflow={true}
                      body={(rowData) => (
                        <span style={{ width: '70px' }}>
                          <span className={`status-label status-${rowData.PredictionValueLT == 1 ? "positive" : "negative"}`}>{rowData.PredictionValueLT}</span>
                          <span style={{ width: '35px', fontWeight: "bold" }}>&nbsp;, {this.formatPrediction(rowData.ProbabilityLT)}</span>
                        </span>
                      )}
                    />
                  )}



                {this.state.checkedColumns &&
                  this.state.checkedColumns.EstRiskScaleLT === true && (
                    <Column
                      field="EstRiskScaleLTInNum"
                      filter
                      header="Est. Risk Scale - Long-Term"
                      sortable
                      style={{ baseColStyle, width: "100px" }}
                      body={(rowData) => (
                        <div>
                          <span id={rowData.EstRiskScaleLT && rowData.EstRiskScaleLT.toLocaleLowerCase()} className={`est-risk-scale`} >
                            <span className="spantext">
                              {rowData.EstRiskScaleLT && rowData.EstRiskScaleLT.toLocaleLowerCase()}
                            </span>
                          </span>
                        </div>
                      )}
                    />
                  )}
                {this.state.checkedColumns && this.state.checkedColumns.FirstSeverityLT === true && (
                  <Column
                    field="FirstSeverityLT"
                    filter
                    header="First Prediction Date (Severity Long-Term)"
                    sortable
                    body={(rowData) => (
                      <span>
                        {rowData.FirstPreditionDate && moment(rowData.FirstPreditionDate).format("YYYY/MM/DD HH:MM:SS").toString()}
                        {rowData.FirstSeverityLT && (
                          <span><br />{' (' + rowData.FirstSeverityLT + ')'}</span>
                        )}
                      </span>
                    )}
                    style={{ baseColStyle, width: "150px" }}
                  />
                )}
                {this.state.checkedColumns &&
                  this.state.checkedColumns.PredictionDate === true && (
                    <Column
                      field="PredictionDate"
                      filter
                      filterElement={this.renderDateFilter("PredictionDate")}
                      body={(rowData) =>
                        this.datesBodyTemplate(rowData, "PredictionDate")
                      }
                      header="Updated Prediction Date"
                      sortable
                      style={{ ...baseColStyle, overflow: "inherit" }}
                    />
                  )}




                {this.state.checkedColumns &&
                  this.state.checkedColumns.FeatureImportance === true && (
                    <Column
                      field="FeatureImportance"
                      filter
                      body={(rowData) => (
                        <PerfectScrollbar
                          style={{ maxHeight: "80px", maxWidth: "120px" }}
                        >
                          {rowData.FeatureImportance}
                        </PerfectScrollbar>
                      )}
                      header="Risk Factors (by SPAI)"
                      sortable
                      style={{ ...baseColStyle, width: "100px" }}
                    />
                  )}

                {this.state.checkedColumns &&
                  this.state.checkedColumns.Performance === true && (
                    <Column
                      field="Performance"
                      filter
                      body={(rowData) => (
                        <PerfectScrollbar style={{ maxHeight: "80px" }}>
                          {rowData.Performance}
                        </PerfectScrollbar>
                      )}
                      header="Performance"
                      sortable
                      style={{
                        ...baseColStyle,
                        overflow: "scroll",
                        width: "10%",
                      }}
                    />
                  )}

                {this.state.checkedColumns &&
                  this.state.checkedColumns.ActualResult === true && (
                    <Column
                      field="ActualResult"
                      filter
                      header="Actual Result"
                      sortable
                      style={{ ...baseColStyle, width: "10%" }}
                      body={(rowData) => (
                        <span
                          className={`status-label status-${rowData.ActualResult &&
                            rowData.ActualResult.toLocaleLowerCase()
                            }`}
                        >
                          {rowData.ActualResult}
                        </span>
                      )}
                    />
                  )}

                {this.state.checkedColumns &&
                  this.state.checkedColumns.ActualResultDate === true && (
                    <Column
                      field="ActualResultDate"
                      filter
                      filterElement={this.renderDateFilter("ActualResultDate")}
                      body={(rowData) =>
                        this.datesBodyTemplate(rowData, "ActualResultDate")
                      }
                      header="Actual Result Date"
                      sortable
                      style={{ ...baseColStyle, overflow: "inherit" }}
                    />
                  )}
                {this.state.checkedColumns &&
                  this.state.checkedColumns.Department === true && (
                    <Column
                      field="Department"
                      filter
                      header="Location"
                      sortable
                      style={baseColStyle}
                    />
                  )}
              </DataTable>
            </div>

            <div className="chart">
              {/*Projected distribution of conditions*/}
              {this.state.conditionTypeChartData &&
                this.state.conditionTypeChartData.length > 0 && (
                  <section style={{ width: "100%", position: "relative" }}>
                    <h4 style={{ fontWeight: "normal", marginTop: "2px" }}>
                      Projected distribution of conditions
                    </h4>
                    <div
                      className="projected-distribution"
                      style={{ position: "relative" }}
                    >
                      <HighchartsReact
                        highcharts={Highcharts}
                        options={getOptions(
                          "Projected distribution of conditions",
                          this.state.conditionTypeChartData
                        )}
                      />
                    </div>
                  </section>
                )}
              {this.state.actualResultChartData.length > 0 && (
                <section style={{ width: "100%", position: "relative" }}>
                  <h4 style={{ fontWeight: "normal" }}>
                    Actual Distribution of conditions
                  </h4>
                  <div
                    className="actual-distribution"
                    style={{ position: "relative" }}
                  >
                    <HighchartsReact
                      highcharts={Highcharts}
                      options={getOptions(
                        "Actual Distribution of conditions",
                        this.state.actualResultChartData
                      )}
                    />
                  </div>
                </section>
              )}
              {/* <Chart
              type="pie"
              width={"100%"}
              data={this.state.actualResultChartData}
              options={getOptions({
                title: "Actual Distribution of conditions",
              })}
            /> */}
            </div>
          </div>
        </div>
        <Dialog
          onClose={(e) => this.handleClose()}
          aria-labelledby="customized-dialog-title"
          open={this.state.openModel}
        >
          <DialogTitle
            id="customized-dialog-title"
            onClose={(e) => this.handleClose()}
          >
            Choose Columns
          </DialogTitle>
          <DialogContent dividers style={{ width: 400 }}>
            {columns.map((item) => (
              <label
                key={item.key}
                style={{ display: "block" }}
                className="checkbox-list"
              >
                <Checkbox
                  name={item.key}
                  checked={this.state.checkedItems.get(item.key)}
                  onChange={(e) => this.handleColumnChange(e)}
                />
                <span>&nbsp;{item.label}</span>
              </label>
            ))}
          </DialogContent>
          <DialogActions>
            <MButton onClick={(e) => this.handleClose(true)} color="primary">
              Save changes
            </MButton>
          </DialogActions>
        </Dialog>
      </React.Fragment>
    );
  }
}

export default ConditionPredictionTable;
