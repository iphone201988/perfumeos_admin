import React, { useState } from "react";
import addpic_icon from "../../assets/icons/addpic-icon.svg";
import { useNavigate, useParams } from "react-router-dom";
import { useGetPerfumeByIdQuery } from "../../api";

const PerfumDetails = () => {
  const params = useParams();
  const navigate = useNavigate();
  const { data: perfumeData, isLoading, error } = useGetPerfumeByIdQuery(params.id);

  if (isLoading) return <div>Loading...</div>;
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
  return (
    <div>
      <div className="bg-[#E1F8F8] rounded-[30px] py-[24px] px-[32px] max-lg:p-[16px]">
        <h6 className="text-[20px] font-semibold text-[#352AA4]">
          Perfume details
        </h6>

        {/* Main Info */}
        <div className="flex gap-[32px] items-start max-md:flex-wrap mt-[16px]">
          <div className="flex justify-center items-center border bg-white border-[#EFEFEF] rounded-2xl p-[8px] h-[170px] w-[130px]">
            <img
              src={perfume.image}
              alt={perfume.name}
              className="object-contain max-h-[144px]"
            />
          </div>
          <div className="flex flex-col gap-[12px]">
            <h2 className="text-[24px] font-semibold">{perfume.name}</h2>
            <div className="flex gap-4 items-center">
              <img
                src={perfume.brandImage}
                alt={perfume.brand}
                className="h-8 w-8 rounded-full object-cover"
              />
              <span className="font-medium">{perfume.brand}</span>
              <span className="bg-[#F7F7F7] text-gray-700 px-[12px] rounded-lg font-medium ml-3">
                {perfume.year || "—"}
              </span>
            </div>
            <div className="text-[#888] text-sm">
              <span>Rating: </span>
              <span className="font-bold text-[#352AA4]">
                {perfume.rating?.score} / 5
              </span>
              {` (${perfume.rating?.votes} votes)`}
            </div>
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
          {["top", "middle", "base", "note"]?.map((layer) => (
            <div key={layer} className="mb-[16px]">
              <div className="text-[#7C7C7C] text-[16px] font-semibold capitalize mb-1">{layer} notes</div>
              <div className="flex flex-wrap gap-4">
                {(perfume.notes?.[layer] || []).map((note) => (
                  <div key={note._id || note.noteId} className="flex flex-col items-center w-[80px]">
                    <img src={note.image} alt={note.name} className="rounded-md w-12 h-12 object-cover mb-1" />
                    <span className="text-[14px] text-center">{note.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
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
        <div className="mt-[24px] gap-2 flex flex-wrap">
          <div>
            <h4 className="text-[20px] font-medium">Season</h4>
            <ul>
              {perfume.seasons?.map((season) => (
                <li key={season._id}>
                  {season.name.charAt(0).toUpperCase() + season.name.slice(1)}:{" "}
                  {Math.round(parseFloat(season.width))}%
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-[20px] font-medium">Occasion</h4>
            <ul>
              {perfume.occasions?.map((occ) => (
                <li key={occ._id}>
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
          <div className="flex gap-4">
            {(perfume.perfumers || [])?.map((p) => (
              <div key={p._id} className="flex flex-col items-center w-[120px]">
                <img
                  src={p.image}
                  alt={p.name}
                  className="rounded-full h-[60px] w-[60px] mb-1"
                />
                <span>{p.name}</span>
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
        <button className="btn-sec">Remove Perfume</button>
        <button onClick={onEdit} className="btn-pri">Edit</button>
      </div>
    </div>
  );
};

export default PerfumDetails;
