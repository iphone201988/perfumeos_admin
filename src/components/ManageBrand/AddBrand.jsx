import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCreateBrandMutation, useGetBrandByIdQuery, useUpdateBrandMutation } from '../../api';
import FormField from '../Form/FormField';
import ImageUploader from '../Form/ImageUploader'; // Or Multiple if preferred, but ImageUploader seems fit for single
import Loader from '../Loader/Loader';
import { toast } from 'react-toastify';

const AddBrand = () => {
    const { id } = useParams();
    const isEdit = !!id;
    const navigate = useNavigate();

    const [files, setFiles] = useState([]); // Assuming ImageUploader returns array/file
    const [createBrand, { isLoading: isCreating }] = useCreateBrandMutation();
    const [updateBrand, { isLoading: isUpdating }] = useUpdateBrandMutation();

    // Fetch data if edit mode
    const { data: brandData, isLoading: isFetching } = useGetBrandByIdQuery(id, {
        skip: !isEdit
    });

    const [form, setForm] = useState({
        name: '',
        image: '',
        description: '',
        foundingInfo: '',
        country: '',
        website: '',
        foundingYear: '',
        founder: '',
        generalInfo: ''
    });

    useEffect(() => {
        if (isEdit && brandData?.data) {
            const brand = brandData.data;
            setForm({
                name: brand.name || '',
                image: brand.image || '',
                description: brand.description || '',
                foundingInfo: brand.foundingInfo || '',
                country: brand.country || '',
                website: brand.website || '',
                foundingYear: brand.foundingYear || '',
                founder: brand.founder || '',
                generalInfo: brand.generalInfo || ''
            });
            // If image exists, you might need to handle it for preview in ImageUploader
            // Assuming ImageUploader handles string URL for preview
        }
    }, [brandData, isEdit]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (newFiles) => {
        setFiles(newFiles);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        Object.keys(form).forEach(key => {
            // If creating, we might skip image string if we are uploading new file
            // If editing, we keep image string unless new file is uploaded
            if (key !== 'image') {
                formData.append(key, form[key]);
            }
        });

        if (files.length > 0) {
            formData.append('image', files[0]);
        }

        try {
            if (isEdit) {
                await updateBrand({ id, formData }).unwrap();
                toast.success("Brand updated successfully");
            } else {
                await createBrand(formData).unwrap();
                toast.success("Brand created successfully");
            }
            navigate('/brands');
        } catch (error) {
            console.error(error);
            toast.error(error?.data?.message || "Operation failed");
        }
    };

    if (isEdit && isFetching) return <Loader message="Loading Brand..." />;

    return (
        <div className="max-w-7xl mx-auto">
            {/* Sticky Action Bar */}
            <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm mb-6">
                <div className="flex justify-between items-center py-4 px-6">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-8 bg-gradient-to-b from-[#352AA4] to-[#5c4ec9] rounded-full"></div>
                        <h1 className="text-[24px] font-bold text-[#352AA4]">
                            {isEdit ? 'Edit Brand' : 'Add New Brand'}
                        </h1>
                    </div>
                    <div className="flex gap-[16px]">
                        <button
                            type="button"
                            className="bg-white text-[#352AA4] text-sm border-2 border-[#352AA4]/20 rounded-full px-5 py-2.5 transition-all duration-300 hover:bg-gray-50 hover:border-[#352AA4] hover:shadow-md font-medium flex items-center gap-2"
                            onClick={() => navigate(-1)}
                        >
                            <span className="text-lg">←</span>
                            Cancel
                        </button>
                        <button
                            type="submit"
                            onClick={handleSubmit}
                            disabled={isCreating || isUpdating}
                            className="bg-[#352AA4] text-white text-sm border-2 border-[#352AA4] rounded-full px-6 py-2.5 transition-all duration-300 hover:bg-[#2a2183] hover:shadow-md font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isCreating || isUpdating ? (
                                <>
                                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <span className="text-lg">{isEdit ? '✓' : '+'}</span>
                                    {isEdit ? 'Update Brand' : 'Create Brand'}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Form Container */}
            <div className="bg-gradient-to-br from-[#E1F8F8] to-[#D4E8F8] rounded-[30px] shadow-lg overflow-hidden">
                <div className="bg-white/60 backdrop-blur-sm rounded-[30px] p-[32px] max-lg:p-[20px] m-[2px]">
                    <form onSubmit={handleSubmit} className="space-y-[32px]">

                        {/* Basic Information Section */}
                        <div className="bg-white/80 rounded-2xl p-[24px] shadow-sm border border-[#352AA4]/10">
                            <div className="flex items-center gap-2 mb-[24px]">
                                <div className="w-2 h-8 bg-gradient-to-b from-[#352AA4] to-[#5c4ec9] rounded-full"></div>
                                <h3 className="text-[20px] font-bold text-[#352AA4]">Basic Information</h3>
                            </div>

                            <div className="space-y-[20px]">
                                {/* Image Uploader */}
                                <div>
                                    <ImageUploader
                                        onImageSelect={(url, file) => {
                                            handleImageChange(file ? [file] : []);
                                            if (url) setForm(prev => ({ ...prev, image: url }));
                                        }}
                                        maxImages={1}
                                        currentImage={form.image}
                                        label="Brand Logo"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
                                    <FormField
                                        label="Brand Name"
                                        name="name"
                                        value={form.name}
                                        onChange={handleInputChange}
                                        placeholder="Enter brand name"
                                        required
                                    />
                                    <FormField
                                        label="Website"
                                        name="website"
                                        value={form.website}
                                        onChange={handleInputChange}
                                        placeholder="https://example.com"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
                                    <FormField
                                        label="Country"
                                        name="country"
                                        value={form.country}
                                        onChange={handleInputChange}
                                        placeholder="e.g. France"
                                    />
                                    <FormField
                                        label="Founding Year"
                                        name="foundingYear"
                                        value={form.foundingYear}
                                        onChange={handleInputChange}
                                        placeholder="e.g. 1990"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-1 gap-[16px]">
                                    <FormField
                                        label="Founder"
                                        name="founder"
                                        value={form.founder}
                                        onChange={handleInputChange}
                                        placeholder="Founder Name"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Detailed Information Section */}
                        <div className="bg-white/80 rounded-2xl p-[24px] shadow-sm border border-[#352AA4]/10">
                            <div className="flex items-center gap-2 mb-[24px]">
                                <div className="w-2 h-8 bg-gradient-to-b from-[#352AA4] to-[#5c4ec9] rounded-full"></div>
                                <h3 className="text-[20px] font-bold text-[#352AA4]">Detailed Information</h3>
                            </div>

                            <div className="space-y-[20px]">
                                <FormField
                                    label="Description"
                                    name="description"
                                    value={form.description}
                                    onChange={handleInputChange}
                                    textArea
                                    rows="4"
                                    placeholder="Brand description"
                                />

                                <FormField
                                    label="General Info"
                                    name="generalInfo"
                                    value={form.generalInfo}
                                    onChange={handleInputChange}
                                    textArea
                                    rows="4"
                                    placeholder="General information"
                                />

                                <FormField
                                    label="Founding Info"
                                    name="foundingInfo"
                                    value={form.foundingInfo}
                                    onChange={handleInputChange}
                                    textArea
                                    rows="4"
                                    placeholder="Founding details"
                                />
                            </div>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddBrand;
