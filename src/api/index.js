import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
const BASE_URL = import.meta.env.VITE_BASE_URL;

const Tags = {
  ADMIN: "ADMIN",
  USER: "USER",
  PERFUME: "PERFUME",
  QUIZ: "QUIZ",
  ARTICLE: "ARTICLE",
  PERFUMEBYID: "PERFUMEBYID",
  BADGE: "BADGE",
  RANKS: "RANKS",
  NOTES: "NOTES",
  PERFUMER: "PERFUMER",
};
export const apis = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_URL}/api/v1`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: [
    Tags.ADMIN,
    Tags.USER,
    Tags.PERFUME,
    Tags.PERFUMEBYID,
    Tags.QUIZ,
    Tags.ARTICLE,
    Tags.BADGE,
    Tags.RANKS,
    Tags.NOTES,
    Tags.PERFUMER,
  ],
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
      invalidatesTags: [Tags.USER],
    }),
    supendUser: builder.mutation({
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
    dashboardData: builder.query({
      query: () => ({
        url: "/admin/dashboard",
        method: "GET",
      }),
      providesTags: [Tags.PERFUME, Tags.USER],
    }),
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
    getArticles: builder.query({
      query: ({ page, limit, search, sort }) => {
        const params = new URLSearchParams();
        if (page) params.append("page", page.toString());
        if (limit) params.append("limit", limit.toString());
        if (search) params.append("search", search);
        if (sort) params.append("sort", sort);
        return `/admin/articles?${params.toString()}`;
      },
      providesTags: [Tags.ARTICLE],
    }),
    createArticle: builder.mutation({
      query: (userData) => ({
        url: "/admin/addArticle",
        method: "POST",
        body: userData,
      }),
      invalidatesTags: [Tags.ARTICLE],
    }),
    updateArticle: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/admin/article/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: [Tags.ARTICLE],
    }),
    deleteArticle: builder.mutation({
      query: ({ id, data }) => ({
        url: `/admin/article/${id}`,
        method: "DELETE",
        body: data,
      }),
      invalidatesTags: [Tags.ARTICLE],
    }),
    getPerfume: builder.query({
      query: ({ page, limit, search, sort }) => {
        const params = new URLSearchParams();
        if (page) params.append("page", page.toString());
        if (limit) params.append("limit", limit.toString());
        if (search) params.append("search", search);
        if (sort) params.append("sort", sort);
        return `/admin/perfumes?${params.toString()}`;
      },
      providesTags: [Tags.PERFUME],
    }),
    getPerfumeById: builder.query({
      query: (id) => ({
        url: `/admin/perfume/${id}`,
        method: "GET",
      }),
      providesTags: [Tags.PERFUMEBYID],
    }),
    getPerfumeForEditById: builder.query({
      query: (id) => ({
        url: `/admin/perfumeForEdit/${id}`,
        method: "GET",
      }),
      providesTags: [Tags.PERFUMEBYID],
    }),
    updatePerfume: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/admin/perfume/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: [Tags.PERFUME, Tags.PERFUMEBYID],
    }),
    createPerFume: builder.mutation({
      query: (formData) => ({
        url: "/admin/addPerfume",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: [Tags.PERFUME],
    }),
    deletePerfume: builder.mutation({
      query: (id) => ({
        url: `/admin/perfume/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [Tags.PERFUME],
    }),
    getNotes: builder.query({
      query: () => ({
        url: `/admin/notes`,
        method: "GET",
      }),
    }),
    getPerfumers: builder.query({
      query: () => ({
        url: `/admin/perfumers`,
        method: "GET",
      }),
    }),
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
    getAllNotes: builder.query({
      query: ({ page, limit, search, sort }) => {
        const params = new URLSearchParams();
        if (page) params.append("page", page.toString());
        if (limit) params.append("limit", limit.toString());
        if (search) params.append("search", search);
        if (sort) params.append("sort", sort);
        return `/admin/allNotes?${params.toString()}`;
      },
      providesTags: [Tags.NOTES],
    }),
    addNote: builder.mutation({
      query: (formData) => ({
        url: "/admin/addNote",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: [Tags.NOTES],
    }),
    updateNote: builder.mutation({
      query: ({ id, data }) => ({
        url: `/admin/note/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: [Tags.NOTES],
    }),
    deleteNote: builder.mutation({
      query: ({ id, data }) => ({
        url: `/admin/note/${id}`,
        method: "DELETE",
        body: data,
      }),
      invalidatesTags: [Tags.NOTES],
    }),
    getAllPerfumes: builder.query({
      query: ({ page, limit, search, sort }) => {
        const params = new URLSearchParams();
        if (page) params.append("page", page.toString());
        if (limit) params.append("limit", limit.toString());
        if (search) params.append("search", search);
        if (sort) params.append("sort", sort);
        return `/admin/allPerfumers?${params.toString()}`;
      },
      providesTags: [Tags.PERFUMER],
    }),
    createPerfumer: builder.mutation({
      query: (formData) => ({
        url: "/admin/addPerfumer",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: [Tags.PERFUMER],
    }),
    updatePerfumer: builder.mutation({
      query: ({ id, data }) => ({
        url: `/admin/perfumer/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: [Tags.PERFUMER],
    }),
    deletePerfumer: builder.mutation({
      query: ({ id, data }) => ({
        url: `/admin/perfumer/${id}`,
        method: "DELETE",
        body: data,
      }),
      invalidatesTags: [Tags.PERFUMER],
    }),
    getPerfumeStats: builder.query({
      query: () => "/admin/perfume/stats",
    }),

    exportPerfumesBatch: builder.mutation({
      query: ({ page, limit }) => ({
        url: `/admin/perfume/export?page=${page}&limit=${limit}`,
        method: "GET",
      }),
    }),

    importPerfumes: builder.mutation({
      query: (data) => ({
        url: "/admin/perfume/import",
        method: "POST",
        body: data,
      }),
    }),
    getNotesStats: builder.query({
      query: () => "/admin/notes/stats",
    }),
    exportNotesBatch: builder.mutation({
      query: ({ page, limit }) => ({
        url: `/admin/notes/export?page=${page}&limit=${limit}`,
        method: "GET",
      }),
    }),
    importNotes: builder.mutation({
      query: (data) => ({
        url: "/admin/notes/import",
        method: "POST",
        body: data,
      }),
    }),

    // Perfumers endpoints
    getPerfumersStats: builder.query({
      query: () => "/admin/perfumers/stats",
    }),
    exportPerfumersBatch: builder.mutation({
      query: ({ page, limit }) => ({
        url: `/admin/perfumers/export?page=${page}&limit=${limit}`,
        method: "GET",
      }),
    }),
    importPerfumers: builder.mutation({
      query: (data) => ({
        url: "/admin/perfumers/import",
        method: "POST",
        body: data,
      }),
    }),
    getLevelCategories: builder.query({
      query: ({ page = 1, limit = 10 }) =>
        `/admin/level-category?page=${page}&limit=${limit}`,
      providesTags: ["LevelCategory"],
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
      invalidatesTags: ["LevelCategory"],
    }),

    updateLevelCategory: builder.mutation({
      query: ({ id, data }) => ({
        url: `/admin/level-category/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["LevelCategory"],
    }),

    deleteLevelCategory: builder.mutation({
      query: (id) => ({
        url: `/admin/level-category/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["LevelCategory", "LevelQuiz", "LevelQuestion"],
    }),

    // Level Quiz endpoints
    getLevelQuizzesByCategory: builder.query({
      query: ({ categoryId, page = 1, limit = 10 }) =>
        `/admin/level-quiz/category/${categoryId}?page=${page}&limit=${limit}`,
      providesTags: ["LevelQuiz"],
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
      invalidatesTags: ["LevelQuiz", "LevelCategory"],
    }),

    updateLevelQuiz: builder.mutation({
      query: ({ id, data }) => ({
        url: `/admin/level-quiz/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["LevelQuiz"],
    }),

    deleteLevelQuiz: builder.mutation({
      query: (id) => ({
        url: `/admin/level-quiz/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["LevelQuiz", "LevelCategory", "LevelQuestion"],
    }),

    // Level Quiz Question endpoints
    getQuestionsByQuiz: builder.query({
      query: ({ quizId, page = 1, limit = 10 }) =>
        `/admin/level-question/quiz/${quizId}?page=${page}&limit=${limit}`,
      providesTags: ["LevelQuestion"],
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
      invalidatesTags: ["LevelQuestion", "LevelQuiz"],
    }),

    updateQuestionLevel: builder.mutation({
      query: ({ id, data }) => ({
        url: `/admin/level-question/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["LevelQuestion"],
    }),

    deleteQuestionLevel: builder.mutation({
      query: (id) => ({
        url: `/admin/level-question/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["LevelQuestion", "LevelQuiz"],
    }),
    getFAQs: builder.query({
      query: ({ type, page = 1, limit = 10, search }) => {
        let url = `/admin/faq?page=${page}&limit=${limit}`;
        if (type) url += `&type=${type}`;
        if (search) url += `&search=${search}`;
        return url;
      },
      providesTags: ["FAQ"],
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
      invalidatesTags: ["FAQ"],
    }),

    updateFAQ: builder.mutation({
      query: ({ id, data }) => ({
        url: `/admin/faq/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["FAQ"],
    }),

    deleteFAQ: builder.mutation({
      query: (id) => ({
        url: `/admin/faq/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["FAQ"],
    }),

    toggleFAQStatus: builder.mutation({
      query: ({ id, isActive }) => ({
        url: `/admin/faq/${id}/toggle-status`,
        method: "PATCH",
        body: { isActive },
      }),
      invalidatesTags: ["FAQ"],
    }),
  }),
});

export const {
  useAdminLoginMutation,
  useAdminDetailsQuery,
  useUsersDetailsQuery,
  useGetUserDetailsQuery,
  useSupendUserMutation,
  useUpdateUserMutation,
  useDashboardDataQuery,
  useAddQuestionMutation,
  useQuestionsQuery,
  useUpdateQuestionMutation,
  useGetArticlesQuery,
  useCreateArticleMutation,
  useUpdateArticleMutation,
  useDeleteArticleMutation,
  useGetPerfumeQuery,
  useGetPerfumeByIdQuery,
  useUpdatePerfumeMutation,
  useGetNotesQuery,
  useGetPerfumersQuery,
  useCreatePerFumeMutation,
  useDeletePerfumeMutation,
  useDeleteQuestionMutation,
  useGetBadgesQuery,
  useCreateBadgeMutation,
  useUpdateBadgeMutation,
  useDeleteBadgeMutation,
  useGetRanksQuery,
  useCreateRankMutation,
  useUpdateRankMutation,
  useDeleteRankMutation,
  useGetAllNotesQuery,
  useAddNoteMutation,
  useUpdateNoteMutation,
  useDeleteNoteMutation,
  useGetAllPerfumesQuery,
  useCreatePerfumerMutation,
  useUpdatePerfumerMutation,
  useDeletePerfumerMutation,
  useGetPerfumeForEditByIdQuery,
  useGetPerfumeStatsQuery,
  useExportPerfumesBatchMutation,
  useImportPerfumesMutation,
  useGetNotesStatsQuery,
  useExportNotesBatchMutation,
  useImportNotesMutation,
  useGetPerfumersStatsQuery,
  useExportPerfumersBatchMutation,
  useImportPerfumersMutation,
  useGetLevelCategoriesQuery,
  useCreateLevelCategoryMutation,
  useUpdateLevelCategoryMutation,
  useDeleteLevelCategoryMutation,
  useGetLevelQuizzesByCategoryQuery,
  useCreateLevelQuizMutation,
  useUpdateLevelQuizMutation,
  useDeleteLevelQuizMutation,
  useGetQuestionsByQuizQuery,
  useCreateQuestionMutation,
  useUpdateQuestionLevelMutation,
  useDeleteQuestionLevelMutation,
  useGetFAQsQuery,
  useCreateFAQMutation,
  useUpdateFAQMutation,
  useDeleteFAQMutation,
  useToggleFAQStatusMutation,
} = apis;
