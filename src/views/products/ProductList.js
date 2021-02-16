import {CAlert, CButton, CCard, CCardBody, CCardHeader, CDataTable} from "@coreui/react";
import {CChartLine} from "@coreui/react-chartjs";
import CIcon from "@coreui/icons-react";
import AddProductModal from "./AddProductModal";
import {useHistory} from "react-router-dom";
import React, {useEffect, useState} from "react";
import {useUserContext} from "../../context/UserContextProvider";
import {useProductContext} from "../../context/ProductContextProvider";
import {getProducts} from "../../utils/product-service";
import {Loader} from "../common/Loader";
import {getColor, getStyle} from "@coreui/utils";

const brandInfo = getStyle('info') || '#20a8d8'

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
        if (jwt) {
            setComponentState(ComponentStates.Loading)
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
        } else {
            setComponentState(ComponentStates.Error)
        }
    }, []);

    const onRowClick = (row) => {
        console.log(row);
        history.push(`/products/${row.id}`)
    };

    const renderLoader = () => {
        return <CCardBody align="center">
            <Loader/>
        </CCardBody>;
    };

    const renderTable = () => {
        console.log(products);
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
                            <b>{item.name}</b>
                        </td>
                    )
                },
                'currentQuality':
                    (item) => {
                        return (
                            <td >
                                {item.releaseInfo?.[0]?.qualityLevel * 100 + "%"}
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
                                    borderColor: getColor("primary"),
                                    backgroundColor: getColor("transparent"),
                                    pointBackgroundColor: getColor("transparent"),
                                    pointHoverBackgroundColor: getColor("transparent")
                                }
                            ]
                        }
                        const qualityLevels = item.releaseInfo.map(rel => rel.qualityLevel * 100);
                        const releaseIds = item.releaseInfo.map(rel => {
                            const timestamp = rel.created;
                            const date = new Date(timestamp);
                            return date.getDate() + ". " + date.toString().split(" ")[1] + " " + date.getFullYear() +
                                ", " + date.getHours() + ":" + date.getMinutes();
                        });
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
                            }
                        };

                        const datasets = getDatasets(qualityLevels);
                        return (
                            <td width="6">
                                <CChartLine
                                    style={{height: '60px', marginTop: '5px', marginBottom: '5px'}}
                                    datasets={datasets.slice(0, MAX_GRAPH_ELEMENTS)}
                                    options={defaultOptions}
                                />
                            </td>
                        )
                    }
            }}
        />
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
