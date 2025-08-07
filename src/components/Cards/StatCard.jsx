const StatCard = ({ icon, title, value, description }) => {
  return (
    <div className="bg-[#D4F4F4] p-[16px] rounded-[16px] max-w-[320px] w-full">
      <span className="bg-[#352AA4] w-[68px] h-[68px] rounded-[12px] flex items-center justify-center">
        <img src={icon} alt={`${title} icon`} />
      </span>
      <p className="text-[24px] text-[#15C8C9] mt-[12px]">{title}</p>
      <p className="text-[30px] text-[#352AA4] font-semibold">{value}</p>
      <p className="text-[14px] text-[#352AA4] opacity-40">{description}</p>
    </div>
  );
};

export default StatCard;
