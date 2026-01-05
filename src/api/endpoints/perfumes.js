import { apis, Tags } from "../base";

const perfumesApi = apis.injectEndpoints({
    endpoints: (builder) => ({
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
        createPerfume: builder.mutation({
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
    }),
});

export const {
    useGetPerfumeQuery,
    useGetPerfumeByIdQuery,
    useGetPerfumeForEditByIdQuery,
    useUpdatePerfumeMutation,
    useCreatePerfumeMutation,
    useDeletePerfumeMutation,
    useGetNotesQuery,
    useGetPerfumersQuery,
    useGetAllNotesQuery,
    useAddNoteMutation,
    useUpdateNoteMutation,
    useDeleteNoteMutation,
    useGetAllPerfumesQuery,
    useCreatePerfumerMutation,
    useUpdatePerfumerMutation,
    useDeletePerfumerMutation,
    useGetPerfumeStatsQuery,
    useExportPerfumesBatchMutation,
    useImportPerfumesMutation,
    useGetNotesStatsQuery,
    useExportNotesBatchMutation,
    useImportNotesMutation,
    useGetPerfumersStatsQuery,
    useExportPerfumersBatchMutation,
    useImportPerfumersMutation,
} = perfumesApi;
