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
        getOptionalBrands: builder.query({
            query: () => ({
                url: `/admin/optional-brands`,
                method: "GET",
            }),
            providesTags: [Tags.BRAND],
        }),

    }),
});

export const {
    useGetBrandsQuery,
    useGetBrandByIdQuery,
    useCreateBrandMutation,
    useUpdateBrandMutation,
    useDeleteBrandMutation,
    useGetOptionalBrandsQuery,
} = brandsApi;
