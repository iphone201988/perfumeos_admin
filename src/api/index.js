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
  PERFUMER: "PERFUMER"
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
    Tags.PERFUMER

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
      query: ({ page, limit, type,questionType }) => {
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
      query: ({ id ,data}) => ({
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
} = apis;
