import {httpGet, httpPost, httpRequestWithBasicAuth} from "./http-request";
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

export const saveProduct = (jwt, body) => {
    return httpPost(`${config.pqdApiBaseUrl}/product/save`, body, jwt)
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
                throw new Error("Saving product failed");
            }
        });
}

export const triggerReleaseInfoCollection = (url, token) => {
    return httpRequestWithBasicAuth("POST", url, {}, token)
        .then(res => {
            if (res.status === 200) {
                return {status: "OK"};
            } else {
                return {status: "Error"};
            }
        });
}

export const testSonarqubeApiConnection = (jwt, body) => {
    return testConnection("sonarqube", body, jwt);
}

export const testJiraApiConnection = (jwt, body) => {
    return testConnection("jira", body, jwt);
}

const testConnection = (toolName, body, jwt) => {
    return httpPost(`${config.pqdApiBaseUrl}/product/test/${toolName}/connection`, body, jwt)
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
                throw new Error("Testing product connection failed somewhere inside the PQD system");
            }
        });
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
