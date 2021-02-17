import {
    CAlert, CBadge, CCard, CCardBody, CCol, CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle, CRow
} from "@coreui/react";
import React, {useEffect, useRef, useState} from "react";
import {CChartLine} from "@coreui/react-chartjs";
import {useUserContext} from "../../context/UserContextProvider";
import {useProductContext} from "../../context/ProductContextProvider";
import {getProducts} from "../../utils/product-service";
import {Loader} from "../common/Loader";
import {Redirect, Switch} from "react-router-dom";
import {getStyle, hexToRgba} from "@coreui/utils";

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
            backgroundColor: hexToRgba(brandInfo, 10),
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
        }
    }
};

export const Dashboard = (props) => {

    const {getUserInfo} = useUserContext();
    const {products, setProducts} = useProductContext();

    const [componentState, setComponentState] = useState(ComponentStates.Loading);
    const [selectedProduct, setSelectedProduct] = useState(undefined);
    const [qualityLevels, setQualityLevels] = useState([]);
    const [releaseIds, setReleaseIds] = useState([]);
    const [selectedRelease, setSelectedRelease] = useState(undefined);
    const dropdownButtonTitle = useRef();

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
                const date = new Date(timestamp);
                return date.getDate() + ". " + date.toString().split(" ")[1] + " " + date.getFullYear() +
                    ", " + date.getHours() + ":" + date.getMinutes();
            });
            setQualityLevels(qualityLevels);
            setReleaseIds(releaseIds);
        }
    }, [selectedProduct])

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
            <CDropdownMenu placement="right">
                <CDropdownItem header>Select Release </CDropdownItem>
                {releaseIds.map((rel, idx) => {
                    return (
                        <CDropdownItem onClick={() => onDropdownItemClick(idx, rel)}>{rel}</CDropdownItem>
                    )
                })}
            </CDropdownMenu>
        </CDropdown>
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
            }
            const qualityLevel = selectedRelease?.qualityLevel;
            return (<>
                    <CCardBody>
                        <CChartLine
                            style={{height: '300px', marginTop: '40px'}}
                            datasets={datasets.slice(0, MAX_GRAPH_ELEMENTS)}
                            labels={releaseIds.slice(0, MAX_GRAPH_ELEMENTS)}
                            options={defaultOptions}
                        />
                    </CCardBody>
                    <hr/>
                    <CCardBody>
                        <CRow>
                            <CCol xs={12} sm={8} lg={9}>
                                {renderDropdown()}
                            </CCol>
                            {selectedRelease
                             ? <CCol xs={12} sm={4} lg={3}>
                                 <div style={{marginTop: "4px"}}>
                                     <CBadge color={getBadge(qualityLevel)}>
                                         <div style={{fontSize: "medium", padding: "7px"}}>
                                             Quality Level: {qualityLevel * 100}%
                                         </div>
                                     </CBadge>
                                 </div>
                             </CCol>
                             : null}
                        </CRow>
                    </CCardBody>
                </>
            );
        }

        return (
            <CCardBody>
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
        </CCard>
    );
}

export default Dashboard
