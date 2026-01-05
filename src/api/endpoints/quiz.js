import { apis, Tags } from "../base";

const quizApi = apis.injectEndpoints({
    endpoints: (builder) => ({
        addQuestion: builder.mutation({
            query: (userData) => ({
                url: "/admin/addQuestion",
                method: "POST",
                body: userData,
            }),
        }),
        questions: builder.query({
            query: ({ page, limit, type, questionType }) => {
                const params = new URLSearchParams();
                if (type) params.append("type", type);
                if (questionType) params.append("questionType", questionType);
                if (page) params.append("page", page.toString());
                if (limit) params.append("limit", limit.toString());
                return `/admin/questions?${params.toString()}`;
            },
            providesTags: [Tags.QUIZ],
        }),
        updateQuestion: builder.mutation({
            query: ({ id, formData }) => ({
                url: `/admin/question/${id}`,
                method: "PUT",
                body: formData,
            }),
        }),
        deleteQuestion: builder.mutation({
            query: (id) => ({
                url: `/admin/question/${id}`,
                method: "DELETE",
            }),
        }),
    }),
});

export const {
    useAddQuestionMutation,
    useQuestionsQuery,
    useUpdateQuestionMutation,
    useDeleteQuestionMutation,
} = quizApi;
