import React from "react";

interface SquareImageProps {
  imageUrl: string;
  size?: number;
}

const SquareImage: React.FC<SquareImageProps> = ({ imageUrl, size = 150 }) => {
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        overflow: "hidden",
        borderRadius: "8px",
      }}
    >
      <img
        src={imageUrl}
        alt="Character"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
    </div>
  );
};

export default SquareImage;
