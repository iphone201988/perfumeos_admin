import { apis, Tags } from "../base";

const levelQuizApi = apis.injectEndpoints({
    endpoints: (builder) => ({
        getLevelCategories: builder.query({
            query: ({ page = 1, limit = 10 }) =>
                `/admin/level-category?page=${page}&limit=${limit}`,
            providesTags: [Tags.LEVEL_CATEGORY],
            serializeQueryArgs: ({ endpointName }) => {
                return endpointName;
            },
            merge: (currentCache, newItems, { arg }) => {
                if (arg.page === 1) {
                    return newItems;
                }
                return {
                    ...newItems,
                    data: [...(currentCache.data || []), ...(newItems.data || [])],
                };
            },
            forceRefetch({ currentArg, previousArg }) {
                return currentArg?.page !== previousArg?.page;
            },
        }),

        createLevelCategory: builder.mutation({
            query: (data) => ({
                url: "/admin/level-category",
                method: "POST",
                body: data,
            }),
            invalidatesTags: [Tags.LEVEL_CATEGORY],
        }),

        updateLevelCategory: builder.mutation({
            query: ({ id, data }) => ({
                url: `/admin/level-category/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: [Tags.LEVEL_CATEGORY],
        }),

        deleteLevelCategory: builder.mutation({
            query: (id) => ({
                url: `/admin/level-category/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: [Tags.LEVEL_CATEGORY, Tags.LEVEL_QUIZ, Tags.LEVEL_QUESTION],
        }),

        // Level Quiz endpoints
        getLevelQuizzesByCategory: builder.query({
            query: ({ categoryId, page = 1, limit = 10 }) =>
                `/admin/level-quiz/category/${categoryId}?page=${page}&limit=${limit}`,
            providesTags: [Tags.LEVEL_QUIZ],
            serializeQueryArgs: ({ endpointName, queryArgs }) => {
                return `${endpointName}-${queryArgs.categoryId}`;
            },
            merge: (currentCache, newItems, { arg }) => {
                if (arg.page === 1) {
                    return newItems;
                }
                return {
                    ...newItems,
                    data: [...(currentCache.data || []), ...(newItems.data || [])],
                };
            },
            forceRefetch({ currentArg, previousArg }) {
                return currentArg?.page !== previousArg?.page;
            },
        }),

        createLevelQuiz: builder.mutation({
            query: (data) => ({
                url: "/admin/level-quiz",
                method: "POST",
                body: data,
            }),
            invalidatesTags: [Tags.LEVEL_QUIZ, Tags.LEVEL_CATEGORY],
        }),

        updateLevelQuiz: builder.mutation({
            query: ({ id, data }) => ({
                url: `/admin/level-quiz/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: [Tags.LEVEL_QUIZ],
        }),

        deleteLevelQuiz: builder.mutation({
            query: (id) => ({
                url: `/admin/level-quiz/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: [Tags.LEVEL_QUIZ, Tags.LEVEL_CATEGORY, Tags.LEVEL_QUESTION],
        }),

        // Level Quiz Question endpoints
        getQuestionsByQuiz: builder.query({
            query: ({ quizId, page = 1, limit = 10 }) =>
                `/admin/level-question/quiz/${quizId}?page=${page}&limit=${limit}`,
            providesTags: [Tags.LEVEL_QUESTION],
            serializeQueryArgs: ({ endpointName, queryArgs }) => {
                return `${endpointName}-${queryArgs.quizId}`;
            },
            merge: (currentCache, newItems, { arg }) => {
                if (arg.page === 1) {
                    return newItems;
                }
                return {
                    ...newItems,
                    data: [...(currentCache.data || []), ...(newItems.data || [])],
                };
            },
            forceRefetch({ currentArg, previousArg }) {
                return currentArg?.page !== previousArg?.page;
            },
        }),

        createQuestion: builder.mutation({
            query: (data) => ({
                url: "/admin/level-question",
                method: "POST",
                body: data,
            }),
            invalidatesTags: [Tags.LEVEL_QUESTION, Tags.LEVEL_QUIZ],
        }),

        updateQuestionLevel: builder.mutation({
            query: ({ id, data }) => ({
                url: `/admin/level-question/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: [Tags.LEVEL_QUESTION],
        }),

        deleteQuestionLevel: builder.mutation({
            query: (id) => ({
                url: `/admin/level-question/${id}`,
                method: "DELETE",
                body: data,
            }),
            invalidatesTags: [Tags.LEVEL_QUESTION, Tags.LEVEL_QUIZ],
        }),
    }),
});

export const {
    useGetLevelCategoriesQuery,
    useCreateLevelCategoryMutation,
    useUpdateLevelCategoryMutation,
    useDeleteLevelCategoryMutation,
    useGetLevelQuizzesByCategoryQuery,
    useCreateLevelQuizMutation,
    useUpdateLevelQuizMutation,
    useDeleteLevelQuizMutation,
    useGetQuestionsByQuizQuery,
    useCreateQuestionMutation, // Note: Conflict with standard quiz question. This is likely useCreateQuestionMutation from levelQuizApi, but needs renamed import to avoid clash if both imported. However, RTK Query hooks are unique per slice export.
    useUpdateQuestionLevelMutation,
    useDeleteQuestionLevelMutation,
} = levelQuizApi;

// Wait. There was a createQuestion in standard quiz as well.
// In the original file:
// createQuestion (line 528) -> Level Question
// addQuestion (line 97) -> Standard Quiz Question
// So useCreateQuestionMutation is indeed for Level Questions.
