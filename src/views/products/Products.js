import {CBadge, CCard, CCardBody, CCardHeader, CDataTable} from "@coreui/react";
import React, {useEffect} from 'react'
import usersData from "./UsersData";
import {httpGet} from "../../utils/http-request";
import config from "../../config/config.json";
import {useUserContext} from "../../context/UserContextProvider";
import {useHistory} from "react-router-dom";
import {useProductContext} from "../../context/ProductContextProvider";

const fields = ['name', 'registered', 'role', 'status']

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

const Products = () => {

    const {user} = useUserContext();
    const {products, setProducts} = useProductContext();
    const history = useHistory();

    useEffect(() => {
        getProducts();
    }, []);

    const getProducts = () => {
        // TODO setLoading(true)
        httpGet(`${config.pqdApiBaseUrl}/product/get/all`, user?.jwt)
            .then(res => {
                if (res.status === 200) {
                    return {status: "OK", body: res.json()};
                } else {
                    return {status: "Error", body: res.json()};
                }
            })
            .then(data => {
                if (data.status === "OK") {
                    return data.body;
                } else {
                    // TODO setLoadingFailed(true)
                }
            })
            .then(products => {
                // TODO setLoading(false)
                setProducts(products);
            })
    }

    // TODO loader and display products
    return (
        <>
            <CCard>
                <CCardHeader>
                    Products
                </CCardHeader>
                <CCardBody>
                    <CDataTable
                        items={usersData}
                        fields={fields}
                        bordered
                        itemsPerPage={5}
                        pagination
                        scopedSlots={{
                            'status':
                                (item) => (
                                    <td>
                                        <CBadge color={getBadge(item.status)}>
                                            {item.status}
                                        </CBadge>
                                    </td>
                                )
                        }}
                    />
                </CCardBody>
            </CCard>
        </>
    )
}

export default Products
