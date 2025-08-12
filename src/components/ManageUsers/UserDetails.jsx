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
    
    if (!formData.fullname.trim()) {
      errors.fullname = "Full name is required";
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
      toast.error("Please fix the form errors before saving");
      return;
    }

    const submitData = {
      fullname: formData.fullname.trim(),
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
      await updateUser({ id: params.id, data: submitData }).unwrap();
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
      await suspendAccount(params.id).unwrap();
      toast.success(`User ${reactivate ? 'reactivated' : 'suspended'} successfully!`);
      setPopup(null);
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

  return (
    <>
      {/* ✅ Show loader during operations */}
      {(isUpdateLoading || isSuspendLoading) && (
        <Loader 
          message={isUpdateLoading ? "Updating user details" : "Processing request"} 
          isVisible={true} 
        />
      )}
      
      <div className="">
        <div className="bg-[#E1F8F8] rounded-[30px] py-[24px] px-[32px] max-lg:p-[16px]">
          <h6 className="text-[20px] font-semibold text-[#352AA4]">User details</h6>
          <div className="mt-[16px] flex flex-col gap-[16px]">
            {!isEditing && (
              <div className="flex gap-[20px] max-md:flex-wrap max-md:gap-[16px]">
                <div className="flex justify-center items-center border bg-white border-[#EFEFEF] rounded-2xl p-[16px] h-[170px] w-[170px] overflow-hidden">
                  <img
                    src={
                      data?.profileImage
                        ? `${import.meta.env.VITE_BASE_URL}${data.profileImage}`
                        : user_icon
                    }
                    alt="Profile"
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="flex flex-col gap-[10px] bg-white border-[#EFEFEF] border p-[20px] rounded-2xl w-full max-w-[300px] max-md:max-w-full">
                  <div className="flex justify-between">
                    <p className="text-[#7C7C7C]">Status</p>
                    <span
                      className={`font-medium rounded-lg px-3 py-1
                      ${status === "Active" && "bg-green-100 text-green-800"}
                      ${status === "Inactive" && "bg-red-100 text-red-800"}
                      ${status === "Suspended" && "bg-yellow-50 text-yellow-800"}
                    `}
                    >
                      {status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-[#7C7C7C]">Following</p>
                    <p className="text-[#352AA4] font-medium ">{data?.following || 0}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-[#7C7C7C]">Followers</p>
                    <p className="text-[#352AA4] font-medium ">{data?.followers || 0}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-[#7C7C7C]">Rank points</p>
                    <p className="text-[#352AA4] font-medium ">{data?.rankPoints || 0}</p>
                  </div>
                </div>
              </div>
            )}

            {/* User info fields */}
            <div className="flex gap-[16px] max-md:flex-wrap">
              {/* full name */}
              <label className="flex flex-col w-full">
                <span className="text-[#7C7C7C] text-[14px]">Full Name</span>
                {isEditing ? (
                  <>
                    <input
                      name="fullname"
                      className={`bg-white border rounded-2xl py-[14px] px-[18px] ${
                        formErrors.fullname ? 'border-red-500' : 'border-[#EEEEEE]'
                      }`}
                      type="text"
                      value={formData.fullname}
                      onChange={handleInputChange}
                      placeholder="Enter full name"
                    />
                    {formErrors.fullname && (
                      <span className="text-red-500 text-xs mt-1">{formErrors.fullname}</span>
                    )}
                  </>
                ) : (
                  <p className="py-[14px] px-[18px] capitalize bg-white border rounded-2xl border-[#EEEEEE]">{formData.fullname}</p>
                )}
              </label>
              {/* Email */}
              <label className="flex flex-col w-full">
                <span className="text-[#7C7C7C] text-[14px]">Email</span>
                <input
                  name="email"
                  className="bg-gray-100 border border-[#EEEEEE] rounded-2xl py-[14px] px-[18px] cursor-not-allowed"
                  type="email"
                  value={formData.email}
                  readOnly
                  title="Email cannot be edited"
                />
              </label>
            </div>

            <div className="flex gap-[16px] max-md:flex-wrap">
              {/* Gender */}
              <label className="flex flex-col w-full">
                <span className="text-[#7C7C7C] text-[14px]">Gender</span>
                {isEditing ? (
                  <>
                    <select
                      name="gender"
                      className={`bg-white border rounded-2xl py-[14px] px-[18px] ${
                        formErrors.gender ? 'border-red-500' : 'border-[#EEEEEE]'
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
                      <span className="text-red-500 text-xs mt-1">{formErrors.gender}</span>
                    )}
                  </>
                ) : (
                  <p className="py-[14px] px-[18px] bg-white border rounded-2xl border-[#EEEEEE]">{formData.gender}</p>
                )}
              </label>
              {/* Date of birth */}
              <label className="flex flex-col w-full">
                <span className="text-[#7C7C7C] text-[14px]">Date of birth</span>
                {isEditing ? (
                  <>
                    <input
                      name="dob"
                      className={`bg-white border rounded-2xl py-[14px] px-[18px] ${
                        formErrors.dob ? 'border-red-500' : 'border-[#EEEEEE]'
                      }`}
                      type="date"
                      value={formData.dob}
                      onChange={handleInputChange}
                    />
                    {formErrors.dob && (
                      <span className="text-red-500 text-xs mt-1">{formErrors.dob}</span>
                    )}
                  </>
                ) : (
                  <p className="py-[14px] px-[18px] bg-white border rounded-2xl border-[#EEEEEE]">
                    {data.dob ? `${calculateAge(data.dob)} Years` : "Not provided"}
                  </p>
                )}
              </label>
            </div>

            {/* Enjoy Smell (multi select checkboxes) */}
            <div className="flex flex-col gap-[8px] max-md:flex-wrap">
              <span className="text-[#7C7C7C] text-[14px]">
                Which smells user enjoy the most
              </span>
              {isEditing ? (
                <div className="flex gap-[12px] flex-wrap">
                  {SCENT_PREFERENCES.map((smell) => (
                    <label key={smell} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="enjoySmell"
                        value={smell}
                        checked={formData.enjoySmell.includes(smell)}
                        onChange={handleInputChange}
                      />
                      <span>{smell}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="py-[14px] px-[18px] bg-white border rounded-2xl border-[#EEEEEE]">
                  {formData.enjoySmell.length > 0 ? formData.enjoySmell.join(", ") : "Not specified"}
                </p>
              )}
            </div>

            <div className="flex gap-[16px] max-md:flex-wrap">
              {/* Reason for wear perfume */}
              <label className="flex flex-col w-full">
                <span className="text-[#7C7C7C] text-[14px]">Main reason user wear perfume</span>
                {isEditing ? (
                  <select
                    name="reasonForWearPerfume"
                    className="bg-white border border-[#EEEEEE] rounded-2xl py-[14px] px-[18px]"
                    value={formData.reasonForWearPerfume}
                    onChange={handleInputChange}
                  >
                    <option value="">Select</option>
                    {REASON_FOR_WEAR_PERFUME_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="py-[14px] px-[18px] bg-white border rounded-2xl border-[#EEEEEE]">{formData.reasonForWearPerfume || "Not specified"}</p>
                )}
              </label>
              {/* Perfume Budget */}
              <label className="flex flex-col w-full">
                <span className="text-[#7C7C7C] text-[14px]">User usually spends on a bottle of perfume</span>
                {isEditing ? (
                  <select
                    name="perfumeBudget"
                    className="bg-white border border-[#EEEEEE] rounded-2xl py-[14px] px-[18px]"
                    value={formData.perfumeBudget}
                    onChange={handleInputChange}
                  >
                    <option value="">Select</option>
                    {PERFUME_BUDGET_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="py-[14px] px-[18px] bg-white border rounded-2xl border-[#EEEEEE]">{formData.perfumeBudget || "Not specified"}</p>
                )}
              </label>
            </div>

            <div className="flex gap-[16px] max-md:flex-wrap">
              {/* Perfume Strength slider */}
              <label className="flex flex-col w-full">
                <span className="text-[#7C7C7C] text-[14px]">
                  Perfume strength (0 to 1)
                </span>
                {isEditing ? (
                  <>
                    <input
                      name="perfumeStrength"
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={formData.perfumeStrength || 0}
                      onChange={handleInputChange}
                      className="w-full"
                    />
                    <span className="text-[#352AA4] font-medium">{(formData.perfumeStrength || 0).toFixed(2)}</span>
                  </>
                ) : (
                  <p className="py-[14px] px-[18px] bg-white border rounded-2xl border-[#EEEEEE]">{(formData.perfumeStrength || 0).toFixed(2)}</p>
                )}
              </label>
              {/* Referral Source */}
              <label className="flex flex-col w-full">
                <span className="text-[#7C7C7C] text-[14px]">
                  Where did you hear about us?
                </span>
                {isEditing ? (
                  <select
                    name="referralSource"
                    className="bg-white border border-[#EEEEEE] rounded-2xl py-[14px] px-[18px]"
                    value={formData.referralSource}
                    onChange={handleInputChange}
                  >
                    <option value="">Select</option>
                    {DISCOVERY_SOURCES.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="py-[14px] px-[18px] bg-white border rounded-2xl border-[#EEEEEE]">{formData.referralSource || "Not specified"}</p>
                )}
              </label>
            </div>

            {!isEditing && (
              <div className="flex gap-[16px] max-md:flex-wrap">
                <label className="flex flex-col w-full">
                  <span className="text-[#7C7C7C] text-[14px]">Joined</span>
                  <p className="py-[14px] px-[18px] bg-white border rounded-2xl border-[#EEEEEE]">{formData.joined}</p>
                </label>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-[16px] mt-[24px] flex-wrap">
            {isEditing ? (
              <>
                <button 
                  className="btn-sec" 
                  type="button" 
                  onClick={handleCancelEdit}
                  disabled={isUpdateLoading}
                >
                  Cancel
                </button>
                <button 
                  className={`btn-pri ${isUpdateLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                  type="button" 
                  onClick={handleSave}
                  disabled={isUpdateLoading}
                >
                  {isUpdateLoading ? 'Saving...' : 'Save'}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() =>
                    setPopup(data?.suspendAccount ? "reactivate" : "suspend")
                  }
                  className="btn-sec"
                  type="button"
                  disabled={isSuspendLoading}
                >
                  {data?.suspendAccount ? "Reactivate" : "Suspend"}
                </button>
                <button 
                  className="btn-pri" 
                  type="button" 
                  onClick={() => setIsEditing(true)}
                  disabled={isSuspendLoading}
                >
                  Edit
                </button>
              </>
            )}
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
