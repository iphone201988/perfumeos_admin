import { apis, Tags } from "../base";

const reviewsApi = apis.injectEndpoints({
    endpoints: (builder) => ({
        getReviews: builder.query({
            query: ({ page = 1, limit = 10, search = "", sort = "createdAt_desc", perfumeId = "", rating = "" }) => ({
                url: "/admin/reviews",
                params: { page, limit, search, sort, perfumeId, rating },
            }),
            providesTags: [Tags.REVIEW],
        }),
        getReviewById: builder.query({
            query: (id) => `/admin/review/${id}`,
            providesTags: (result, error, id) => [{ type: Tags.REVIEWBYID, id }],
        }),
        updateReview: builder.mutation({
            query: ({ id, ...patch }) => ({
                url: `/admin/review/${id}`,
                method: "PUT",
                body: patch,
            }),
            invalidatesTags: (result, error, { id }) => [
                Tags.REVIEW,
                { type: Tags.REVIEWBYID, id },
            ],
        }),
        deleteReview: builder.mutation({
            query: (id) => ({
                url: `/admin/review/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: [Tags.REVIEW],
        }),
    }),
});

export const {
    useGetReviewsQuery,
    useGetReviewByIdQuery,
    useUpdateReviewMutation,
    useDeleteReviewMutation,
} = reviewsApi;
