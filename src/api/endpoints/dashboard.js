import { apis, Tags } from "../base";

const dashboardApi = apis.injectEndpoints({
    endpoints: (builder) => ({
        dashboardData: builder.query({
            query: (params) => ({
                url: "/admin/dashboard",
                method: "GET",
                params: params,
            }),
            providesTags: [Tags.PERFUME, Tags.USER],
        }),
    }),
});

export const { useDashboardDataQuery } = dashboardApi;
