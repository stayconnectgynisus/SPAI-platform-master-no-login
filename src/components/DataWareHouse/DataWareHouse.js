import React from "react";
import "../GynTable/gyn.style.scss";
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
import { InputText } from 'primereact/inputtext';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import { Accordion, AccordionTab } from 'primereact/accordion';
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
    fontSize: "13px !important",
    color: "#333",
    position: "relative",
};

const BASE_URL = env.baseUrl;
const isProd = env.isProd;

// CHART OPTIONS


const columns = [
    { label: "Patient's MRN", key: "PatientMRN", isSelected: true },
    { label: "Patient First Name", key: "PatientFirstName", isSelected: true },
    { label: "Patient Last Name", key: "PatientLastNAme", isSelected: true },
    { key: "DiagnosisDate", label: "Diagnosis Date", isSelected: true },

    { key: "ICD10Code", label: "ICD 10 Code", isSelected: true },
    { key: "ConditionDescription", label: "Condition Description", isSelected: true },
    { key: "DiagnosisType", label: "Diagnosis Type", isSelected: true },

    // { key: "ConditionValue", label: "Condition Value", isSelected: true },
    // { key: "Location", label: "Location", isSelected: true },

    // { key: "LabTestDescription", label: "Lab Test Description", isSelected: true },
    // { key: "LabTestValue", label: "Lab Test Value", isSelected: false },
    // { key: "Labtest_Insert_timestamp", label: "Lab Test Date", isSelected: false },
    // { key: "VitalsDescription", label: "Vitals Description", isSelected: false },

    // { key: "VitalsValue", label: "Vitals Value", isSelected: false }, 
    // { key: "Vitals_Insert_timestamp", label: "Vitals Date", isSelected: false },

    // { label: "Gender", key: "Gender", isSelected: false },
    // { label: "Race", key: "Race", isSelected: false },
    // { label: "Language", key: "LANGUAGE", isSelected: false },
    // { label: "Religion", key: "Religion", isSelected: false },
    // { label: "MaritalStatus", key: "MaritalStatus", isSelected: false },
    // { label: "Education", key: "Education", isSelected: false },
    // { label: "Demographics Date", key: "Demographic_Insert_timestamp", isSelected: false },
    // { label: "Provider MRN", key: "ProviderMRN", isSelected: true },
    // { label: "Provider First Name", key: "ProviderFirstName", isSelected: false },
    // { label: "Provider Last Name", key: "ProviderLastName", isSelected: false },
];

const defaultFilter = localStorage.getItem("conditions");

class DataWareHouse extends React.Component {
    MAX_SELECTED = 10;
    pageIndex = 0;
    lastSearchUrl;
    constructor(props) {
        super(props);
        this.state = {
            openModel: false,
            data: [], // TODO : REMOVE IT
            labTestData: [],
            vitalSIgnsData: [],
            notesSummary: [],
            datesData: [],
            isAPICallRunning: false,
            isExpanded: false,
            currSelected: null,
            checkedItems: new Map(),
            checkedColumns: {},
            providerMRN: '',
            patientMRN: '',
            patientInfo: {}
        };
    }

    componentDidMount() {

        this.prepareColumns();
        if (this.inputEl) setTimeout(() => {
            this.inputEl.element.focus()
        }, 1000);
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
        this.setState({ [filter]: e.target.value });
    }

    onSearch() {
        // BUILD URL
        let url = `/connectivitycreation?`;

        if (!this.state.patientMRN && !this.state.providerMRN) {
            alert('Please enter patient MRN or provider MRN.')
            return;
        }
        if (this.state.patientMRN) {
            url += 'patientMRN=' + this.state.patientMRN;
        }
        if (this.state.providerMRN) {
            url += 'providerMRN=' + this.state.providerMRN;
        }

        this.lastSearchUrl = url;

        this.pageIndex = 0;
        url += `&page=${this.pageIndex}`;

        this.setState({ isAPICallRunning: true });
        // send request to the server
        APIHelper(url)
            .then((data) => {

                let finalDatesData = this.prepateDatesData(data);

                this.setState({ isAPICallRunning: false });
                this.setState({
                    data: data.Table,
                    isExpanded: true,
                    patientInfo: data.Table3 && data.Table3.length > 0 ? data.Table3[0] : {},
                    labTestData: data.Table1 || [],
                    vitalSIgnsData: data.Table2 || [],
                    notesSummary: data.Table4 || [],
                    datesData: finalDatesData
                });


            })
            .catch((err) => {
                this.setState({ isAPICallRunning: false });
                console.log(" err :", err);
            });

    }

