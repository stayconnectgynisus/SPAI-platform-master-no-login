import React from 'react';
import './exposure-map.scss';
import {OrganizationChart} from 'primereact/organizationchart';
import {Dropdown} from "primereact/dropdown";
import jsonData from '../../assets/data/mocked-exposure';
import Tree from 'react-tree-graph';
import 'react-tree-graph/dist/style.css'
import env from '../../evn';
import TreeChart from "../TreeChart/TreeChart";
import APIHelper from '../../utils/apiHelper';
const isProd = env.isProd;
const BASE_URL = '/exposure/path';


let data = {
    name: 'Parent',
    children: [{
        name: 'Child One'
    }, {
        name: 'Child Two'
    }]
};
class ExposureMap extends React.Component {
    static navigationOptions = {title: null,};

    constructor(props) {
        super(props);
        this.state = {
            currSelected: null,
            data: {}
        };
    }

    componentDidMount() {
        this.initData()
    }

    mappingData(data) {
        const matrix = [];
        data.sort( (a, b) => a.hLevel - b.hLevel ).map( item => {
            if (!matrix[item.hLevel] ) matrix[item.hLevel] = [];
            matrix[item.hLevel].push(item);
        });

        const findParent = (root, mrn) => {
            let parent = null;

            console.log('findParent root:' , root)
            if (root.itemData.MRN === mrn) {
                parent = root;
                return parent;
            }

            const scanChild = (child) => {
                console.log('scanChild child:' , child)
                if (child.itemData.MRN === mrn) {
                    parent = child;
                    return;
                } else {
                    if (!child.children) return;
                    child.children && child.children.forEach(c => {
                        if (parent) return;
                        scanChild(c);
                    })
                }
            }

            root.children.forEach(child => {
                if (parent) return;
                scanChild(child);
            });

            if (parent) return parent;
            else        return null
        }

        // const findParent = (prevRow, mrn) => {
        //     // root.itemData.MRN === mrn
        //     return prevRow.find( item => item.itemData.mrn === mrn ) || null;
        // }
        let exposureMapData = {};

        matrix.forEach( (row, i) => {
            // root element
            if (i === 0) {
                const firstItem = row[0];
                exposureMapData = {
                    name: `${firstItem.MRN}`,
                    itemData: firstItem,
                    isRoot: true,
                    expanded: true,
                    gProps: {
                        className: `level-${firstItem.RiskLevel}`
                    },
                    children: []
                };
                return;
            }

            // child
            row.forEach( item => {
                const rootElement = exposureMapData;
                const parentIndex = i -1;
                const splittedPath = item.path.split('/').filter( p => p );
                const parentMRN = splittedPath[parentIndex];
                const parentEl = findParent(rootElement, parentMRN);
                if (!parentEl) return;
                if (!parentEl.children) parentEl.children = [];
                // level-${node.itemData.RiskLevel}`
                parentEl.children.push({
                    name: `${item.MRN}`,
                    itemData: item,
                    expanded: false,
                    gProps: {
                        className: `level-${item.RiskLevel}`
                    },
                    children: []
                })
            })
        });
        this.setState({data: exposureMapData});
    }

    initData() {
        console.log('ExposureMap InitData call');
        if (isProd) {
            const url = `${BASE_URL}`;
            APIHelper(url).then(data => {
                console.log('ExposureMap InitData :', data);
                this.mappingData(data);
            }).catch(err => {
                console.log('ExposureMap InitData err: ', err );
                // Do something for an error here
            });
        } else {
            const data = jsonData || [];
            this.mappingData(data);
        }
    }

    updateMap(item) {
        console.log('updateMap try to get data');
        const url = `${BASE_URL}?patientMRN=${item.PatientMRN}&ProviderMRN=${item.ProviderMRN}`;
        console.log('updateMap url :' , url);
        APIHelper(url).then(data => {
            console.log('updateMap:', data);
            this.mappingData(data);
        }).catch(err => {
                console.log('updateMap err :' , err);
        });
    }

    componentWillMount() {}
    componentWillUnmount() {}

    componentDidUpdate(prevProps) {
        // if selectedItem change
        if (prevProps.selectedItem !== this.props.selectedItem) {
            const item = this.props.selectedItem;
            console.log('expose map :' , item);
            this.setState({currSelected: item});
            if (isProd) {
                this.updateMap(item);
            }
        }
    }

    nodeTemplate(node) {
        const props = this.props;
        const selfImage = require('../../assets/level-1.png');
        const doctorImage = require('../../assets/level-2.png');
        const personImage = require('../../assets/person.png');
        const img = node.itemData.type === 'P' ? doctorImage : personImage;
        if (node.isRoot) {
            return (
                <div className={`node-container root-node level-${node.itemData.RiskLevel}`} onClick={ () => props.onSelectedChanged(node.itemData.MRN)}>
                    <div>
                        <img src={selfImage}/>
                        <p>{node.itemData.MRN}</p>
                    </div>
                </div>
            );
        }

        else {
            return (
                <div className={`node-container sub-node level-${node.itemData.RiskLevel}`} onClick={() => props.onSelectedChanged(node.itemData.MRN)}>
                    <div className={'person-content'}>
                        <img src={img}/>
                        <p>{node.itemData.MRN}</p>
                    </div>
                </div>
            );
        }
    }

    render() {
        return (
            <div className={'exposure-map-container'}>
                <div className="header">
                    <p>Epidimilogical Exposure Map</p>
                     <Dropdown value={this.state.infectionTypeFilter} options={[]} onChange={() => {}} placeholder="Department" />
                </div>
                <div className={'row'}>
                    <ColorTextItem level={1} text={'High Risk'} />
                    <ColorTextItem level={2} text={'High Risk'} />
                    <ColorTextItem level={3} text={'Moderate risk'} />
                    <ColorTextItem level={4} text={'Low Risk'} />
                    <ColorTextItem level={5} text={'Low Risk'} />
                </div>
                        <Tree
                            data={this.state.data}
                            animated
                            // svgProps={{
                            //     transform: 'rotate(90)'
                            // }}
                            textProps={{
                                transform: 'rotate(0) scale(0.7) translate(-50, 20)'
                            }}
                            height={600}
                            width={600}>
                        </Tree>

                {/*{ Object.keys(this.state.data).length && <TreeChart data={this.state.data}/> }*/}
                {/*{ this.state.data.length ? <OrganizationChart value={this.state.data} nodeTemplate={this.nodeTemplate.bind(this)}></OrganizationChart> : null }*/}
            </div>);
    }
}

export default ExposureMap;


const ColorTextItem = (props) => {

    return(
        <div className={'color-item'}>
            <div className={`circle level-${props.level}`}></div>
            <span className={`text level-${props.level}-text`}> {props.text} </span>
        </div>
    )
}
