import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Select from 'react-select';
import { useGetReviewByIdQuery, useUpdateReviewMutation, useGetNotesQuery, useGetPerfumeQuery } from "../../api";
import Loader from "../Loader/Loader";
import FormField from "../Form/FormField";

const EditReview = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const { data: reviewData, isLoading, error } = useGetReviewByIdQuery(id);
    const { data: notesResponse, isLoading: notesLoading } = useGetNotesQuery();
    // Fetch perfumes for 'reminds me of' selection. Limit 100 or search? 
    // Ideally we need a search endpoint for options, but for now fetching list with reasonable limit.
    const { data: perfumesResponse, isLoading: perfumesLoading } = useGetPerfumeQuery({ page: 1, limit: 1000 });

    const [updateReview, { isLoading: updateLoading }] = useUpdateReviewMutation();

    const review = reviewData?.data;

    const [form, setForm] = useState({
        title: "",
        review: "",
        rating: 0,
        longevity: "",
        sillage: "",
        gender: "",
        price: "",
        perfumeIds: [], // remind me of
        noteIds: [], // smells like
    });

    const [formErrors, setFormErrors] = useState({});

    // Options for Selects
    const noteOptions = useMemo(() => {
        if (!notesResponse?.data) return [];
        return notesResponse.data.map(n => ({ value: n._id, label: n.name }));
    }, [notesResponse]);

    const perfumeOptions = useMemo(() => {
        if (!perfumesResponse?.data?.perfumes) return [];
        return perfumesResponse.data.perfumes.map(p => ({ value: p._id, label: p.name }));
    }, [perfumesResponse]);

    const longevityOptions = [
        { value: "very_weak", label: "Very Weak" },
        { value: "weak", label: "Weak" },
        { value: "moderate", label: "Moderate" },
        { value: "long_lasting", label: "Long Lasting" },
        { value: "eternal", label: "Eternal" },
    ];

    const sillageOptions = [
        { value: "intimate", label: "Intimate" },
        { value: "moderate", label: "Moderate" },
        { value: "strong", label: "Strong" },
        { value: "enormous", label: "Enormous" },
    ];

    const genderOptions = [
        { value: "male", label: "Male" },
        { value: "female", label: "Female" },
        { value: "unisex", label: "Unisex" },
    ];

    const priceOptions = [
        { value: "way_overpriced", label: "Way Overpriced" },
        { value: "overpriced", label: "Overpriced" },
        { value: "ok", label: "Ok" },
        { value: "good_value", label: "Good Value" },
        { value: "great_value", label: "Great Value" },
    ];

    useEffect(() => {
        if (review) {
            setForm({
                title: review.title || "",
                review: review.review || "",
                rating: review.rating || 0,
                longevity: review.longevity || "",
                sillage: review.sillage || "",
                gender: review.gender || "",
                price: review.price || "",
                perfumeIds: review.perfumeIds?.map(id => {
                    // Check if populated or just ID
                    if (typeof id === 'object' && id._id) return id._id;
                    return id;
                }) || [],
                noteIds: review.noteIds?.map(id => {
                    if (typeof id === 'object' && id._id) return id._id;
                    return id;
                }) || [],
            });
        }
    }, [review]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (field, selectedOption) => {
        setForm(prev => ({ ...prev, [field]: selectedOption ? selectedOption.value : "" }));
    };

    const handleMultiSelectChange = (field, selectedOptions) => {
        const values = selectedOptions ? selectedOptions.map(opt => opt.value) : [];
        setForm(prev => ({ ...prev, [field]: values }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateReview({ id, ...form }).unwrap();
            toast.success("Review updated successfully");
            navigate("/reviews");
        } catch (err) {
            toast.error(err?.data?.message || "Failed to update review");
        }
    };

    if (isLoading) return <Loader message="Loading review..." />;
    if (error) return <div className="text-center p-8 text-red-500">Error loading review</div>;

    // Helper to get selected options for React Select
    const getSelectedOption = (options, value) => options.find(opt => opt.value === value);
    const getSelectedOptions = (options, values) => options.filter(opt => values.includes(opt.value));

    const customStyles = {
        control: (provided) => ({ ...provided, borderRadius: '12px', padding: '2px', borderColor: '#E5E7EB' }),
        multiValue: (provided) => ({ ...provided, backgroundColor: '#E1F8F8', borderRadius: '4px' }),
    };

    return (
        <div className="max-w-7xl mx-auto">
            {/* Sticky Action Bar */}
            <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm mb-6">
                <div className="flex justify-between items-center py-4 px-6">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-8 bg-gradient-to-b from-[#352AA4] to-[#5c4ec9] rounded-full"></div>
                        <h1 className="text-[24px] font-bold text-[#352AA4]">Edit Review</h1>
                    </div>
                    <div className="flex gap-[16px]">
                        <button
                            type="button"
                            className="bg-white text-[#352AA4] text-sm border-2 border-[#352AA4]/20 rounded-full px-6 py-2.5 transition-all duration-300 hover:bg-gray-50 hover:border-[#352AA4] hover:shadow-md font-medium flex items-center gap-2"
                            onClick={() => navigate(-1)}
                        >
                            <span className="text-lg">←</span>
                            Back
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            className="bg-[#352AA4] text-white text-sm border-2 border-[#352AA4] rounded-full px-6 py-2.5 transition-all duration-300 hover:bg-[#2a2183] hover:shadow-md font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            disabled={updateLoading}
                        >
                            {updateLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-gradient-to-br from-[#E1F8F8] to-[#D4E8F8] rounded-[30px] shadow-lg overflow-hidden">
                <div className="bg-white/60 backdrop-blur-sm rounded-[30px] p-[32px] max-lg:p-[20px] m-[2px]">

                    {/* Info Card */}
                    <div className="bg-white/80 rounded-2xl p-[24px] shadow-sm border border-[#352AA4]/10 mb-6">
                        <h3 className="text-[18px] font-bold text-[#352AA4] mb-4">Context</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-gray-500 block mb-1">Perfume</span>
                                <span className="font-semibold text-gray-800">{review.perfumeId?.name || "Unknown"}</span>
                            </div>
                            <div>
                                <span className="text-gray-500 block mb-1">Author</span>
                                <span className="font-semibold text-gray-800">{review.authorName || review.userId?.name || "Unknown"}</span>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-[24px]">
                        <div className="bg-white/80 rounded-2xl p-[24px] shadow-sm border border-[#352AA4]/10">
                            <h3 className="text-[18px] font-bold text-[#352AA4] mb-4">Review Content</h3>
                            <div className="space-y-4">
                                <FormField
                                    label="Title"
                                    name="title"
                                    value={form.title}
                                    onChange={handleInputChange}
                                    placeholder="Review Title"
                                />
                                <FormField
                                    label="Review"
                                    name="review"
                                    value={form.review}
                                    onChange={handleInputChange}
                                    placeholder="Review Text"
                                    textArea
                                    rows={5}
                                />
                                <div className="w-full">
                                    <label className="text-[#374151] text-[14px] font-medium mb-1 block">Rating (0-5)</label>
                                    <input
                                        type="number"
                                        name="rating"
                                        value={form.rating}
                                        onChange={handleInputChange}
                                        min="0" max="5" step="0.1"
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#352AA4] focus:ring-2 focus:ring-[#352AA4]/10 outline-none transition-all duration-200"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/80 rounded-2xl p-[24px] shadow-sm border border-[#352AA4]/10">
                            <h3 className="text-[18px] font-bold text-[#352AA4] mb-4">Attributes</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[#374151] text-[14px] font-medium mb-1 block">Longevity</label>
                                    <Select
                                        options={longevityOptions}
                                        value={getSelectedOption(longevityOptions, form.longevity)}
                                        onChange={(opt) => handleSelectChange('longevity', opt)}
                                        styles={customStyles}
                                        isClearable
                                        placeholder="Select Longevity"
                                    />
                                </div>
                                <div>
                                    <label className="text-[#374151] text-[14px] font-medium mb-1 block">Sillage</label>
                                    <Select
                                        options={sillageOptions}
                                        value={getSelectedOption(sillageOptions, form.sillage)}
                                        onChange={(opt) => handleSelectChange('sillage', opt)}
                                        styles={customStyles}
                                        isClearable
                                        placeholder="Select Sillage"
                                    />
                                </div>
                                <div>
                                    <label className="text-[#374151] text-[14px] font-medium mb-1 block">Gender Suggestion</label>
                                    <Select
                                        options={genderOptions}
                                        value={getSelectedOption(genderOptions, form.gender)}
                                        onChange={(opt) => handleSelectChange('gender', opt)}
                                        styles={customStyles}
                                        isClearable
                                        placeholder="Select Gender"
                                    />
                                </div>
                                <div>
                                    <label className="text-[#374151] text-[14px] font-medium mb-1 block">Price Value</label>
                                    <Select
                                        options={priceOptions}
                                        value={getSelectedOption(priceOptions, form.price)}
                                        onChange={(opt) => handleSelectChange('price', opt)}
                                        styles={customStyles}
                                        isClearable
                                        placeholder="Select Price Value"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/80 rounded-2xl p-[24px] shadow-sm border border-[#352AA4]/10">
                            <h3 className="text-[18px] font-bold text-[#352AA4] mb-4">Associations</h3>
                            <div className="space-y-6">
                                <div>
                                    <label className="text-[#374151] text-[14px] font-medium mb-1 block">Reminds me of (Perfumes)</label>
                                    <Select
                                        options={perfumeOptions}
                                        value={getSelectedOptions(perfumeOptions, form.perfumeIds)}
                                        onChange={(opts) => handleMultiSelectChange('perfumeIds', opts)}
                                        styles={customStyles}
                                        isMulti
                                        isLoading={perfumesLoading}
                                        placeholder="Select Perfumes"
                                    />
                                </div>
                                <div>
                                    <label className="text-[#374151] text-[14px] font-medium mb-1 block">Smells like (Notes)</label>
                                    <Select
                                        options={noteOptions}
                                        value={getSelectedOptions(noteOptions, form.noteIds)}
                                        onChange={(opts) => handleMultiSelectChange('noteIds', opts)}
                                        styles={customStyles}
                                        isMulti
                                        isLoading={notesLoading}
                                        placeholder="Select Notes"
                                    />
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditReview;
