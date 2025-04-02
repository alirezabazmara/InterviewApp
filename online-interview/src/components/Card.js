import React from "react";

const Card = ({ children }) => {
  return (
    <div style={{
      border: "1px solid #ddd",
      borderRadius: "10px",
      padding: "20px",
      boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
      backgroundColor: "#fff",
      margin: "10px 0"
    }}>
      {children}
    </div>
  );
};

export const CardContent = ({ children }) => {
  return <div style={{ marginTop: "10px" }}>{children}</div>;
};

export default Card;
