import { ACCESS_TOKEN, BASE_URL, INSTAGRAM_ACCOUNT_ID } from "./auth.js";
const MAX_PAGES = 10;
const CONTAINER_POLL_INTERVAL = 2000;
const CONTAINER_POLL_MAX_ATTEMPTS = 60;
export class InstagramApiError extends Error {
    status;
    constructor(status, message) {
        super(message);
        this.status = status;
        this.name = "InstagramApiError";
    }
}
export async function apiRequest(endpoint, method = "GET", body, queryParams) {
    const params = new URLSearchParams();
    params.set("access_token", ACCESS_TOKEN);
    if (queryParams) {
        for (const [key, value] of Object.entries(queryParams)) {
            if (value !== undefined && value !== "") {
                params.set(key, value);
            }
        }
    }
    const url = `${BASE_URL}${endpoint}?${params.toString()}`;
    const fetchBody = method !== "GET" && body
        ? JSON.stringify(body)
        : undefined;
    const response = await fetch(url, {
        method,
        headers: fetchBody ? { "Content-Type": "application/json" } : undefined,
        body: fetchBody,
    });
    if (!response.ok) {
        const respBody = (await response.json().catch(() => ({})));
        const msg = respBody.error?.message || response.statusText;
        if (response.status === 429 || respBody.error?.code === 32) {
            throw new InstagramApiError(429, "Rate limit exceeded. Try again in a moment.");
        }
        if (respBody.error?.code === 190) {
            const sub = respBody.error.error_subcode;
            const hint = sub === 463 || sub === 467
                ? " Token has expired — generate a new System User token in Business Manager."
                : " Check your META_ACCESS_TOKEN or generate a new one in Business Manager → System Users.";
            throw new InstagramApiError(401, `Authentication failed: ${msg}.${hint}`);
        }
        throw new InstagramApiError(response.status, `Instagram API error (${response.status}): ${msg}`);
    }
    return (await response.json());
}
export async function apiRequestAllPages(endpoint, queryParams) {
    const all = [];
    let after;
    for (let page = 0; page < MAX_PAGES; page++) {
        const params = {
            ...queryParams,
            after,
        };
        const result = await apiRequest(endpoint, "GET", undefined, params);
        if (result.data) {
            all.push(...result.data);
        }
        if (!result.paging?.next)
            break;
        after = result.paging.cursors?.after;
        if (!after)
            break;
    }
    return all;
}
export async function createMediaContainer(params) {
    return apiRequest(`/${INSTAGRAM_ACCOUNT_ID}/media`, "POST", undefined, params);
}
export async function waitForContainerReady(containerId) {
    for (let i = 0; i < CONTAINER_POLL_MAX_ATTEMPTS; i++) {
        const status = await apiRequest(`/${containerId}`, "GET", undefined, { fields: "status_code,status" });
        if (status.status_code === "FINISHED")
            return;
        if (status.status_code === "ERROR" || status.status_code === "EXPIRED") {
            throw new InstagramApiError(400, `Container ${containerId} failed: ${status.status_code} — ${status.status || "unknown error"}`);
        }
        await new Promise((r) => setTimeout(r, CONTAINER_POLL_INTERVAL));
    }
    throw new InstagramApiError(408, `Container ${containerId} timed out after ${CONTAINER_POLL_MAX_ATTEMPTS * CONTAINER_POLL_INTERVAL / 1000}s`);
}
export async function publishContainer(creationId) {
    return apiRequest(`/${INSTAGRAM_ACCOUNT_ID}/media_publish`, "POST", undefined, { creation_id: creationId });
}
export function toolResult(data) {
    return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
}
export function toolError(message) {
    return {
        isError: true,
        content: [{ type: "text", text: message }],
    };
}
