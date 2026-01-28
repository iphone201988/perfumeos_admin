import { apis, Tags } from "../base";

const imagesApi = apis.injectEndpoints({
    endpoints: (builder) => ({
        getImages: builder.query({
            query: ({ page, limit, status, type, sort }) => {
                const params = new URLSearchParams();
                if (page) params.append("page", page.toString());
                if (limit) params.append("limit", limit.toString());
                if (status) params.append("status", status);
                if (type) params.append("type", type);
                if (sort) params.append("sort", sort);
                return `/admin/images?${params.toString()}`;
            },
            providesTags: [Tags.IMAGE],
        }),
        updateImageStatus: builder.mutation({
            query: ({ id, status }) => ({
                url: `/admin/image/${id}/status`,
                method: "PUT",
                body: { status },
            }),
            invalidatesTags: [Tags.IMAGE],
        }),
        deleteImage: builder.mutation({
            query: (id) => ({
                url: `/admin/image/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: [Tags.IMAGE],
        }),
    }),
});

export const {
    useGetImagesQuery,
    useUpdateImageStatusMutation,
    useDeleteImageMutation,
} = imagesApi;
