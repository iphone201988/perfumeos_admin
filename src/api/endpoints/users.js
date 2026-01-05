import { apis, Tags } from "../base";

const usersApi = apis.injectEndpoints({
    endpoints: (builder) => ({
        usersDetails: builder.query({
            query: ({ page, limit, search, sort }) => {
                const params = new URLSearchParams();
                if (page) params.append("page", page.toString());
                if (limit) params.append("limit", limit.toString());
                if (search) params.append("search", search);
                if (sort) params.append("sort", sort);
                return `/admin/users?${params.toString()}`;
            },
            providesTags: [Tags.USER],
        }),
        getUserDetails: builder.query({
            query: (id) => ({
                url: `/admin/user/${id}`,
                method: "GET",
            }),
            providesTags: (result, error, id) => [{ type: Tags.USER, id }],
        }),
        suspendUser: builder.mutation({
            query: (id) => ({
                url: `/admin/user/${id}/suspend`,
                method: "PUT",
            }),
            invalidatesTags: [Tags.USER],
        }),
        updateUser: builder.mutation({
            query: ({ id, formData }) => ({
                url: `/admin/user/${id}`,
                method: "PUT",
                body: formData,
            }),
            invalidatesTags: [Tags.USER],
        }),
    }),
});

export const {
    useUsersDetailsQuery,
    useGetUserDetailsQuery,
    useSuspendUserMutation,
    useUpdateUserMutation,
} = usersApi;
