import { apis, Tags } from "../base";

const brandsApi = apis.injectEndpoints({
    endpoints: (builder) => ({
        getBrands: builder.query({
            query: ({ page, limit, search, sort }) => {
                const params = new URLSearchParams();
                if (page) params.append("page", page.toString());
                if (limit) params.append("limit", limit.toString());
                if (search) params.append("search", search);
                if (sort) params.append("sort", sort);
                return `/admin/brands?${params.toString()}`;
            },
            providesTags: [Tags.BRAND],
        }),
        getBrandById: builder.query({
            query: (id) => ({
                url: `/admin/brand/${id}`,
                method: "GET",
            }),
            providesTags: [Tags.BRANDBYID],
        }),
        createBrand: builder.mutation({
            query: (formData) => ({
                url: "/admin/addBrand",
                method: "POST",
                body: formData,
            }),
            invalidatesTags: [Tags.BRAND],
        }),
        updateBrand: builder.mutation({
            query: ({ id, formData }) => ({
                url: `/admin/brand/${id}`,
                method: "PUT",
                body: formData,
            }),
            invalidatesTags: [Tags.BRAND, Tags.BRANDBYID],
        }),
        deleteBrand: builder.mutation({
            query: (id) => ({
                url: `/admin/brand/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: [Tags.BRAND],
        }),
        getBrandsStats: builder.query({
            query: () => "/admin/brands/stats",
        }),

        exportBrandsBatch: builder.mutation({
            query: ({ page, limit }) => ({
                url: `/admin/brands/export?page=${page}&limit=${limit}`,
                method: "GET",
            }),
        }),

        importBrands: builder.mutation({
            query: (data) => ({
                url: "/admin/brands/import",
                method: "POST",
                body: data,
            }),
        }),
        getOptionalBrands: builder.query({
            query: () => "/admin/optional-brands",
        }),

    }),
});

export const {
    useGetBrandsQuery,
    useGetBrandByIdQuery,
    useCreateBrandMutation,
    useUpdateBrandMutation,
    useDeleteBrandMutation,
    useGetBrandsStatsQuery,
    useExportBrandsBatchMutation,
    useImportBrandsMutation,
    useGetOptionalBrandsQuery,
} = brandsApi;
