import React from "react";

const Input = ({ type, placeholder, value, onChange }) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      style={{
        width: "100%",
        padding: "10px",
        margin: "5px 0",
        border: "1px solid #ddd",
        borderRadius: "5px"
      }}
    />
  );
};

export default Input;
