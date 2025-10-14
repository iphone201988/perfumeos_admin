import React, { useState, useEffect } from "react";
import addpic_icon from "../../assets/icons/addpic-icon.svg";
import user_icon from "../../assets/icons/user-icon.svg";
import { useNavigate, useParams } from "react-router-dom";
import { useGetUserDetailsQuery, useSupendUserMutation, useUpdateUserMutation } from "../../api";
import { calculateAge } from "../../Utils/function";
import ConfirmationModal from "../Modal/ConfirmationModal";
import Loader from "../Loader/Loader";
import { toast } from 'react-toastify';

// Option enums
const GENDER_OPTIONS = ["Male", "Female", "Prefer not to say"];
const REASON_FOR_WEAR_PERFUME_OPTIONS = [
  "Everyday", "Work", "Dates", "Special Events", "Gym", "Just for me", "Other"
];
const SCENT_PREFERENCES = [
  "Fresh", "Sweet", "Woody", "Floral", "Spicy", "Fruity", "Musky"
];
const PERFUME_BUDGET_OPTIONS = [
  "Under $50", "$50 - $100", "$100 - $200", "Above $200"
];
const DISCOVERY_SOURCES = [
  "Facebook", "Instagram", "Tiktok", "App Store", "Friend or Family"
];

const UserDetails = () => {
  const params = useParams();
  const navigate = useNavigate();

  // redirect on invalid id
  useEffect(() => {
    if (params?.id?.length !== 24) navigate("/users");
  }, [params, navigate]);

  const { data: userResponse, isLoading, error, refetch } = useGetUserDetailsQuery(params.id);
  const [suspendAccount, { isLoading: isSuspendLoading }] = useSupendUserMutation();
  const [updateUser, { isLoading: isUpdateLoading }] = useUpdateUserMutation();
  const data = userResponse?.data;

  const [isEditing, setIsEditing] = useState(false);
  const [popup, setPopup] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const [formData, setFormData] = useState({
    fullname: "",
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    gender: "",
    dob: "",
    enjoySmell: [],
    reasonForWearPerfume: "",
    perfumeBudget: "",
    perfumeStrength: 0,
    referralSource: "",
    joined: ""
  });

  // ✅ Initialize form data when user data loads
  useEffect(() => {
    if (data) {
      setFormData({
        fullname: data.fullname || "",
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        username: data.username || "",
        email: data.email || "",
        gender: capitalizeFirstLetter(data.gender) || "",
        dob: data.dob ? data.dob.slice(0, 10) : "",
        enjoySmell: data.enjoySmell || [],
        reasonForWearPerfume: data.reasonForWearPerfume || "",
        perfumeBudget: data.perfumeBudget || "",
        perfumeStrength: typeof data.perfumeStrength === "number" ? data.perfumeStrength / 100 : 0,
        referralSource: data.referralSource || "",
        joined: data.createdAt ? new Date(data.createdAt).toLocaleDateString() : "",
      });
    }
  }, [data]);

  function capitalizeFirstLetter(string) {
    if (!string) return "";
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  // ✅ Form validation
  const validateForm = () => {
    const errors = {};

    if (!formData.firstName.trim()) {
      errors.firstName = "First name is required";
    }
    if (!formData.lastName.trim()) {
      errors.lastName = "Last name is required";
    }

    if (!formData.gender) {
      errors.gender = "Gender is required";
    }

    if (!formData.dob) {
      errors.dob = "Date of birth is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, checked } = e.target;

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: "" }));
    }

    if (name === "enjoySmell") {
      let newEnjoySmell = [...formData.enjoySmell];
      if (checked) {
        if (!newEnjoySmell.includes(value)) newEnjoySmell.push(value);
      } else {
        newEnjoySmell = newEnjoySmell.filter((item) => item !== value);
      }
      setFormData((prev) => ({ ...prev, enjoySmell: newEnjoySmell }));
    } else if (name === "perfumeStrength") {
      setFormData((prev) => ({ ...prev, perfumeStrength: parseFloat(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // ✅ Enhanced save handler with validation and error handling
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    const submitData = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      enjoySmell: formData.enjoySmell,
      gender: formData.gender,
      dob: formData.dob,
      reasonForWearPerfume: formData.reasonForWearPerfume,
      perfumeBudget: formData.perfumeBudget,
      perfumeStrength: typeof formData.perfumeStrength === "number"
        ? Math.round(formData.perfumeStrength * 100)
        : 0,
      referralSource: formData.referralSource,
    };

    try {
      await updateUser({ id: params.id, formData: submitData }).unwrap();
      toast.success("User details updated successfully!");
      setIsEditing(false);
      refetch();
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error?.data?.message || "Failed to update user details");
    }
  };

  // ✅ Enhanced suspend handler with better error handling
  const handleSuspend = async (reactivate = false) => {
    try {
      setPopup(null);
      await suspendAccount(params.id).unwrap();
      toast.success(`User ${reactivate ? 'reactivated' : 'suspended'} successfully!`);
      refetch();
    } catch (error) {
      console.error("Suspend error:", error);
      toast.error(error?.data?.message || `Failed to ${reactivate ? 'reactivate' : 'suspend'} user`);
      setPopup(null);
    }
  };

  // ✅ Cancel editing with confirmation if form is dirty
  const handleCancelEdit = () => {
    // Reset form to original data
    if (data) {
      setFormData({
        fullname: data.fullname || "",
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        email: data.email || "",
        gender: capitalizeFirstLetter(data.gender) || "",
        dob: data.dob ? data.dob.slice(0, 10) : "",
        enjoySmell: data.enjoySmell || [],
        reasonForWearPerfume: data.reasonForWearPerfume || "",
        perfumeBudget: data.perfumeBudget || "",
        perfumeStrength: typeof data.perfumeStrength === "number" ? data.perfumeStrength / 100 : 0,
        referralSource: data.referralSource || "",
        joined: data.createdAt ? new Date(data.createdAt).toLocaleDateString() : "",
      });
    }
    setFormErrors({});
    setIsEditing(false);
  };

  // ✅ Loading states
  if (isLoading) return <Loader message="Loading user details" isVisible={true} />;
  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-500 text-center">
          <p className="text-lg font-semibold">Error loading user details</p>
          <p className="text-sm mt-2">{error?.data?.message || "Something went wrong"}</p>
          <button
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  if (!data) return null;

  // Account status
  const status = data?.isDeleted
    ? "Inactive"
    : data?.suspendAccount
      ? "Suspended"
      : "Active";

  const getMaxDate = () => {
    const today = new Date();
    const maxDate = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate());
    return maxDate.toISOString().split('T')[0];
  };

  return (
    <>
      {/* ✅ Show loader during operations */}
      {(isUpdateLoading || isSuspendLoading) && (
        <Loader
          message={isUpdateLoading ? "Updating user details" : "Processing request"}
          isVisible={true}
        />
      )}

      <div className="max-w-7xl mx-auto">
        {/* Action Buttons */}
        <div className="flex justify-end gap-[16px] mb-[32px] flex-wrap">
          {isEditing ? (
            <>
              <button
                className="bg-white text-[#352AA4] text-sm border-2 border-[#352AA4]/20 rounded-full px-6 py-3 transition-all duration-300 hover:bg-gray-50 hover:border-[#352AA4] hover:shadow-md font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                type="button"
                onClick={handleCancelEdit}
                disabled={isUpdateLoading}
              >
                Cancel
              </button>
              <button
                className={`bg-[#352AA4] text-white text-sm border-2 border-[#352AA4] rounded-full px-6 py-3 transition-all duration-300 hover:bg-[#2a2183] hover:shadow-md font-medium ${isUpdateLoading ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                type="button"
                onClick={handleSave}
                disabled={isUpdateLoading}
              >
                {isUpdateLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate('/users')}
                className="bg-white text-[#352AA4] text-sm border-2 border-[#352AA4]/20 rounded-full px-6 py-3 transition-all duration-300 hover:bg-gray-50 hover:border-[#352AA4] hover:shadow-md flex items-center gap-2 font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                type="button"
                disabled={isSuspendLoading}
              >
                <span className="text-lg">←</span>
                Back
              </button>

              <button
                onClick={() =>
                  setPopup(data?.suspendAccount ? "reactivate" : "suspend")
                }
                className={`text-sm border-2 rounded-full px-6 py-3 transition-all duration-300 hover:shadow-md font-medium ${data?.suspendAccount
                    ? 'bg-green-500 text-white border-green-500 hover:bg-green-600'
                    : 'bg-yellow-500 text-white border-yellow-500 hover:bg-yellow-600'
                  }`}
                type="button"
                disabled={isSuspendLoading}
              >
                {data?.suspendAccount ? "Reactivate Account" : "Suspend Account"}
              </button>

              <button
                className="bg-[#352AA4] text-white text-sm border-2 border-[#352AA4] rounded-full px-6 py-3 transition-all duration-300 hover:bg-[#2a2183] hover:shadow-md font-medium"
                type="button"
                onClick={() => setIsEditing(true)}
                disabled={isSuspendLoading}
              >
                Edit Details
              </button>
            </>
          )}
        </div>
        {/* Main Container with Gradient Background */}
        <div className="bg-gradient-to-br from-[#E1F8F8] to-[#D4E8F8] rounded-[30px] shadow-lg overflow-hidden">
          <div className="bg-white/60 backdrop-blur-sm rounded-[30px] p-[32px] max-lg:p-[20px] m-[2px]">

            {/* Profile Header Section */}
            {!isEditing && (
              <div className="flex gap-[32px] items-start mb-[32px] max-md:flex-col">
                {/* Profile Image Card */}
                <div className="relative group flex-shrink-0">
                  <div className="flex justify-center items-center bg-gradient-to-br from-white to-gray-50 border-2 border-[#352AA4]/10 rounded-3xl p-[16px] h-[200px] w-[200px] overflow-hidden shadow-md transition-all duration-300 group-hover:shadow-xl group-hover:scale-[1.02]">
                    <img
                      src={
                        data?.profileImage
                          ? `${import.meta.env.VITE_BASE_URL}${data.profileImage}`
                          : user_icon
                      }
                      alt="Profile"
                      className="object-cover w-full h-full rounded-2xl"
                    />
                  </div>
                  {/* Decorative corner */}
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#352AA4] rounded-full opacity-20"></div>
                </div>

                {/* Stats Card */}
                <div className="flex-1 bg-white rounded-3xl p-[24px] shadow-md border border-[#352AA4]/10 max-w-[400px] max-md:max-w-full">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-6 bg-gradient-to-b from-[#352AA4] to-[#5c4ec9] rounded-full"></div>
                    <h3 className="text-[20px] font-bold text-[#352AA4]">Account Overview</h3>
                  </div>

                  <div className="space-y-[12px]">
                    {/* Status */}
                    <div className="flex justify-between items-center bg-gray-50 rounded-xl px-[16px] py-[12px]">
                      <span className="text-[#7C7C7C] font-medium">Status</span>
                      <span
                        className={`font-semibold rounded-full px-4 py-1.5 text-sm
                          ${status === "Active" && "bg-green-100 text-green-700 border border-green-300"}
                          ${status === "Inactive" && "bg-red-100 text-red-700 border border-red-300"}
                          ${status === "Suspended" && "bg-yellow-100 text-yellow-700 border border-yellow-300"}
                        `}
                      >
                        {status}
                      </span>
                    </div>

                    {/* Following */}
                    <div className="flex justify-between items-center bg-gray-50 rounded-xl px-[16px] py-[12px] hover:bg-gray-100 transition-colors">
                      <span className="text-[#7C7C7C] font-medium">Following</span>
                      <span className="text-[#352AA4] font-bold text-lg">{data?.following || 0}</span>
                    </div>

                    {/* Followers */}
                    <div className="flex justify-between items-center bg-gray-50 rounded-xl px-[16px] py-[12px] hover:bg-gray-100 transition-colors">
                      <span className="text-[#7C7C7C] font-medium">Followers</span>
                      <span className="text-[#352AA4] font-bold text-lg">{data?.followers || 0}</span>
                    </div>

                    {/* Rank Points */}
                    <div className="flex justify-between items-center bg-gradient-to-r from-[#352AA4]/10 to-[#5c4ec9]/10 rounded-xl px-[16px] py-[12px] border border-[#352AA4]/20">
                      <span className="text-[#7C7C7C] font-medium">Rank Points</span>
                      <span className="text-[#352AA4] font-bold text-lg">{data?.rankPoints || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Personal Information Section */}
            <div className="bg-white/80 rounded-2xl p-[24px] shadow-sm border border-[#352AA4]/10 mb-[24px]">
              <div className="flex items-center gap-2 mb-[24px]">
                <div className="w-2 h-8 bg-gradient-to-b from-[#352AA4] to-[#5c4ec9] rounded-full"></div>
                <h3 className="text-[22px] font-bold text-[#352AA4]">Personal Information</h3>
              </div>

              <div className="space-y-[20px]">
                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
                  {/* First Name */}
                  <label className="flex flex-col">
                    <span className="text-[#7C7C7C] text-[14px] font-medium mb-2">First Name</span>
                    {isEditing ? (
                      <>
                        <input
                          name="firstName"
                          className={`bg-white border-2 rounded-xl py-[14px] px-[18px] focus:outline-none focus:ring-2 focus:ring-[#352AA4]/30 transition-all ${formErrors.firstName ? 'border-red-500' : 'border-[#EEEEEE] focus:border-[#352AA4]'
                            }`}
                          type="text"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          placeholder="Enter first name"
                        />
                        {formErrors.firstName && (
                          <span className="text-red-500 text-xs mt-1 font-medium">{formErrors.firstName}</span>
                        )}
                      </>
                    ) : (
                      <p className="py-[14px] px-[18px] capitalize bg-gray-50 border border-[#EEEEEE] rounded-xl font-medium">
                        {formData.firstName || "—"}
                      </p>
                    )}
                  </label>

                  {/* Last Name */}
                  <label className="flex flex-col">
                    <span className="text-[#7C7C7C] text-[14px] font-medium mb-2">Last Name</span>
                    {isEditing ? (
                      <>
                        <input
                          name="lastName"
                          className={`bg-white border-2 rounded-xl py-[14px] px-[18px] focus:outline-none focus:ring-2 focus:ring-[#352AA4]/30 transition-all ${formErrors.lastName ? 'border-red-500' : 'border-[#EEEEEE] focus:border-[#352AA4]'
                            }`}
                          type="text"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          placeholder="Enter last name"
                        />
                        {formErrors.lastName && (
                          <span className="text-red-500 text-xs mt-1 font-medium">{formErrors.lastName}</span>
                        )}
                      </>
                    ) : (
                      <p className="py-[14px] px-[18px] capitalize bg-gray-50 border border-[#EEEEEE] rounded-xl font-medium">
                        {formData.lastName || "—"}
                      </p>
                    )}
                  </label>
                </div>

                {/* Username and Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
                  {/* Username */}
                  <label className="flex flex-col">
                    <span className="text-[#7C7C7C] text-[14px] font-medium mb-2">Username</span>
                    <div className="relative">
                      <input
                        name="username"
                        className="bg-gray-100 border border-[#EEEEEE] rounded-xl py-[14px] px-[18px] pr-[40px] cursor-not-allowed w-full font-medium"
                        type="text"
                        value={formData.username}
                        readOnly
                        title="Username cannot be edited"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">🔒</span>
                    </div>
                  </label>

                  {/* Email */}
                  <label className="flex flex-col">
                    <span className="text-[#7C7C7C] text-[14px] font-medium mb-2">Email</span>
                    <div className="relative">
                      <input
                        name="email"
                        className="bg-gray-100 border border-[#EEEEEE] rounded-xl py-[14px] px-[18px] pr-[40px] cursor-not-allowed w-full font-medium"
                        type="email"
                        value={formData.email}
                        readOnly
                        title="Email cannot be edited"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">🔒</span>
                    </div>
                  </label>
                </div>

                {/* Gender and DOB */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
                  {/* Gender */}
                  <label className="flex flex-col">
                    <span className="text-[#7C7C7C] text-[14px] font-medium mb-2">Gender</span>
                    {isEditing ? (
                      <>
                        <select
                          name="gender"
                          className={`bg-white border-2 rounded-xl py-[14px] px-[18px] focus:outline-none focus:ring-2 focus:ring-[#352AA4]/30 transition-all ${formErrors.gender ? 'border-red-500' : 'border-[#EEEEEE] focus:border-[#352AA4]'
                            }`}
                          value={formData.gender}
                          onChange={handleInputChange}
                        >
                          <option value="">Select gender</option>
                          {GENDER_OPTIONS.map((g) => (
                            <option key={g} value={g}>
                              {g}
                            </option>
                          ))}
                        </select>
                        {formErrors.gender && (
                          <span className="text-red-500 text-xs mt-1 font-medium">{formErrors.gender}</span>
                        )}
                      </>
                    ) : (
                      <p className="py-[14px] px-[18px] bg-gray-50 border border-[#EEEEEE] rounded-xl font-medium">
                        {formData.gender || "—"}
                      </p>
                    )}
                  </label>

                  {/* Date of Birth */}
                  <label className="flex flex-col">
                    <span className="text-[#7C7C7C] text-[14px] font-medium mb-2">Date of Birth</span>
                    {isEditing ? (
                      <>
                        <input
                          name="dob"
                          className={`bg-white border-2 rounded-xl py-[14px] px-[18px] focus:outline-none focus:ring-2 focus:ring-[#352AA4]/30 transition-all ${formErrors.dob ? 'border-red-500' : 'border-[#EEEEEE] focus:border-[#352AA4]'
                            }`}
                          type="date"
                          value={formData.dob}
                          onChange={handleInputChange}
                          max={getMaxDate()}
                        />
                        {formErrors.dob && (
                          <span className="text-red-500 text-xs mt-1 font-medium">{formErrors.dob}</span>
                        )}
                      </>
                    ) : (
                      <p className="py-[14px] px-[18px] bg-gray-50 border border-[#EEEEEE] rounded-xl font-medium">
                        {data.dob ? `${calculateAge(data.dob)} Years` : "Not provided"}
                      </p>
                    )}
                  </label>
                </div>
              </div>
            </div>

            {/* Preferences Section */}
            <div className="bg-white/80 rounded-2xl p-[24px] shadow-sm border border-[#352AA4]/10 mb-[24px]">
              <div className="flex items-center gap-2 mb-[24px]">
                <div className="w-2 h-8 bg-gradient-to-b from-[#352AA4] to-[#5c4ec9] rounded-full"></div>
                <h3 className="text-[22px] font-bold text-[#352AA4]">Perfume Preferences</h3>
              </div>

              <div className="space-y-[20px]">
                {/* Enjoy Smell */}
                <div className="flex flex-col">
                  <span className="text-[#7C7C7C] text-[14px] font-medium mb-3">Favorite Scents</span>
                  {isEditing ? (
                    <div className="flex gap-[12px] flex-wrap">
                      {SCENT_PREFERENCES.map((smell) => (
                        <label
                          key={smell}
                          className={`flex items-center gap-2 cursor-pointer px-4 py-2.5 rounded-xl border-2 transition-all ${formData.enjoySmell.includes(smell)
                              ? 'bg-[#352AA4] text-white border-[#352AA4]'
                              : 'bg-white text-gray-700 border-gray-200 hover:border-[#352AA4]/50'
                            }`}
                        >
                          <input
                            type="checkbox"
                            name="enjoySmell"
                            value={smell}
                            checked={formData.enjoySmell.includes(smell)}
                            onChange={handleInputChange}
                            className="hidden"
                          />
                          <span className="font-medium">{smell}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="flex gap-2 flex-wrap">
                      {formData.enjoySmell.length > 0 ? (
                        formData.enjoySmell.map((smell) => (
                          <span
                            key={smell}
                            className="bg-[#352AA4]/10 text-[#352AA4] px-4 py-2 rounded-full text-sm font-medium border border-[#352AA4]/20"
                          >
                            {smell}
                          </span>
                        ))
                      ) : (
                        <p className="py-[14px] px-[18px] bg-gray-50 border border-[#EEEEEE] rounded-xl font-medium text-gray-500">
                          Not specified
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Reason and Budget */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
                  {/* Reason for Wear */}
                  <label className="flex flex-col">
                    <span className="text-[#7C7C7C] text-[14px] font-medium mb-2">Main Reason to Wear</span>
                    {isEditing ? (
                      <select
                        name="reasonForWearPerfume"
                        className="bg-white border-2 border-[#EEEEEE] rounded-xl py-[14px] px-[18px] focus:outline-none focus:ring-2 focus:ring-[#352AA4]/30 focus:border-[#352AA4] transition-all"
                        value={formData.reasonForWearPerfume}
                        onChange={handleInputChange}
                      >
                        <option value="">Select reason</option>
                        {REASON_FOR_WEAR_PERFUME_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="py-[14px] px-[18px] bg-gray-50 border border-[#EEEEEE] rounded-xl font-medium">
                        {formData.reasonForWearPerfume || "Not specified"}
                      </p>
                    )}
                  </label>

                  {/* Budget */}
                  <label className="flex flex-col">
                    <span className="text-[#7C7C7C] text-[14px] font-medium mb-2">Typical Budget</span>
                    {isEditing ? (
                      <select
                        name="perfumeBudget"
                        className="bg-white border-2 border-[#EEEEEE] rounded-xl py-[14px] px-[18px] focus:outline-none focus:ring-2 focus:ring-[#352AA4]/30 focus:border-[#352AA4] transition-all"
                        value={formData.perfumeBudget}
                        onChange={handleInputChange}
                      >
                        <option value="">Select budget</option>
                        {PERFUME_BUDGET_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="py-[14px] px-[18px] bg-gray-50 border border-[#EEEEEE] rounded-xl font-medium">
                        {formData.perfumeBudget || "Not specified"}
                      </p>
                    )}
                  </label>
                </div>

                {/* Strength and Referral */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
                  {/* Perfume Strength */}
                  <label className="flex flex-col">
                    <span className="text-[#7C7C7C] text-[14px] font-medium mb-2">Preferred Strength</span>
                    {isEditing ? (
                      <div className="bg-white border-2 border-[#EEEEEE] rounded-xl p-[16px]">
                        <input
                          name="perfumeStrength"
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={formData.perfumeStrength || 0}
                          onChange={handleInputChange}
                          className="w-full accent-[#352AA4]"
                        />
                        <div className="flex justify-between mt-2">
                          <span className="text-xs text-gray-500">Light</span>
                          <span className="text-[#352AA4] font-bold text-lg">
                            {(formData.perfumeStrength || 0).toFixed(2)}
                          </span>
                          <span className="text-xs text-gray-500">Strong</span>
                        </div>
                      </div>
                    ) : (
                      <div className="py-[14px] px-[18px] bg-gray-50 border border-[#EEEEEE] rounded-xl">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">{(formData.perfumeStrength || 0).toFixed(2)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-[#352AA4] to-[#5c4ec9] h-2 rounded-full transition-all"
                            style={{ width: `${(formData.perfumeStrength || 0) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </label>

                  {/* Referral Source */}
                  <label className="flex flex-col">
                    <span className="text-[#7C7C7C] text-[14px] font-medium mb-2">Discovery Source</span>
                    {isEditing ? (
                      <select
                        name="referralSource"
                        className="bg-white border-2 border-[#EEEEEE] rounded-xl py-[14px] px-[18px] focus:outline-none focus:ring-2 focus:ring-[#352AA4]/30 focus:border-[#352AA4] transition-all"
                        value={formData.referralSource}
                        onChange={handleInputChange}
                      >
                        <option value="">Select source</option>
                        {DISCOVERY_SOURCES.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="py-[14px] px-[18px] bg-gray-50 border border-[#EEEEEE] rounded-xl font-medium">
                        {formData.referralSource || "Not specified"}
                      </p>
                    )}
                  </label>
                </div>

                {/* Joined Date - Only show when not editing */}
                {!isEditing && (
                  <label className="flex flex-col">
                    <span className="text-[#7C7C7C] text-[14px] font-medium mb-2">Member Since</span>
                    <p className="py-[14px] px-[18px] bg-gradient-to-r from-[#352AA4]/10 to-[#5c4ec9]/10 border border-[#352AA4]/20 rounded-xl font-medium text-[#352AA4]">
                      {formData.joined}
                    </p>
                  </label>
                )}
              </div>
            </div>
          </div>
        </div>



        <ConfirmationModal
          isOpen={popup === "suspend"}
          onClose={() => setPopup(null)}
          onConfirm={() => handleSuspend(false)}
          message="Are you sure you want to suspend this user?"
        />
        <ConfirmationModal
          isOpen={popup === "reactivate"}
          onClose={() => setPopup(null)}
          onConfirm={() => handleSuspend(true)}
          message="Are you sure you want to reactivate this user?"
        />
      </div>
    </>
  );
};

export default UserDetails;
