import { apis, Tags } from "../base";

const entriesApi = apis.injectEndpoints({
    endpoints: (builder) => ({
        getEntries: builder.query({
            query: ({ page = 1, limit = 10, search = "", sort, perfumeId, userId }) => {
                const params = new URLSearchParams();
                params.append("page", page.toString());
                params.append("limit", limit.toString());
                if (search) params.append("search", search);
                if (sort) params.append("sort", sort);
                if (perfumeId) params.append("perfumeId", perfumeId);
                if (userId) params.append("userId", userId);
                return `/admin/entries?${params.toString()}`;
            },
            providesTags: [Tags.ENTRY],
        }),
        deleteEntry: builder.mutation({
            query: (id) => ({
                url: `/admin/entry/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: [Tags.ENTRY],
        }),
    }),
});

export const {
    useGetEntriesQuery,
    useDeleteEntryMutation,
} = entriesApi;