    prepateDatesData(data) {
        let datesData = data.Table5 || [];
        let finalDatesData = [];
        if (datesData && datesData.length > 0) {

            datesData.map(d => {
                d.date = moment(d.insert_timestamp).format("YYYY-MM-DD");
            });
            var dates = [...new Set(datesData.map((item) => item.date))];
            dates.map(d => {


                let noteTypes = this.prepareNoteTypes(datesData, d);

                finalDatesData.push({
                    date: d,
                    notetypes: noteTypes
                });


            });

            console.log(finalDatesData);

        }
        return finalDatesData;
    }

    prepareNoteTypes(datesData, date) {
        return [...new Set(datesData.filter(d => d.date === date).map((item) => item.NoteType))].map(n => {

            let conditionDescription = [...new Set(datesData.filter(d => d.date === date && d.NoteType == n).map((item) => item.ConditionDescription))].map(c => {

                let plansText = [...new Set(datesData.filter(d => d.date === date && d.NoteType == n && d.ConditionDescription == c).map((item) => item.Assessment_plan))];

                return {
                    problemTitle: c,
                    assessment_plans: plansText
                }
            });
            return {
                noteType: n,
                problemTitles: conditionDescription
            };
        });
    }

    initNextPageData() {
        this.pageIndex++;
        let url = `${this.lastSearchUrl}&page=${this.pageIndex}`;
        console.log("url :", url);
        if (isProd) {
            APIHelper(url).then((data) => {
                this.setState({ data: this.state.data.concat(data) });
            });
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
        var selectedColumns = localStorage.getItem("selected_columns_data_warehouse_v3");
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
        localStorage.setItem("selected_columns_data_warehouse_v3", JSON.stringify(selectedColumns));
    }
    defaultColumns() {
        var selectedColumns = {};
        columns.map((c) => {
            selectedColumns[c.key] = c.isSelected;
        });
        return selectedColumns;
    }
    onExpand() {
        this.setState({
            isExpanded: !this.state.isExpanded
        })
    }
    onCurrSelectedChanged(item) {

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
                <div className="gyn-table-container main-container warehouse">
                    <div className="header">
                        <h3>SPAI Data Warehouse</h3>
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <InputText
                                value={this.state.patientMRN}
                                ref={(el) => this.inputEl = el}
                                style={{ marginRight: "15px", backgroundColor: '#f5fdff' }}
                                onChange={(e) => this.onFilterChange(e, "patientMRN")}
                                placeholder={"Patient MRN"}
                            />

                            <InputText
                                value={this.state.providerMRN}
                                style={{ marginRight: "15px" }}
                                onChange={(e) => this.onFilterChange(e, "providerMRN")}
                                placeholder={"Provider MRN"}
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
                                    width: "230px",
                                    display: !this.state.isAPICallRunning
                                        ? "none"
                                        : "inline-flex",
                                }}
                            >
                                <CircularProgress color="primary" size="1.5rem" />
                                &nbsp;&nbsp;Processing..
                            </MButton>

                            <IconButton
                                aria-label="expand"
                                onClick={() => {
                                    this.onExpand();
                                }}
                            >

                                {!this.state.isExpanded ?
                                    <ExpandMoreIcon />
                                    :
                                    <ExpandLessIcon />
                                }
                            </IconButton>

                        </div>
                    </div>

