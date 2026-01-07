import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
const BASE_URL = import.meta.env.VITE_BASE_URL;

export const Tags = {
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
    FEEDBACK: "FEEDBACK",
    // String tags used in level quiz endpoints
    LEVEL_CATEGORY: "LevelCategory",
    LEVEL_QUIZ: "LevelQuiz",
    LEVEL_QUESTION: "LevelQuestion",
    FAQ: "FAQ",
    BRAND: "BRAND",
    BRANDBYID: "BRANDBYID",
    REVIEW: "REVIEW",
    REVIEWBYID: "REVIEWBYID",
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
        Tags.FEEDBACK,
        Tags.LEVEL_CATEGORY,
        Tags.LEVEL_QUIZ,
        Tags.LEVEL_QUESTION,
        Tags.FAQ,
        Tags.BRAND,
        Tags.BRANDBYID,
        Tags.REVIEW,
        Tags.REVIEWBYID,
    ],
    endpoints: () => ({}),
});
