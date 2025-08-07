import React, { useState, useEffect } from "react";
import addpic_icon from "../../assets/icons/addpic-icon.svg";
import user_icon from "../../assets/icons/user-icon.svg";
import { useNavigate, useParams } from "react-router-dom";
import { useGetUserDetailsQuery, useSupendUserMutation, useUpdateUserMutation } from "../../api";
import { calculateAge } from "../../Utils/function";
import ConfirmationModal from "../Modal/ConfirmationModal";

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
  const [suspendAccount] = useSupendUserMutation();
  const [updateUser] = useUpdateUserMutation();
  const data = userResponse?.data;

  const [isEditing, setIsEditing] = useState(false);
  const [popup, setPopup] = useState(null);

  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    gender: "",
    dob: "",
    enjoySmell: [],
    reasonForWearPerfume: "",
    perfumeBudget: "",
    perfumeStrength: "", // 0-1 in UI, 0-100 in API
    referralSource: "",
    joined: ""
  });

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
        perfumeStrength: typeof data.perfumeStrength === "number" ? data.perfumeStrength / 100 : "", // UI is 0-1
        referralSource: data.referralSource || "",
        joined: data.createdAt ? data.createdAt.slice(0, 10) : "",
      });
    }
  }, [data]);

  function capitalizeFirstLetter(string) {
    if (!string) return "";
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  const handleInputChange = (e) => {
    const { name, value, checked } = e.target;
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

  const handleSave = async() => {
    const submitData = {
      fullname: formData.fullname,
      // email should not be edited/saved if not allowed by backend
      enjoySmell: formData.enjoySmell,
      gender: formData.gender,
      dob: formData.dob,
      reasonForWearPerfume: formData.reasonForWearPerfume,
      perfumeBudget: formData.perfumeBudget,
      perfumeStrength: typeof formData.perfumeStrength === "number"
        ? Math.round(formData.perfumeStrength * 100)
        : 0,
      referralSource: formData.referralSource,
      // joined is not needed in update
    };
    await updateUser({ id: params.id, data: submitData });
    console.log("Saving data:", submitData);

    setIsEditing(false);
    refetch(); // Optionally refresh data
  };

  // Suspend/Reactivate handler
  const handleSuspend = async (reactivate = false) => {
    await suspendAccount(params.id);
    setPopup(null);
    refetch();
  };
  

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading user details</div>;
  if (!data) return null;

  // Account status
  const status = data?.isDeleted
    ? "Inactive"
    : data?.suspendAccount
    ? "Suspended"
    : "Active";

  return (
    <div className="">
      <div className="bg-[#E1F8F8] rounded-[30px] py-[24px] px-[32px] max-lg:p-[16px]">
        <h6 className="text-[20px] font-semibold text-[#352AA4]">User details</h6>
        <div className="mt-[16px] flex flex-col gap-[16px]">
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

          {/* User info fields */}
          <div className="flex gap-[16px] max-md:flex-wrap">
            {/* full name */}
            <label className="flex flex-col w-full">
              <span className="text-[#7C7C7C] text-[14px]">Full Name</span>
              {isEditing ? (
                <input
                  name="fullname"
                  className="bg-white border border-[#EEEEEE] rounded-2xl py-[14px] px-[18px]"
                  type="text"
                  value={formData.fullname}
                  onChange={handleInputChange}
                  placeholder="Enter here"
                />
              ) : (
                <p className="py-[14px] px-[18px] capitalize">{formData.fullname}</p>
              )}
            </label>
            {/* Email */}
            <label className="flex flex-col w-full">
              <span className="text-[#7C7C7C] text-[14px]">Email</span>
              <input
                name="email"
                className="bg-white border border-[#EEEEEE] rounded-2xl py-[14px] px-[18px]"
                type="email"
                value={formData.email}
                readOnly
              />
            </label>
          </div>
          <div className="flex gap-[16px] max-md:flex-wrap">
            {/* Gender */}
            <label className="flex flex-col w-full">
              <span className="text-[#7C7C7C] text-[14px]">Gender</span>
              {isEditing ? (
                <select
                  name="gender"
                  className="bg-white border border-[#EEEEEE] rounded-2xl py-[14px] px-[18px]"
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
              ) : (
                <p className="py-[14px] px-[18px]">{formData.gender}</p>
              )}
            </label>
            {/* Date of birth */}
            <label className="flex flex-col w-full">
              <span className="text-[#7C7C7C] text-[14px]">Date of birth</span>
              {isEditing ? (
                <input
                  name="dob"
                  className="bg-white border border-[#EEEEEE] rounded-2xl py-[14px] px-[18px]"
                  type="date"
                  value={formData.dob}
                  onChange={handleInputChange}
                />
              ) : (
                <p className="py-[14px] px-[18px]">{calculateAge(data.dob)} Years</p>
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
              <p className="py-[14px] px-[18px]">{formData.enjoySmell.join(", ")}</p>
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
                <p className="py-[14px] px-[18px]">{formData.reasonForWearPerfume}</p>
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
                <p className="py-[14px] px-[18px]">{formData.perfumeBudget}</p>
              )}
            </label>
          </div>
          <div className="flex gap-[16px] max-md:flex-wrap">
            {/* Perfume Strength slider (from 0 to 1) */}
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
                  <span className="text-[#352AA4] font-medium">{formData.perfumeStrength?.toFixed(2)}</span>
                </>
              ) : (
                <p className="py-[14px] px-[18px]">{(formData.perfumeStrength || 0).toFixed(2)}</p>
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
                <p className="py-[14px] px-[18px]">{formData.referralSource}</p>
              )}
            </label>
          </div>
          {!isEditing && (
            <div className="flex gap-[16px] max-md:flex-wrap">
              <label className="flex flex-col w-full">
                <span className="text-[#7C7C7C] text-[14px]">Joined</span>
                <p className="py-[14px] px-[18px]">{formData.joined}</p>
              </label>
            </div>
          )}
        </div>
        {/* Action Buttons */}
        <div className="flex justify-end gap-[16px] mt-[24px] flex-wrap">
          {isEditing ? (
            <>
              <button className="btn-sec" type="button" onClick={() => setIsEditing(false)}>
                Cancel
              </button>
              <button className="btn-pri" type="button" onClick={handleSave}>
                Save
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
              >
                {data?.suspendAccount ? "Reactivate" : "Suspend"}
              </button>
              <button className="btn-pri" type="button" onClick={() => setIsEditing(true)}>
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
  );
};

export default UserDetails;
