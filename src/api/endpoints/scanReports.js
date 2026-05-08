import { apis, Tags } from "../base";

const scanReportsApi = apis.injectEndpoints({
    endpoints: (builder) => ({
        getScanReports: builder.query({
            query: ({ page = 1, limit = 10, search = "", sort = "createdAt_desc", isRead = "", userId = "" }) => {
                const params = new URLSearchParams();
                if (page) params.append("page", page.toString());
                if (limit) params.append("limit", limit.toString());
                if (search) params.append("search", search);
                if (sort) params.append("sort", sort);
                if (isRead !== "") params.append("isRead", isRead.toString());
                if (userId) params.append("userId", userId);
                
                return `/admin/scan-reported-perfumes?${params.toString()}`;
            },
            providesTags: [Tags.SCAN_REPORT],
        }),
        markScanReportRead: builder.mutation({
            query: (id) => ({
                url: `/admin/scan-reported-perfumes/${id}/mark-read`,
                method: "PATCH",
            }),
            invalidatesTags: [Tags.SCAN_REPORT],
        }),
        deleteScanReport: builder.mutation({
            query: (id) => ({
                url: `/admin/scan-reported-perfumes/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: [Tags.SCAN_REPORT],
        }),
    }),
});

export const {
    useGetScanReportsQuery,
    useMarkScanReportReadMutation,
    useDeleteScanReportMutation,
} = scanReportsApi;
