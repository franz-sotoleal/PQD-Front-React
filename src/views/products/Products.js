import {CAlert, CCard, CCardBody, CCardHeader, CDataTable} from "@coreui/react";
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

    const {user} = useUserContext();
    const {products, setProducts} = useProductContext();
    const [componentState, setComponentState] = useState(ComponentStates.Loading);

    const history = useHistory();

    useEffect(() => {
        const jwt = user?.jwt
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
                        //console.log(item);

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
            You have no products. Please add a product // Todo add product button
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
                        Products
                    </CCardHeader>
                    <CCardBody>
                        {renderBody()}
                    </CCardBody>
                </CCard>
            </>
        )
    }

    return renderProducts();

}

export default Products
