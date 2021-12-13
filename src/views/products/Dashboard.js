import {
    CAlert,
    CBadge,
    CButton,
    CCard,
    CCardBody,
    CCol,
    CDropdown,
    CDropdownItem,
    CDropdownMenu,
    CDropdownToggle,
    CLink,
    CListGroup,
    CListGroupItem,
    CRow,
    CTabContent,
    CTabPane,
    CTooltip
} from "@coreui/react";
import React, {useEffect, useRef, useState} from "react";
import {CChartLine} from "@coreui/react-chartjs";
import {useUserContext} from "../../context/UserContextProvider";
import {useProductContext} from "../../context/ProductContextProvider";
import {getProducts} from "../../utils/product-service";
import {Loader} from "../common/Loader";
import {Redirect, Switch} from "react-router-dom";
import {getColor, getStyle} from "@coreui/utils";
import CIcon from "@coreui/icons-react";
import AddProductModal from "./AddProductModal";
import SonarqubeDetails from "./details/SonarqubeDetails";
import JiraDetails from "./details/JiraDetails";
import JenkinsDetails from "./details/JenkinsDetails";

const brandInfo = getStyle('info') || '#20a8d8'

const ComponentStates = {
    Loading: "loading",
    Error: "error",
    Displaying: "displaying",
    Redirect: "redirect"
}

const getDatasets = (qualityLevels) => {
    return [
        {
            label: 'Quality Level',
            backgroundColor: getColor("transparent"),
            borderColor: brandInfo,
            pointHoverBackgroundColor: brandInfo,
            borderWidth: 2,
            data: qualityLevels
        }
    ]
}

const defaultOptions = {
    maintainAspectRatio: false,
    legend: {
        display: false
    },
    scales: {
        xAxes: [{
            gridLines: {
                drawOnChartArea: false
            }
        }],
        yAxes: [{
            ticks: {
                beginAtZero: true,
                maxTicksLimit: 5,
                stepSize: Math.ceil(25),
                max: 100
            },
            gridLines: {
                display: true
            }
        }]
    },
    elements: {
        point: {
            radius: 5,
            hitRadius: 10,
            hoverRadius: 4,
            hoverBorderWidth: 3
        },
        line: {
            tension: 0.00001
        }
    }
};

const TOOLTIP_QUALITY_LEVEL = "The quality level is calculated from quality characteristic ratings provided by Sonarqube.\n" +
    "This version of PQD calculates the quality from three characteristics: security, reliability, and maintainability.\n" +
    " Ratings of these characteristics are converted (A-100%, B-75%, ..., E-0%), added together, divided by 3*100, and then multiplied by 100.";

const TOOLTIP_RELEASE_TIME = "Release time indicates the time when PQD collected the release info. " +
    "This is meant to be done at the same time when you deploy your code. " +
    "Usually, when your release pipeline finishes.";

const TOOLTIP_RELEASE_DROPDOWN = "Select a release to inspect the details from the tools specified with this product. " +
    "After selecting a release, click on a tool below to display the details extracted from that product at the time of the release.";

