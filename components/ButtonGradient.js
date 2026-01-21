"use client";

const ButtonGradient = ({ title = "Gradient Button", onClick = () => {} }) => {
  return (
    <button className="btn btn-primary" onClick={onClick}>
      {title}
    </button>
  );
};

export default ButtonGradient;
