import { apis, Tags } from "../base";

const articlesApi = apis.injectEndpoints({
    endpoints: (builder) => ({
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
    }),
});

export const {
    useGetArticlesQuery,
    useCreateArticleMutation,
    useUpdateArticleMutation,
    useDeleteArticleMutation,
} = articlesApi;
