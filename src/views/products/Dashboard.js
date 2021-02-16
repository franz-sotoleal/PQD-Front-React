import {CAlert, CCard, CCardBody} from "@coreui/react";
import React, {useEffect, useState} from "react";
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

    const renderDetailView = () => {
        const MAX_GRAPH_ELEMENTS = 15;
        if (selectedProduct?.releaseInfo?.length > 0) {
            const qualityLevels = selectedProduct.releaseInfo.map(rel => rel.qualityLevel * 100);
            const releaseIds = selectedProduct.releaseInfo.map(rel => {
                const timestamp = rel.created;
                const date = new Date(timestamp);
                return date.getDate() + ". " + date.toString().split(" ")[1] + " " + date.getFullYear() +
                    ", " + date.getHours() + ":" + date.getMinutes();
            });

            const datasets = getDatasets(qualityLevels);

            return (
                <CCardBody>
                    <CChartLine
                        style={{height: '300px', marginTop: '40px'}}
                        datasets={datasets.slice(0, MAX_GRAPH_ELEMENTS)}
                        labels={releaseIds.slice(0, MAX_GRAPH_ELEMENTS)}
                        options={defaultOptions}
                    />
                </CCardBody>
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
