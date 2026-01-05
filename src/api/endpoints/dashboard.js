import { apis, Tags } from "../base";

const dashboardApi = apis.injectEndpoints({
    endpoints: (builder) => ({
        dashboardData: builder.query({
            query: () => ({
                url: "/admin/dashboard",
                method: "GET",
            }),
            providesTags: [Tags.PERFUME, Tags.USER],
        }),
    }),
});

export const { useDashboardDataQuery } = dashboardApi;
