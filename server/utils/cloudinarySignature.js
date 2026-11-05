import { createHash } from "node:crypto";

export function createCloudinarySignature(parameters, apiSecret) {
    const parameterString = Object.entries(parameters)
        .sort(([firstName], [secondName]) => firstName.localeCompare(secondName))
        .map(([name, value]) => `${name}=${value}`)
        .join("&");

    return createHash("sha1")
        .update(`${parameterString}${apiSecret}`)
        .digest("hex");
}
