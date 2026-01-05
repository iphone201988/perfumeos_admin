import { apis, Tags } from "../base";

const authApi = apis.injectEndpoints({
    endpoints: (builder) => ({
        adminLogin: builder.mutation({
            query: (userData) => ({
                url: "/admin/login",
                method: "POST",
                body: userData,
            }),
        }),
        adminDetails: builder.query({
            query: () => ({
                url: "/admin/me",
                method: "GET",
            }),
            providesTags: [Tags.ADMIN],
        }),
    }),
});

export const { useAdminLoginMutation, useAdminDetailsQuery } = authApi;
