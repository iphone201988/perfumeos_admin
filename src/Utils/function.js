export const calculateAge = (dob) => {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const month = today.getMonth() - birthDate.getMonth();

  // If the birthdate hasn't occurred yet this year, subtract one year from the age
  if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

export const rgbToHex = (color) => {
  // already hex
  if (color?.startsWith("#")) return color;

  // matches "rgb(155, 229, 237)" or "rgba(155, 229, 237, 1)"
  const result = color?.match(/\d+/g);
  if (!result || result.length < 3) return "#000000";

  return (
    "#" +
    result
      .slice(0, 3)            // r, g, b only
      .map((n) => Number(n).toString(16).padStart(2, "0"))
      .join("")
  );
};
export const hexToRgb = (hex) => {
  if (!hex || typeof hex !== "string") return "rgb(0, 0, 0)";

  // Remove leading #
  hex = hex.replace("#", "");

  // Short hex (#abc → #aabbcc)
  if (hex.length === 3) {
    hex = hex.split("").map((char) => char + char).join("");
  }

  if (hex.length !== 6) return "rgb(0, 0, 0)";

  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  return `rgb(${r}, ${g}, ${b})`;
};
