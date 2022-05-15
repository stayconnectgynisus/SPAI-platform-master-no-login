import React from "react";

import "primereact/resources/themes/nova/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "./App.css";
import jsonData from "./assets/data/mocked";
import env from "./evn";
import { Button } from "primereact/button";
import JourneyTable from "./components/JourneyTable/JourneyTable";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import moment from "moment";
import GynTable from "./components/GynTable/GynTable";
import ExposureGraphOverTime from "./components/ExposureGraphOverTime/ExposureGraphOverTime";
import ExposureMap from "./components/ExposureMap/ExposureMap";
import ConditionPredictionTable from "./components/ConditionPredictionTable/ConditionPredictionTable";
import ProbabilityGraphOverTime from "./components/ProbabilityGraphOverTime/ProbabilityGraphOverTime";
import FeatureImportanceGraph from "./components/FeatureImportanceGraph/FeatureImportanceGraph";
import APIHelper from '../src/utils/apiHelper'
import DataWareHouseTwo from "./components/DataWareHouse/DataWareHouseTwo";

const isProd = env.isProd;
const BASE_URL = env.baseUrl;
const USER_SIGN = "userSign";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      dataForOverTime: [],
      probabilityDataOverTime: [],
      currSelected: null,
      dataForJourney: [],
      displayTerms: false,
      username: null,
      isUserSign: false,
    };
  }

  // LIFECYCLES
  componentDidMount() {
   
    // check if user already sign on the terms of use
    const userSign = JSON.parse(localStorage.getItem(USER_SIGN));
    if (userSign) {
      // if the user sign check that is not expired ( every sign expired after 24 hours)
      // the time that the user sign
      const signDate = moment(userSign.date);
      const expireDate = signDate.add(24, "hours");
      const currDate = moment();

      // if the sign is expired
      if (expireDate.isBefore(currDate)) {
        // remove from localstorage
        localStorage.removeItem(USER_SIGN);
        // show the popup to sign again
        this.showTermsPopup();
      } else {
        // if is still valid just set isUserSign as true
        this.setState({ isUserSign: true });
      }
    } else {
      this.showTermsPopup();
    }

     // init data for the main table
    // this.initGynTableData();
  }

  // init data for the main table
  initGynTableData() {
    // in prod mode
    if (isProd) {
      // build the url
      const url = `/exposure/details`;
      // send request to the serve
      APIHelper(url)
        .then((data) => {
          // mapping all the InfectionType props to be COVID-19 and sort the data base on SeenOrder
          const d = data
            // .map((o) => {
            //   o.InfectionType = "COVID-19";
            //   return o;
            // })
            .sort((a, b) => a.SeenOrder - b.SeenOrder);
          // set the data in the state
          this.setState({ data: d });
        })
        .catch((err) => {
          // Do something for an error here
        });
    }
    // in dev mode
    else {
      // mapping all the InfectionType props to be COVID-19 and sort the data base on SeenOrder
      const d = jsonData.data
        // .map((o) => {
        //   o.InfectionType = "COVID-19";
        //   return o;
        // })
        .sort((a, b) => a.SeenOrder - b.SeenOrder);
      // Work with JSON data here
      console.log("init MOCKED data after mapping :", d);
    setTimeout(()=>{
      this.setState({ data: d });
    }, 5000);
      console.log("jsonData :", d);
    }
  }
  // get data for the sub table
  getDataForJourney(currSelected, datesFilter) {
    console.log("getDataForJourney");
    console.log("currSelected :", currSelected);

    // get PatientMRN and ProviderMRN props from currSelected
    const { PatientMRN, ProviderMRN } = currSelected;
    // build url with params
    let url = `/exposure/journey?patientMRN=${PatientMRN}&providerMRN=${ProviderMRN}`;
    // if user filter by dates append the dates to the url params
    if (datesFilter) {
      const { fromDate, toDate } = datesFilter;
      url += `&startDate=${fromDate}&endDate=${toDate}`;
    }
    // send request to the server
      APIHelper(url)
      .then((data) => {
        console.log("dataForJourney:", data);
        // set the server response data in the state
        this.setState({ dataForJourney: data });
      })
      .catch((err) => {
        console.log("updateMap err :", err);
      });
  }

  // setters
  setCurrSelected(currSelected, datesFilter) {
    // in case component send string PINDEX instead of object
    if (typeof currSelected === "string") {
      // check if the PINDEX exist in the data
      if (this.state.data.some((d) => d.PINDEX === currSelected)) {
        // if so get reference to the object
        currSelected = this.state.data.find((d) => d.PINDEX === currSelected);
        // set data for the chart line
        const dataForOverTime = this.state.data.filter(
          (row) => row.PINDEX === currSelected.PINDEX
        );
        this.setDataForOverTime(dataForOverTime);
      } else {
        return;
      }
    }
    // set data for the sec table (base on the current selected)
    this.getDataForJourney(currSelected, datesFilter);
    this.setState({ currSelected: currSelected });
  }
  setDataForOverTime(data) {
    this.setState({ dataForOverTime: data });
  }
  setProbabilityDataOverTime(data) {
    this.setState({ probabilityDataOverTime: data });
  }
  setData(data) {
    this.setState({ data: data });
  }

  // terms of use logic
  registerOnTermsOfUse(name) {
    // build url ans request option
    const url = `/termsofuse`;
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name }),
    };

    // in prod mode send request to the server
    if (isProd) {
      APIHelper(url, requestOptions)
        .then((data) => {
          // hide the popup
          this.onHide("displayTerms");
          // set user sign in local storage - it will use to recognize that the user already sign on the terms
          localStorage.setItem(
            USER_SIGN,
            JSON.stringify({ isSign: true, name: name, date: new Date() })
          );
          this.setState({ isUserSign: true });
        });
    } else {
      // if is in dev mode just hide the popup and update the local storage
      this.onHide("displayTerms");
      localStorage.setItem(
        USER_SIGN,
        JSON.stringify({ isSign: true, name: name, date: new Date() })
      );
      this.setState({ isUserSign: true });
    }
  }
  showTermsPopup() {
    this.setState({ displayTerms: true });
  }
  onHide(name) {
    this.setState({
      [`${name}`]: false,
    });
  }

  // render the footer in the terms popup
  renderFooter(name) {
    return (
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        {/* Download terms file link */}
        <a href={require("./assets/terms.docx")} download>
          Download the Terms of use
        </a>
        {/*USER NAME*/}
        <InputText
          style={{ width: "30%" }}
          placeholder={"Your name"}
          value={this.state.username}
          onChange={(e) => this.setState({ username: e.target.value })}
        />
        <div>
          {/* Agree BTN */}
          <Button
            disabled={!this.state.username}
            label="I Agree the Terms "
            icon="pi pi-check"
            onClick={() => this.registerOnTermsOfUse(this.state.username)}
          />
          {/*<Button label="No" icon="pi pi-times" onClick={() => this.onHide(name)} className="p-button-secondary"/>*/}
        </div>
      </div>
    );
  }

  render() {

    return (
      <div className="App ">
        {/*WHITE HEADER*/}
        <header className="App-header">
          <div className="main-container header-wrap">
            <div className = "logo-wrap" >
              <img
                src={require("./assets/Logo.png")}
                className="App-logo"
                alt="logo"
              />
              </div>
            <div className="notification-wrap">
              <svg width="20" height="23" viewBox="0 0 20 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.99994 11C2.99994 7.68629 5.68623 5 8.99994 5C12.3136 5 14.9999 7.68629 14.9999 11V12.831C14.9999 14.2503 15.3857 15.6429 16.1159 16.8599L16.6693 17.7823C17.0364 18.3941 17.2199 18.7 17.2325 18.9497C17.252 19.3366 17.0462 19.6999 16.7045 19.8823C16.4838 20 16.1271 20 15.4137 20H2.58624C1.8728 20 1.51608 20 1.29543 19.8823C0.953675 19.6999 0.747969 19.3366 0.767435 18.9497C0.780004 18.7 0.963532 18.3941 1.33059 17.7823L1.884 16.8599C2.61421 15.6429 2.99994 14.2503 2.99994 12.831V11Z" fill="#1A97DC"/>
                <path d="M11.35 21C11.4328 21 11.5007 21.0673 11.493 21.1498C11.4484 21.6254 11.1923 22.0746 10.7678 22.4142C10.2989 22.7893 9.66304 23 9 23C8.33696 23 7.70107 22.7893 7.23223 22.4142C6.80772 22.0746 6.55165 21.6254 6.50702 21.1498C6.49928 21.0673 6.56716 21 6.65 21L9 21L11.35 21Z" fill="#1A97DC"/>
                <circle cx="17.5" cy="2.5" r="2.5" fill="#FF5353"/>
                </svg>
            </div>
            </div>
        </header>

        {/*APP CONTENT*/}
        <div
          className="content-container main-container"
          style={{ display: this.state.isUserSign ? "block" : "none" }}
        >

        <DataWareHouseTwo
            data={this.state.data}
            setProbabilityDataOverTime={(s) =>
              this.setProbabilityDataOverTime(s)
            }
          />

          <ConditionPredictionTable
            data={this.state.data}
            setProbabilityDataOverTime={(s) =>
              this.setProbabilityDataOverTime(s)
            }
          />

          <div style={{width: '100%', display: 'inline-block'}}>
          <ProbabilityGraphOverTime
            data={this.state.probabilityDataOverTime}
            selectedItem={this.state.currSelected}
          />
            <FeatureImportanceGraph
            data={this.state.probabilityDataOverTime}
            selectedItem={this.state.currSelected}
          />
          </div>

          {/* MAIN TABLE*/}
          <GynTable
            data={this.state.data}
            setDataForOverTime={(s) => this.setDataForOverTime(s)}
            setData={(s) => this.setData(s)}
            selectedItem={this.state.currSelected}
            onSelectedChanged={(selected, datesFilter) =>
              this.setCurrSelected(selected, datesFilter)
            }
            searchData={() =>
              this.initGynTableData()
            }
          />

          {/*  SUB TABLE  */}
          <JourneyTable data={this.state.dataForJourney} />

          {/*  LINE CHART */}
          <ExposureGraphOverTime
            data={this.state.dataForOverTime}
            selectedItem={this.state.currSelected}
          />
          {/*<ExposureMap*/}
          {/*    selectedItem={this.state.currSelected}*/}
          {/*    onSelectedChanged={(selected) => this.setCurrSelected(selected)} />*/}
        </div>

        {/*DIALOG - TERMS OF USE*/}
        <Dialog
          header="Gynsius Terms & Condition "
          visible={this.state.displayTerms}
          style={{ width: "40vw" }}
          onHide={() => this.onHide("displayTerms")}
          footer={this.renderFooter("displayTerms")}
        >
          <div className={"content-term main-container"}>
            <h4>GYNISUS TERMS OF USE </h4>
            <p style={{ width: "70%", textAlign: "left", margin: "0 auto" }}>
              Read the following carefully, as your purchase or use of our
              product(s) implies that you have read and accepted our Terms of
              Use. We reserved the right to change or modify current Terms of
              Use with no prior notice.
              <br /> <br />
              This platform, Infectious Diseases Monitor, (hereafter referred to
              as Infectious Diseases Monitor, or Platform) is owned and operated
              by Gynisus (hereinafter referred as Gynisus, we or Company).
              Please read, review and be sure you understand our Terms of Use
              prior to downloading or using any of the materials or products
              from Gynisus. You should carefully read all of our terms and
              conditions as your purchase or use of any Gynisus product(s),
              membership, or services and use of the Product and any materials
              or Products available herein identifies that you agree to the
              following Terms of Use and that you agree to be bound by these
              terms and conditions accordingly. If you do not agree to these
              terms, then you should not use any of the materials or Products
              available herein, and/or not subscribe to this service{" "}
            </p>
          </div>
        </Dialog>
      </div>
    );
  }
}

export default App;
// function App() {
//   const [currSelected, setCurrSelected] = useState({});
//   const [dataForOverTime, setDataForOverTime] = useState([]);
//   const [data, setData] = useState([]);
//
//   const initData = () => {
//       const d = jsonData.data.map( o =>  {
//           o.InfectionType = 'COVID-19';
//           return o;
//       }).sort( (a,b) => a.SeenOrder - b.SeenOrder);
//       setData(d);
//   }
//
//   initData();
//
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={require('./assets/logo-header.png')} className="App-logo" alt="logo" />
//       </header>
//         <div className="content-container">
//             <GynTable
//                 data={data}
//                 setDataForOverTime={setDataForOverTime}
//                 selectedItem={currSelected}
//                 onSelectedChanged={(selected) => setCurrSelected(selected)}/>
//             <ExposureGraphOverTime
//                 data={dataForOverTime}
//                 selectedItem={currSelected}
//                 onSelectedChanged={(selected) => setCurrSelected(selected)}/>
//             <ExposureMap
//                 selectedItem={currSelected}
//                 onSelectedChanged={(selected) => setCurrSelected(selected)} />
//         </div>
//     </div>
//   );
// }
