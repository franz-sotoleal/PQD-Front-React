import {CAlert, CCard, CCardBody, CCardHeader, CDataTable, CButton,  CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle} from "@coreui/react";
import CIcon from "@coreui/icons-react"
import React, {useEffect, useState} from 'react'
import {useUserContext} from "../../context/UserContextProvider";
import {useHistory} from "react-router-dom";
import {useProductContext} from "../../context/ProductContextProvider";
import {getProducts} from "../../utils/product-service";
import {Loader} from "../common/Loader";

const fields = ['id', 'name', 'currentQuality']

const getBadge = status => {
    switch (status) {
        case 'Active':
            return 'success'
        case 'Inactive':
            return 'secondary'
        case 'Pending':
            return 'warning'
        case 'Banned':
            return 'danger'
        default:
            return 'primary'
    }
}

const ComponentStates = {
    Loading: "loading",
    Error: "error",
    Displaying: "displaying",
    NoProducts: "no_products"
}

const Products = () => {

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
            itemsPerPage={5}
            pagination
            scopedSlots={{
                'currentQuality':
                    (item) => {
                    return (
                            <td>
                                {item.releaseInfo?.[0].qualityLevel * 100 + "%"}
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

    const renderProducts = () => {
        return (
            <>
                <CCard>
                    <CCardHeader>
                        <CButton color="link" disabled >
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

                <CModal
                    show={info}
                    onClose={() => setInfo(!info)}
                    color="info"
                >
                    <CModalHeader closeButton>
                        <CModalTitle>Modal title</CModalTitle>
                    </CModalHeader>
                    <CModalBody>
                        Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore
                        et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
                        aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
                        cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
                        culpa qui officia deserunt mollit anim id est laborum.
                    </CModalBody>
                    <CModalFooter>
                        <CButton color="secondary" onClick={() => setInfo(!info)}>Cancel</CButton>
                        <CButton color="info" onClick={() => setInfo(!info)}>Do Something</CButton>{' '}
                    </CModalFooter>
                </CModal>
            </>
        )
    }

    return renderProducts();

}

export default Products
