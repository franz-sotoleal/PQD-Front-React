import {CAlert, CBadge, CButton, CCard, CCardBody, CCardHeader, CDataTable} from "@coreui/react";
import {CChartLine} from "@coreui/react-chartjs";
import CIcon from "@coreui/icons-react";
import AddProductModal from "./AddProductModal";
import {useHistory} from "react-router-dom";
import React, {useEffect, useState} from "react";
import {useUserContext} from "../../context/UserContextProvider";
import {useProductContext} from "../../context/ProductContextProvider";
import {getProducts} from "../../utils/product-service";
import {Loader} from "../common/Loader";
import {getColor} from "@coreui/utils";

const ComponentStates = {
    Loading: "loading",
    Error: "error",
    Displaying: "displaying",
    NoProducts: "no_products"
}

const fields = ['name', 'currentQuality', 'history']

export const ProductList = () => {
    const {getUserInfo} = useUserContext();
    const {products, setProducts} = useProductContext();
    const [componentState, setComponentState] = useState(ComponentStates.Loading);
    const [info, setInfo] = useState(false);

    const history = useHistory();

    useEffect(() => {
        const jwt = getUserInfo()?.jwt;
        setComponentState(ComponentStates.Loading)
        if (jwt && !products) {
            getProducts(jwt)
                .then((products) => {
                    if (products.length > 0) {
                        setProducts(products);
                        setComponentState(ComponentStates.Displaying);
                    } else {
                        setComponentState(ComponentStates.NoProducts);
                    }
                })
                .catch(() => {
                    setComponentState(ComponentStates.Error)
                })
        } else if (products) {
            setComponentState(ComponentStates.Displaying);
        } else {
            setComponentState(ComponentStates.Error);
        }
    }, []);

    const onRowClick = (row) => {
        history.push(`/products/${row.id}`)
    };

    const renderLoader = () => {
        return <CCardBody align="center">
            <Loader/>
        </CCardBody>;
    };

    const renderTable = () => {
        return <CDataTable
            items={products}
            fields={fields}
            bordered
            hover
            itemsPerPage={10}
            pagination
            onRowClick={(row) => onRowClick(row)}
            scopedSlots={{
                'name':
                    (item) => {
                        return (
                            <td>
                                <CIcon name="cil-terminal"/> <b>{item.name}</b>
                            </td>
                        )
                    },
                'currentQuality':
                    (item) => {
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

                        const lastLevel = item.releaseInfo?.[item.releaseInfo.length - 1]?.qualityLevel;
                        const num = Number(lastLevel)
                        const roundedString = num.toFixed(4);
                        const qualityLevel = Number(roundedString);

                        return (
                            <td>
                                <CBadge color={getBadge(qualityLevel)}>
                                    {qualityLevel
                                     ? qualityLevel * 100 + "%"
                                     : "Not Available"}
                                </CBadge>
                            </td>
                        )
                    },
                'history':
                    (item) => {
                        const MAX_GRAPH_ELEMENTS = 20;
                        const getDatasets = (qualityLevels) => {
                            return [
                                {
                                    data: qualityLevels,
                                    borderColor: getColor("info"),
                                    backgroundColor: getColor("transparent"),
                                    pointBackgroundColor: getColor("transparent"),
                                    pointHoverBackgroundColor: getColor("transparent")
                                }
                            ]
                        }
                        const qualityLevels = item.releaseInfo.map(rel => rel.qualityLevel * 100);
                        const defaultOptions = {
                            maintainAspectRatio: false,
                            legend: {
                                display: false
                            },
                            scales: {
                                xAxes: [{
                                    display: false
                                }],
                                yAxes: [{
                                    display: false
                                }]
                            },
                            elements: {
                                line: {
                                    tension: 0.00001
                                }
                            }
                        };

                        const datasets = getDatasets(qualityLevels);
                        if (datasets?.[0]?.data?.length > 0) {
                            return (
                                <td width={6}>
                                    <CChartLine
                                        style={{height: '60px', marginTop: '5px', marginBottom: '5px'}}
                                        datasets={datasets.slice(0, MAX_GRAPH_ELEMENTS)}
                                        options={defaultOptions}
                                    />
                                </td>
                            );
                        }
                        return (
                            <td width={6}>
                                <CAlert color="info">
                                    No Preview Available
                                </CAlert>
                            </td>
                        )
                    }
            }}
        />;
    };

    const renderError = () => {
        return <CAlert color="danger">
            Loading products failed
        </CAlert>
    }

    const renderNoProductsNotice = () => {
        return <CAlert color="primary">
            You have no products. Please add a product
        </CAlert>
    }

    const renderBody = () => {
        switch (componentState) {
            case ComponentStates.Loading:
                return renderLoader();
            case ComponentStates.Error:
                return renderError();
            case ComponentStates.Displaying:
                return renderTable();
            case ComponentStates.NoProducts: // fall-through
            default:
                return renderNoProductsNotice();
        }
    }

    return (
        <>
            <CCard>
                <CCardHeader>
                    <CButton color="link" disabled>
                        Products <CIcon name="cil-library"/>
                    </CButton>
                    <div className="card-header-actions">
                        <CButton block color="primary" variant="ghost" onClick={() => setInfo(!info)}>
                            <CIcon name="cil-library-add"/> Add product
                        </CButton>
                    </div>

                </CCardHeader>
                <CCardBody>
                    {renderBody()}
                </CCardBody>
            </CCard>

            <AddProductModal setState={setInfo} state={info}/>
        </>
    )
}

export default ProductList
