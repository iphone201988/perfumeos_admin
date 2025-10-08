import React, { useState } from "react";
import addpic_icon from "../../assets/icons/addpic-icon.svg";
import { useNavigate, useParams } from "react-router-dom";
import { useDeletePerfumeMutation, useGetPerfumeByIdQuery } from "../../api";
import ConfirmationModal from "../Modal/ConfirmationModal";
import Loader from "../Loader/Loader";

const PerfumDetails = () => {
  const params = useParams();
  const navigate = useNavigate();
  const { data: perfumeData, isLoading, error } = useGetPerfumeByIdQuery(params.id);
  const [deletePerfume] = useDeletePerfumeMutation();
  const [isDeleted, setIsDeleted] = useState(false);

  if (isLoading) {
    return <Loader message="Loading Perfume Details" />;
  };
  if (error || !perfumeData) return <div>Error loading perfume details.</div>;
  const perfume = perfumeData.data;
  // Optional: handle 'navigate' logic only after params and data loaded (to avoid issues)
  if (params?.id === "24") {
    navigate("/perfumes");
    return null;
  }
  const onEdit = () => {
    navigate(`/perfumes/${params.id}/edit`);
  };
  const handleDelete = async () => {
    await deletePerfume(params.id);
    setIsDeleted(false);
    navigate("/perfumes");
  };
  return (
    <div>
      <div className="bg-[#E1F8F8] rounded-[30px] py-[24px] px-[32px] max-lg:p-[16px]">
        {/* <h6 className="text-[20px] font-semibold text-[#352AA4]">
          Perfume details
        </h6> */}

        {/* Main Info */}
        <div className="flex gap-[32px] items-start max-md:flex-wrap mt-[16px]">
          <div className="flex justify-center items-center border bg-white border-[#EFEFEF] rounded-2xl p-[8px] h-[170px] w-[230px]">
            <img
              src={
                perfume.image
                  ? perfume.image.startsWith("http")
                    ? perfume.image
                    : `${import.meta.env.VITE_BASE_URL}${perfume.image}`
                  : addpic_icon
              }
              alt={perfume.name}
              className="object-contain max-h-[144px]"
            />

          </div>
          <div className="flex flex-col gap-[12px]">
            <h2 className="text-[24px] font-semibold">{perfume.name}</h2>
            <div className="flex gap-4 items-center">
              {/* <img
                src={perfume.brandImage}
                alt={perfume.brand}
                className="h-8 w-8 rounded-full object-cover"
              /> */}
              <span className="font-medium">{perfume.brand}</span>
              <span className="bg-[#F7F7F7] text-gray-700 px-[12px] rounded-lg font-medium ml-3">
                {perfume.year || "—"}
              </span>
            </div>
            {/* <div className="text-[#888] text-sm">
              <span>Rating: </span>
              <span className="font-bold text-[#352AA4]">
                {perfume.rating?.score} / 5
              </span>
              {` (${perfume.rating?.votes} votes)`}
            </div> */}
            <div>
              <span className="text-[#7C7C7C] text-sm">Intended for: </span>
              <span className="capitalize">
                {(perfume.intendedFor || []).join(", ")}
              </span>
            </div>
          </div>
        </div>

        {/* Fragrance Pyramid */}
        <div className="mt-[24px]">
          <h4 className="text-[20px] font-medium mb-2">Fragrance Pyramid</h4>
          <div className="">
            {["top", "middle", "base", "note"]?.map((layer) => (
              <div key={layer} className="py-[8px] border-b border-[#fff]">
                <div className="text-[#352AA4] text-[16px] font-semibold capitalize mb-1 ml-[12px]">{layer} notes</div>
                <div className="flex flex-wrap gap-4">
                  {(perfume.notes?.[layer] || []).map((note) => (
                    <div key={note._id || note.noteId} className="flex flex-col items-center w-[80px]">
                      <img src={note.image
                      ? note.image.startsWith('blob:') || note.image.startsWith('http')
                        ? note.image
                        : `${import.meta.env.VITE_BASE_URL}${note.image}`
                      : user_icon // fallback image
                  } alt={note.name} className="rounded-md w-12 h-12 object-cover mb-1" />
                      <span className="text-[14px] text-center">{note.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Accords */}
        <div className="mt-[24px]">
          <h4 className="text-[20px] font-medium">Main Accords</h4>
          <div className="flex flex-col gap-2">
            {perfume.mainAccords?.map((accord) => (
              <div key={accord._id} className="w-full mb-1">
                <span className="text-[#7C7C7C] text-[14px]">{accord.name}</span>
                <div
                  style={{
                    width: accord.width,
                    backgroundColor: accord.backgroundColor,
                    height: "16px",
                    borderRadius: "6px",
                    marginTop: "2px",
                  }}
                  title={`${accord.name}: ${accord.width}`}
                ></div>
              </div>
            ))}
          </div>
        </div>

        {/* Season & Occasions */}
        <div className="mt-[24px] gap-[24px] flex flex-col">
          <div>
            <h4 className="text-[20px] font-medium">Season</h4>
            <ul className=" flex flex-wrap mt-1 max-md:gap-[6px]">
              {perfume.seasons?.map((season) => (
                <li className="px-[20px] border-r border-[#352AA4] max-md:w-[46%] max-md:px-[12px]" key={season._id}>
                  {season.name.charAt(0).toUpperCase() + season.name.slice(1)}:{" "}
                  {Math.round(parseFloat(season.width))}%
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-[20px] font-medium">Occasion</h4>
            <ul className=" flex flex-wrap mt-1 max-md:gap-[6px]">
              {perfume.occasions?.map((occ) => (
                <li className="px-[20px] border-r border-[#352AA4] max-md:w-[46%] max-md:px-[12px]" key={occ._id}>
                  {occ.name.charAt(0).toUpperCase() + occ.name.slice(1)}:{" "}
                  {Math.round(parseFloat(occ.width))}%
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Perfumer */}
        <div className="mt-[24px]">
          <h4 className="text-[20px] font-medium">Perfumer</h4>
          <div className="flex gap-4 mt-1 flex-wrap">
            {(perfume.perfumers || [])?.map((p) => (
              <div key={p._id} className="flex flex-col items-center w-[120px] ">
                <img
                  src={
                    p.image
                      ? p.image.startsWith('blob:') || p.image.startsWith('http')
                        ? p.image
                        : `${import.meta.env.VITE_BASE_URL}${p.image}`
                      : user_icon // fallback image
                  }
                  alt={p.name}
                  className="rounded-full h-[60px] w-[60px] mb-1"
                />
                <span className="text-center">{p.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="mt-[24px]">
          <h4 className="text-[20px] font-medium">Description</h4>
          <p className="text-[#555] text-[15px]">{perfume.description}</p>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-[16px] mt-[24px] flex-wrap">
        <button
          onClick={() => navigate('/perfumes')}
          className={`
    bg-gray-100 text-[#352AA4] text-sm border border-gray-200 
    rounded-full px-4 py-2 transition-all duration-300 ease-in-out
    hover:bg-gray-400 hover:border-[#352AA4] hover:text-[#1b1555]
    flex items-center gap-2
    ${isLoading
              ? 'opacity-60 cursor-not-allowed'
              : 'cursor-pointer hover:shadow-sm'
            }
  `}
          type="button"
          disabled={isLoading}
        >
          <span>←</span>
          Back
        </button>
        <button onClick={() => setIsDeleted(true)} className="btn-sec">Remove Perfume</button>
        <button onClick={onEdit} className="btn-pri">Edit</button>
      </div>
      {isDeleted && <ConfirmationModal isOpen={isDeleted} onClose={() => setIsDeleted(false)} onConfirm={handleDelete} message="Are you sure you want to delete this perfume?" />}
    </div>
  );
};

export default PerfumDetails;
