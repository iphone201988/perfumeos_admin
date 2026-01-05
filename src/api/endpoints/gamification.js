import { apis, Tags } from "../base";

const gamificationApi = apis.injectEndpoints({
    endpoints: (builder) => ({
        getBadges: builder.query({
            query: ({ page, limit, search, sort }) => {
                const params = new URLSearchParams();
                if (page) params.append("page", page.toString());
                if (limit) params.append("limit", limit.toString());
                if (search) params.append("search", search);
                if (sort) params.append("sort", sort);
                return `/admin/badges?${params.toString()}`;
            },
            providesTags: [Tags.BADGE],
        }),
        createBadge: builder.mutation({
            query: (formData) => ({
                url: "/admin/addBadge",
                method: "POST",
                body: formData,
            }),
            invalidatesTags: [Tags.BADGE],
        }),
        updateBadge: builder.mutation({
            query: ({ id, formData }) => ({
                url: `/admin/badge/${id}`,
                method: "PUT",
                body: formData,
            }),
        }),
        deleteBadge: builder.mutation({
            query: ({ id, data }) => ({
                url: `/admin/badge/${id}`,
                method: "DELETE",
                body: data,
            }),
        }),
        getRanks: builder.query({
            query: ({ page, limit, search, sort }) => {
                const params = new URLSearchParams();
                if (page) params.append("page", page.toString());
                if (limit) params.append("limit", limit.toString());
                if (search) params.append("search", search);
                if (sort) params.append("sort", sort);
                return `/admin/ranks?${params.toString()}`;
            },
            providesTags: [Tags.RANKS],
        }),
        createRank: builder.mutation({
            query: (formData) => ({
                url: "/admin/addRank",
                method: "POST",
                body: formData,
            }),
            invalidatesTags: [Tags.RANKS],
        }),
        updateRank: builder.mutation({
            query: ({ id, data }) => ({
                url: `/admin/rank/${id}`,
                method: "PUT",
                body: data,
            }),
        }),
        deleteRank: builder.mutation({
            query: ({ id, data }) => ({
                url: `/admin/rank/${id}`,
                method: "DELETE",
                body: data,
            }),
        }),
    }),
});

export const {
    useGetBadgesQuery,
    useCreateBadgeMutation,
    useUpdateBadgeMutation,
    useDeleteBadgeMutation,
    useGetRanksQuery,
    useCreateRankMutation,
    useUpdateRankMutation,
    useDeleteRankMutation,
} = gamificationApi;
