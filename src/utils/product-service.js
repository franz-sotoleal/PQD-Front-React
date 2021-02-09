import {httpGet} from "./http-request";
import config from "../config/config.json";

export const getProducts = (jwt) => {
    return fetchProducts(jwt)
        .then(products => {
            const productWithReleaseInfoList = [];
            return Promise.all(products.map(async (product, idx) => {
                const productWithReleaseInfo = product;
                await fetchReleaseInfo(product.id, jwt)
                    .then(releaseInfo => {
                        productWithReleaseInfo.id = idx;
                        productWithReleaseInfo.releaseInfo = releaseInfo;
                        productWithReleaseInfoList.push(productWithReleaseInfo);
                    })
                    .catch(err => {
                        console.error(err);
                    })
            })).then(() => {
                return productWithReleaseInfoList;
            })
        })
}

const fetchProducts = (jwt) => {
    return httpGet(`${config.pqdApiBaseUrl}/product/get/all`, jwt)
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
                throw new Error("Fetching products failed");
            }
        })
}

const fetchReleaseInfo = async (productId, jwt) => {
    return httpGet(`${config.pqdApiBaseUrl}/product/${productId}/releaseInfo`, jwt)
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
                throw new Error(`Fetching release info for product with id ${productId} failed`)
            }
        })
}
