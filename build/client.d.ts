export declare class InstagramApiError extends Error {
    status: number;
    constructor(status: number, message: string);
}
export declare function apiRequest<T>(endpoint: string, method?: "GET" | "POST" | "DELETE", body?: Record<string, unknown>, queryParams?: Record<string, string | undefined>): Promise<T>;
export declare function apiRequestAllPages<T>(endpoint: string, queryParams?: Record<string, string | undefined>): Promise<T[]>;
export declare function createMediaContainer(params: Record<string, string | undefined>): Promise<{
    id: string;
}>;
export declare function waitForContainerReady(containerId: string): Promise<void>;
export declare function publishContainer(creationId: string): Promise<{
    id: string;
}>;
export declare function toolResult(data: unknown): {
    content: {
        type: "text";
        text: string;
    }[];
};
export declare function toolError(message: string): {
    isError: true;
    content: {
        type: "text";
        text: string;
    }[];
};
