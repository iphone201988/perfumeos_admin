import { apis, Tags } from "../base";

const commonApi = apis.injectEndpoints({
    endpoints: (builder) => ({
        getFAQs: builder.query({
            query: ({ type, page = 1, limit = 10, search }) => {
                let url = `/admin/faq?page=${page}&limit=${limit}`;
                if (type) url += `&type=${type}`;
                if (search) url += `&search=${search}`;
                return url;
            },
            providesTags: [Tags.FAQ],
            serializeQueryArgs: ({ endpointName, queryArgs }) => {
                return `${endpointName}-${queryArgs.type}`;
            },
            merge: (currentCache, newItems, { arg }) => {
                if (arg.page === 1) {
                    return newItems;
                }
                return {
                    ...newItems,
                    data: [...(currentCache.data || []), ...(newItems.data || [])],
                    typeCounts: newItems.typeCounts,
                };
            },
            forceRefetch({ currentArg, previousArg }) {
                return currentArg?.page !== previousArg?.page;
            },
        }),

        createFAQ: builder.mutation({
            query: (data) => ({
                url: "/admin/faq",
                method: "POST",
                body: data,
            }),
            invalidatesTags: [Tags.FAQ],
        }),

        updateFAQ: builder.mutation({
            query: ({ id, data }) => ({
                url: `/admin/faq/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: [Tags.FAQ],
        }),

        deleteFAQ: builder.mutation({
            query: (id) => ({
                url: `/admin/faq/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: [Tags.FAQ],
        }),

        toggleFAQStatus: builder.mutation({
            query: ({ id, isActive }) => ({
                url: `/admin/faq/${id}/toggle-status`,
                method: "PATCH",
                body: { isActive },
            }),
            invalidatesTags: [Tags.FAQ],
        }),

        // Feedback endpoints
        getFeedback: builder.query({
            query: ({ page = 1, limit = 10, isRead }) => {
                let url = `/admin/feedback/all?page=${page}&limit=${limit}`;
                if (isRead !== undefined && isRead !== null && isRead !== '') {
                    url += `&isRead=${isRead}`;
                }
                return url;
            },
            providesTags: [Tags.FEEDBACK],
            serializeQueryArgs: ({ endpointName, queryArgs }) => {
                return `${endpointName}-${queryArgs.isRead}`;
            },
            merge: (currentCache, newItems, { arg }) => {
                if (arg.page === 1) {
                    return newItems;
                }
                return {
                    ...newItems,
                    data: {
                        ...newItems.data,
                        feedback: [...(currentCache.data?.feedback || []), ...(newItems.data?.feedback || [])],
                    },
                };
            },
            forceRefetch({ currentArg, previousArg }) {
                return currentArg?.page !== previousArg?.page;
            },
        }),

        markFeedbackRead: builder.mutation({
            query: (id) => ({
                url: `/admin/feedback/mark-read/${id}`,
                method: "PATCH",
            }),
            invalidatesTags: [Tags.FEEDBACK],
        }),

        deleteFeedback: builder.mutation({
            query: (id) => ({
                url: `/admin/feedback/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: [Tags.FEEDBACK],
        }),
    }),
});

export const {
    useGetFAQsQuery,
    useCreateFAQMutation,
    useUpdateFAQMutation,
    useDeleteFAQMutation,
    useToggleFAQStatusMutation,
    useGetFeedbackQuery,
    useMarkFeedbackReadMutation,
    useDeleteFeedbackMutation,
} = commonApi;
