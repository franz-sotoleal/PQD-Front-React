export async function httpGet(url, jwt, params) {
    return httpRequest("GET", url, null, jwt, params);
}

export async function httpPost(url, body, jwt, params) {
    return httpRequest("POST", url, body, jwt, params);
}

export async function httpPut(url, body, jwt, params) {
    return httpRequest("PUT", url, body, jwt, params);
}

const serialize = (obj) => {
    const str = [];
    for (const p in obj) {
        if (obj.hasOwnProperty(p)) {
            // @ts-ignore
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        }
    }
    return str.join("&");
};

export async function httpRequest(
    method,
    url,
    body,
    jwt,
    {
        headers = {},
        requestParams,
        ...params} = {}) {
    let headersJson = {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        ...headers,
    }

    if (jwt) {
        headersJson["Authorization"] = "Bearer " + jwt;
    }

    if (requestParams) {
        const urlParams = serialize(requestParams);
        url += "?" + urlParams;
    }
    return fetch(url, {
        method,
        headers: headersJson,
        body: body ? JSON.stringify(body) : undefined,
        ...params,
    }).then(res => res);
}