export const Dashboard = (props) => {

    const {getUserInfo} = useUserContext();
    const {products, setProducts} = useProductContext();

    const [componentState, setComponentState] = useState(ComponentStates.Loading);
    const [selectedProduct, setSelectedProduct] = useState(undefined);
    const [qualityLevels, setQualityLevels] = useState([]);
    const [releaseIds, setReleaseIds] = useState([]);
    const [selectedRelease, setSelectedRelease] = useState(undefined);
    const dropdownButtonTitle = useRef();
    const [activeTab, setActiveTab] = useState(0);
    const [modal, setModal] = useState(false);

    const renderLoader = () => {
        return <CCardBody align="center">
            <Loader/>
        </CCardBody>;
    };

    useEffect(() => {
        if (!products) { // with direct link to the component
            const jwt = getUserInfo()?.jwt;
            if (jwt) {
                getProducts(jwt)
                    .then((products) => {
                        if (products.length > 0) {
                            const id = props.match.params.id;
                            const product = products.find(product => product.id.toString() === id);

                            if (product) {
                                setProducts(products);
                                setSelectedProduct(product);
                                setComponentState(ComponentStates.Displaying);
                            } else {
                                setComponentState(ComponentStates.Redirect);
                            }
                        } else {
                            setComponentState(ComponentStates.Redirect);
                        }
                    })
                    .catch(() => {
                        setComponentState(ComponentStates.Redirect);
                    })
            } else {

            }
        } else { // with navigating through ProductList compoenent
            const id = props.match.params.id;
            const product = products.find(product => product.id.toString() === id);
            if (product) {
                setSelectedProduct(product);
                setComponentState(ComponentStates.Displaying);
            } else {
                setComponentState(ComponentStates.Redirect);
            }
        }
    }, []);

    useEffect(() => {
        if (selectedProduct?.releaseInfo?.length > 0) {
            const qualityLevels = selectedProduct.releaseInfo.map(rel => rel.qualityLevel * 100);
            const releaseIds = selectedProduct.releaseInfo.map(rel => {
                const timestamp = rel.created;
                return getTimeFromTimestamp(timestamp);
            });
            setQualityLevels(qualityLevels);
            setReleaseIds(releaseIds);
        }
    }, [selectedProduct])

    const getTimeFromTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        const formatedMinutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
        const formatedHours = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
        return date.getDate() + ". " + date.toString().split(" ")[1] + " " + date.getFullYear() +
            ", " + formatedHours + ":" + formatedMinutes;
    }

    const onDropdownItemClick = (idx, rel) => {
        const selRel = selectedProduct.releaseInfo[idx]
        dropdownButtonTitle.current = rel;
        setSelectedRelease(selRel);
    }

    const renderDropdown = () => {
        return <CDropdown className="m-1 btn-group">
            <CDropdownToggle color="primary">
                {selectedRelease ? dropdownButtonTitle.current : "Select Release"}
            </CDropdownToggle>
            <a style={{fontSize: "large", padding: "7px"}}>
                <CTooltip
                    content={TOOLTIP_RELEASE_DROPDOWN}>
                    <CLink>(?)</CLink>
                </CTooltip>
            </a>
            <CDropdownMenu placement="right">
                <CDropdownItem header>Select Release{" "}
                    <CTooltip
                        content={TOOLTIP_RELEASE_TIME}>
                        <CLink>(?)</CLink>
                    </CTooltip></CDropdownItem>
                {releaseIds.map((rel, idx) => {
                    return (
                        <CDropdownItem onClick={() => onDropdownItemClick(idx, rel)}>{rel}</CDropdownItem>
                    )
                })}
            </CDropdownMenu>
        </CDropdown>
    }

    const renderDetailHeader = () => {
        return <CCardBody>
            <CRow>
                <CCol xs="6" sm="8" md="9" lg="10">
                    <div style={{fontSize: "medium"}}>
                        <CIcon name="cil-terminal"/> {selectedProduct.name}
                    </div>
                </CCol>
                <CCol>
                    <div className="text-right">
                        <CButton color="dark"
                                 variant="ghost"
                                 block
                                 onClick={() => setModal(!modal)}>
                            {" Product Settings "}
                            <CIcon name="cil-settings"/>
                        </CButton>
                    </div>
                </CCol>
            </CRow>
            <hr/>
            <CRow>
                <CCol xs={11}>
                    Here is a graph of quality levels of different releases through the time.
                    The quality levels are calculated by composing various quality characteristic ratings.
                    Each release is identified with a timestamp indicating the time when the new code was released.
                    Select a release from the dropdown below of the graph to see additional information collected from
                    various tools.
                </CCol>
            </CRow>
        </CCardBody>;
    }

    const renderDetailView = () => {
        const MAX_GRAPH_ELEMENTS = 20;
        if (qualityLevels.length > 0) {
            const datasets = getDatasets(qualityLevels);
            const getBadge = (qualityLevel) => {
                if (qualityLevel >= 0.75) {
                    return "success";
                } else if (qualityLevel >= 0.5) {
                    return 'warning';
                } else if (qualityLevel < 0.5) {
                    return "danger";
                } else {
                    return "info";
                }
            };

            const num = Number(selectedRelease?.qualityLevel)
            const roundedString = num.toFixed(4);
            const qualityLevel = Number(roundedString);

            return (<>
                    {renderDetailHeader()}
                    <CCardBody>
                        <p style={{paddingLeft: "5px"}}>Quality level (0-100%){" "}
                            <CTooltip
                                content={TOOLTIP_QUALITY_LEVEL}>
                                <CLink>(?)</CLink>
                            </CTooltip></p>
                        <CChartLine
                            style={{height: '300px', marginTop: '40px'}}
                            datasets={datasets.slice(0, MAX_GRAPH_ELEMENTS)}
                            labels={releaseIds.slice(0, MAX_GRAPH_ELEMENTS)}
                            options={defaultOptions}
                        />
                        <p style={{paddingTop: "5px"}} className="text-center">Release time{" "}
                            <CTooltip
                                content={TOOLTIP_RELEASE_TIME}>
                                <CLink>(?)</CLink>
                            </CTooltip></p>
                    </CCardBody>
                    <hr/>
                    <CCardBody>
                        <CRow>
                            <CCol xs={12} sm={8} lg={9}>
                                <div style={{fontSize: "medium"}}>
                                    <CIcon name="cib-skyliner"/> Release: {renderDropdown()}
                                </div>
                            </CCol>
                            {selectedRelease
                             ? <CCol xs={12} sm={4} lg={3}>
                                 <div style={{marginTop: "4px"}}>
                                     <a style={{fontSize: "large", padding: "7px"}}>
                                         <CTooltip
                                             content={TOOLTIP_QUALITY_LEVEL}>
                                             <CLink>(?)</CLink>
                                         </CTooltip>
                                     </a>
                                     <CBadge color={getBadge(qualityLevel)}>
                                         <div style={{fontSize: "medium", padding: "7px"}}>
                                             Quality Level: {qualityLevel * 100}%{" "}
                                         </div>
                                     </CBadge>
                                 </div>
                             </CCol>
                             : null}
                        </CRow>
                        <br/>
                        <br/>
                        {selectedRelease
                         ? <CRow>
                             <CCol xs="12" sm="4">
                                 <CListGroup id="list-tab" role="tablist">
                                     <CListGroupItem disabled>Inspect details from:</CListGroupItem>
                                     {(selectedRelease.releaseInfoSonarqube && selectedProduct.sonarqubeInfo)
                                     && <CListGroupItem onClick={() => setActiveTab(1)} action
                                                        active={activeTab === 1}>
                                         <CIcon name="cil-rss"/> Sonarqube
                                     </CListGroupItem>
                                     }
                                     {(selectedRelease.releaseInfoJira && selectedProduct.jiraInfo)
                                     && <CListGroupItem onClick={() => setActiveTab(2)} action
                                                        active={activeTab === 2}>
                                         <CIcon name="cib-jira"/> Jira
                                     </CListGroupItem>
                                     }
                                     {(selectedRelease.releaseInfoJenkins && selectedProduct.jenkinsInfo) &&
                                     <CListGroupItem
                                         onClick={() => setActiveTab(3)}
                                         action
                                         active={activeTab === 3}
                                     >
                                         <CIcon name="cil-user"/> Jenkins
                                     </CListGroupItem>}
                                 </CListGroup>
                             </CCol>
                                <CCol xs="12" sm="8">
                                    <CTabContent>
                                        <CTabPane active={activeTab === 1}>
                                            <SonarqubeDetails
                                                data={selectedRelease.releaseInfoSonarqube}
                                            />
                                        </CTabPane>

                                        <CTabPane active={activeTab === 2}>
                                            <JiraDetails data={selectedRelease.releaseInfoJira}/>
                                        </CTabPane>

                                        <CTabPane active={activeTab === 3}>
                                            <JenkinsDetails data={selectedRelease.releaseInfoJenkins.jenkinsJobs}/>
                                        </CTabPane>
                                    </CTabContent>
                                </CCol>
                         </CRow>
                         : null}
                    </CCardBody>
                </>
            );
        }

        return (
            <CCardBody>
                {renderDetailHeader()}
                <CAlert color="info">
                    No release info to display. Trigger release info collection on this product to see initial
                    results
                </CAlert>
            </CCardBody>
        );
    }

    const renderRedirect = () => {
        return (
            <Switch>
                <Redirect to="/products/all"/>
            </Switch>
        )
    }

    const renderBody = () => {
        switch (componentState) {
            case ComponentStates.Loading:
                return renderLoader();
            case ComponentStates.Displaying:
                return renderDetailView();
            case ComponentStates.Redirect: // fall-through
            default:
                return renderRedirect();
        }
    }

    return (
        <CCard>
            {renderBody()}
            <AddProductModal setState={setModal} state={modal} type="modify" product={selectedProduct}/>
        </CCard>
    );
}

export default Dashboard
