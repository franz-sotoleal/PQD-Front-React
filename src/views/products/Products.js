import {CCard, CCardBody, CCardHeader, CDataTable} from "@coreui/react";
import React, {useEffect, useState} from 'react'
import {httpGet} from "../../utils/http-request";
import config from "../../config/config.json";
import {useUserContext} from "../../context/UserContextProvider";
import {useHistory} from "react-router-dom";
import {useProductContext} from "../../context/ProductContextProvider";

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

const Products = () => {

    const {user} = useUserContext();
    const {products, setProducts} = useProductContext();
    const [loading, setLoading] = useState(true);
    const [loadingFailed, setLoadingFailed] = useState(true);
    const [productDisplayData, setProductDisplayData] = useState(undefined);

    const history = useHistory();

    useEffect(() => {

        getProducts()
            .then(products => {
                const productWithReleaseInfoList = [];
                products.map(async (product, idx) => {
                    const productWithReleaseInfo = product;
                    await getReleaseInfo(product.id)
                        .then(releaseInfo => {
                            productWithReleaseInfo.id = idx;
                            productWithReleaseInfo.releaseInfo = releaseInfo;
                            productWithReleaseInfoList.push(productWithReleaseInfo);
                        })
                    setProductDisplayData(productWithReleaseInfoList); // TODO oota ära kuni kõik on välja küsitud
                    setLoading(false);
                })
                return productWithReleaseInfoList;
            })
    }, []);

    const getProducts = () => {
        setLoading(true)
        setLoadingFailed(false);
        return httpGet(`${config.pqdApiBaseUrl}/product/get/all`, user?.jwt)
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
                    setLoadingFailed(true);
                }
            })
    }

    const getReleaseInfo = async (productId) => {
        return httpGet(`${config.pqdApiBaseUrl}/product/${productId}/releaseInfo`, user?.jwt)
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
                    setLoadingFailed(true);
                }
            })
    }

    const renderLoader = () => {
        return <CCardBody align="center">
            <div className="spinner-border text-primary" role="status">
                <span className="sr-only">Loading...</span>
            </div>
        </CCardBody>
    };

    const renderTable = () => {
        console.log(productDisplayData);
        return <CDataTable
            items={productDisplayData}
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

    const renderProducts = () => {
        return (
            <>
                <CCard>
                    <CCardHeader>
                        Products
                    </CCardHeader>
                    <CCardBody>
                        {loading ? renderLoader() : renderTable()}
                    </CCardBody>
                </CCard>
            </>
        )
    }

    return renderProducts();

}

export default Products
