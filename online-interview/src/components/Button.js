import React from "react";

const Button = ({ onClick, children }) => {
  return (
    <button
      onClick={onClick}
      style={{
        backgroundColor: "#007BFF",
        color: "white",
        padding: "10px 15px",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        marginTop: "10px"
      }}
    >
      {children}
    </button>
  );
};

export default Button;