                    <div className={"content widget-drawer " + (this.state.isExpanded ? 'visible' : '')}>
                        {this.state.patientInfo &&
                            <Grid container spacing={3}>
                                <Grid item xs={4}>
                                    <h4 style={{
                                        display: "inline-flex",
                                        float: "left",
                                        margin: "0px",
                                        marginBottom: "20px",
                                    }}
                                    >Patient information</h4>
                                    <div style={{
                                        width: '100%'
                                    }}>
                                        {this.state.patientInfo && this.state.patientInfo.PatientMRN &&
                                            <React.Fragment>
                                                <div className="width-100">
                                                    <div className="width-50">Patient MRN</div>
                                                    <div className="width-50">{this.state.patientInfo.PatientMRN}</div>
                                                </div>
                                                <div className="width-100">
                                                    <div className="width-50">Patient First Name</div>
                                                    <div className="width-50">{this.state.patientInfo.PatientFirstName}</div>
                                                </div>
                                                <div className="width-100">
                                                    <div className="width-50">Patient Last Name</div>
                                                    <div className="width-50">{this.state.patientInfo.PatientLastName}</div>
                                                </div>
                                                <div className="width-100">
                                                    <div className="width-50">Gender</div>
                                                    <div className="width-50">{this.state.patientInfo.Gender}</div>
                                                </div>
                                                <div className="width-100">
                                                    <div className="width-50">Race</div>
                                                    <div className="width-50">{this.state.patientInfo.Race}</div>
                                                </div>
                                                <div className="width-100">
                                                    <div className="width-50">Language</div>
                                                    <div className="width-50">{this.state.patientInfo.Language}</div>
                                                </div>
                                                <div className="width-100">
                                                    <div className="width-50">Religion</div>
                                                    <div className="width-50">{this.state.patientInfo.Religion}</div>
                                                </div>
                                            </React.Fragment>
                                        }
                                    </div>
                                </Grid>
                                <Grid item xs={8}>

                                    <div className="table" style={{ width: '100%' }}>
                                        <h4 style={{
                                            display: "inline-flex",
                                            float: "left",
                                            margin: "0px",
                                            marginBottom: "10px",
                                        }}
                                        >Medical Conditions (Diagnosis, Medical Hx, Historical Dx, Procedures)</h4>
                                        {/* <a
                                        onClick={(e) => this.handleClickOpen()}
                                        className="float-right"
                                        style={{
                                            cursor: "pointer",
                                            display: "inline-flex",
                                            float: "right", 
                                            marginBottom: "5px",
                                        }}
                                    >
                                        <SettingsIcon style={{ width: "18px", height: "17px" }} />
                &nbsp;Choose Columns
              </a> */}

                                        <DataTable
                                            ref={(el) => (this.dt = el)}
                                            value={this.state.data}
                                            sortMode="multiple"
                                            selectionMode="single"
                                            // multiSortMeta={[
                                            //     {
                                            //         field: "PredictionDate",
                                            //         order: -1,
                                            //     },
                                            //     {
                                            //         field: "EstRiskScaleSTInNum",
                                            //         order: -1,
                                            //     },
                                            // ]}
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
                                                        header="Patient's MRN"
                                                        sortable
                                                        style={baseColStyle}
                                                    />
                                                )}

                                            {this.state.checkedColumns &&
                                                this.state.checkedColumns.PatientFirstName === true && (
                                                    <Column
                                                        field="PatientFirstName"
                                                        header="Patient First Name"
                                                        sortable
                                                        style={baseColStyle}
                                                    />
                                                )}

                                            {this.state.checkedColumns &&
                                                this.state.checkedColumns.PatientLastNAme === true && (
                                                    <Column
                                                        field="PatientLastName"
                                                        header="Patient Last Name"
                                                        sortable
                                                        style={baseColStyle}
                                                    />
                                                )}

                                            {this.state.checkedColumns &&
                                                this.state.checkedColumns.DiagnosisDate === true && (
                                                    <Column
                                                        field="DiagnosisDate"
                                                        header="Diagnosis Date"
                                                        sortable
                                                        style={baseColStyle}
                                                    />
                                                )}



                                            {this.state.checkedColumns && this.state.checkedColumns.ICD10Code === true && (
                                                <Column
                                                    field="ICD10Code"
                                                    header="ICD 10 Code"
                                                    sortable
                                                    style={baseColStyle}
                                                />
                                            )}

                                            {this.state.checkedColumns && this.state.checkedColumns.ConditionDescription === true && (
                                                <Column
                                                    field="ConditionDescription"
                                                    header="Condition Description"
                                                    sortable
                                                    style={baseColStyle}
                                                />
                                            )}




                                            {this.state.checkedColumns && this.state.checkedColumns.DiagnosisType === true && (
                                                <Column
                                                    field="DiagnosisType"
                                                    header="Diagnosis Type"
                                                    sortable
                                                    style={baseColStyle}
                                                />
                                            )}



                                        </DataTable>
                                    </div>
                                </Grid>
                                <Grid item xs={6}>

                                    <div className="table" style={{ width: '100%' }}>
                                        <h4 style={{
                                            display: "inline-flex",
                                            float: "left",
                                            margin: "0px",
                                            marginBottom: "10px",
                                        }}
                                        >Notes Summary</h4>
                                        <DataTable
                                            // ref={(el) => (this.dt = el)}
                                            value={this.state.notesSummary}
                                            sortMode="multiple"
                                            selectionMode="single"
                                            paginator
                                            rows={5}

                                            // first={this.state.first}
                                            sortX={true}
                                            // selection={this.state.currSelected}
                                            // onSelectionChange={(e) => this.onCurrSelectedChanged(e.value)}
                                            // onPage={(e) => this.onPage(e)}
                                            emptyMessage="No Results found"
                                            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} items"
                                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
                                            rowsPerPageOptions={[5, 10, 25, 50]}
                                        >
                                            <Column
                                                field="PatientMRN"
                                                sortField="PatientMRN"
                                                header="Patient MRN"
                                                sortable
                                                style={baseColStyle}
                                            />
                                            <Column
                                                field="PatientFirstName"
                                                header="Patient First Name"
                                                sortable
                                                style={baseColStyle}
                                            />
                                            <Column
                                                field="PatientLastName"
                                                header="Patient Last Name"
                                                sortable
                                                style={baseColStyle}
                                            />


                                            <Column
                                                field="DiagnosisDate"
                                                header="Diagnosis Date"
                                                sortable
                                                style={baseColStyle}
                                            />


                                            <Column
                                                field="ConditionDescription"
                                                header="Condition Description"
                                                sortable
                                                style={baseColStyle}
                                            />


                                            <Column
                                                field="ICD10Code"
                                                header="ICD10 Code"
                                                sortable
                                                style={baseColStyle}
                                            />
                                            <Column
                                                field="BillingCode"
                                                header="DRG"
                                                sortable
                                                style={baseColStyle}
                                            />
                                            <Column
                                                field="DiagnosisType"
                                                header="Diagnosis Type"
                                                sortable
                                                style={baseColStyle}
                                            />
                                            <Column
                                                field="Source"
                                                header="Source"
                                                sortable
                                                style={baseColStyle}
                                            />
                                        </DataTable>
                                    </div>
                                </Grid>
                                <Grid item xs={6} className={"text-align-left"}>
                                    <React.Fragment>
                                        <h4 style={{  
                                            margin: "0px",
                                            marginBottom: "10px",
                                        }}>Notes - Assessment and Plan</h4>
                                        <Accordion>

                                            {this.state.datesData.map((d) => (
                                                <AccordionTab header={d.date} key={d.date}>
                                                    <Accordion  >

                                                        {d.notetypes.map((n) => (
                                                            <AccordionTab header={n.noteType} key={n.noteType}>
                                                                <Accordion  >

                                                                    {n.problemTitles.map((p) => (
                                                                        <AccordionTab header={p.problemTitle} key={p.problemTitle}>
                                                                            <ul>
                                                                                {p.assessment_plans.map((text) => (
                                                                                    <li key={text}>{text}</li>
                                                                                ))}
                                                                            </ul>
                                                                        </AccordionTab>
                                                                    ))}

                                                                </Accordion>
                                                            </AccordionTab>
                                                        ))}

                                                    </Accordion>
                                                </AccordionTab>
                                            ))}

                                        </Accordion>
                                        {(!this.state.datesData || this.state.datesData.length == 0) && (
                                            <p>No results found.</p>
                                        )}

                                    </React.Fragment>

                                </Grid>
                                <Grid item xs={6}>

                                    <div className="table" style={{ width: '100%' }}>
                                        <h4 style={{
                                            display: "inline-flex",
                                            float: "left",
                                            margin: "0px",
                                            marginBottom: "10px",
                                        }}
                                        >Lab Tests</h4>
                                        <DataTable
                                            // ref={(el) => (this.dt = el)}
                                            value={this.state.labTestData}
                                            sortMode="multiple"
                                            selectionMode="single"
                                            paginator
                                            rows={5}

                                            // first={this.state.first}
                                            sortX={true}
                                            // selection={this.state.currSelected}
                                            // onSelectionChange={(e) => this.onCurrSelectedChanged(e.value)}
                                            // onPage={(e) => this.onPage(e)}
                                            emptyMessage="No Results found"
                                            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} items"
                                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
                                            rowsPerPageOptions={[5, 10, 25, 50]}
                                        >
                                            <Column
                                                field="PatientMRN"
                                                sortField="PatientMRN"
                                                header="Patient MRN"
                                                sortable
                                                style={baseColStyle}
                                            />
                                            <Column
                                                field="PatientFirstName"
                                                header="Patient First Name"
                                                sortable
                                                style={baseColStyle}
                                            />
                                            <Column
                                                field="PatientLastName"
                                                header="Patient Last Name"
                                                sortable
                                                style={baseColStyle}
                                            />


                                            <Column
                                                field="LabTest_timestamp"
                                                header="Lab Test timestamp"
                                                sortable
                                                style={baseColStyle}
                                            />


                                            <Column
                                                field="LabTestDescription"
                                                header="Lab Test Description"
                                                sortable
                                                style={baseColStyle}
                                            />


                                            <Column
                                                field="LabTestValue"
                                                header="LabTest Value"
                                                sortable
                                                style={baseColStyle}
                                            />
                                            <Column
                                                field="LabTest_ValueRange"
                                                header="Lab Test Value Range"
                                                sortable
                                                style={baseColStyle}
                                            />
                                        </DataTable>
                                    </div>
                                </Grid>
                                <Grid item xs={6}>

                                    <div className="table" style={{ width: '100%' }}>
                                        <h4 style={{
                                            display: "inline-flex",
                                            float: "left",
                                            margin: "0px",
                                            marginBottom: "10px",
                                        }}
                                        >Vital Signs</h4>
                                        <DataTable
                                            // ref={(el) => (this.dt = el)}
                                            value={this.state.vitalSIgnsData}
                                            sortMode="multiple"
                                            selectionMode="single"
                                            paginator
                                            rows={5}

                                            // first={this.state.first}
                                            sortX={true}
                                            // selection={this.state.currSelected}
                                            // onSelectionChange={(e) => this.onCurrSelectedChanged(e.value)}
                                            // onPage={(e) => this.onPage(e)}
                                            emptyMessage="No Results found"
                                            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} items"
                                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
                                            rowsPerPageOptions={[5, 10, 25, 50]}
                                        >
                                            <Column
                                                field="PatientMRN"
                                                sortField="PatientMRN"
                                                header="Patient MRN"
                                                sortable
                                                style={baseColStyle}
                                            />
                                            <Column
                                                field="PatientFirstName"
                                                header="Patient First Name"
                                                sortable
                                                style={baseColStyle}
                                            />
                                            <Column
                                                field="PatientLastName"
                                                header="Patient Last Name"
                                                sortable
                                                style={baseColStyle}
                                            />


                                            <Column
                                                field="LabTest_timestamp"
                                                header="Vitals timestamp"
                                                sortable
                                                style={baseColStyle}
                                            />


                                            <Column
                                                field="VitalsDescription"
                                                header="Vitals Description"
                                                sortable
                                                style={baseColStyle}
                                            />


                                            <Column
                                                field="VitalsValue"
                                                header="Vitals Value"
                                                sortable
                                                style={baseColStyle}
                                            />
                                            <Column
                                                field="Vitals_ValueRange"
                                                header="Vitals Value Range"
                                                sortable
                                                style={baseColStyle}
                                            />
                                        </DataTable>
                                    </div>
                                </Grid>

                            </Grid>

                        }


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

export default DataWareHouse;
