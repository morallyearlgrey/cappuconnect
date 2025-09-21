import React, { useState } from "react";

interface PersonCardProps {
  firstname: string;
  lastname: string;
  linkedin: string;
  industry: string;
  state: string;
  school?: string;
  major?: string;
  experienceyears: string;
  image?: string;
}

const PersonCard: React.FC<PersonCardProps> = ({
  firstname,
  lastname,
  linkedin,
  industry,
  state,
  school,
  major,
  experienceyears,
  image,
}) => {
  const [showMore, setShowMore] = useState(false);

  return (
    <div
      className="flex flex-col w-full bg-white bg-opacity-30 rounded-lg p-4 hover:bg-opacity-40 transition-all cursor-pointer"
      onClick={() => setShowMore(!showMore)}
    >
      {/* Header row */}
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-[#768CA3]">
          {image ? (
            <img
              src={image}
              alt={`${firstname} ${lastname}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white font-bold">
              {firstname[0]}
              {lastname[0]}
            </div>
          )}
        </div>
        <div>
          <h3 className="text-[#25344F] font-semibold text-sm">
            {firstname} {lastname}
          </h3>
          <p className="text-[#25344F] text-xs">{industry}</p>
        </div>
      </div>

      {/* Expanded info */}
      {showMore && (
        <div className="mt-3 text-xs text-[#25344F] space-y-1">
            
          <p>
            <span className="font-semibold">State:</span> {state}
          </p>
          {school && (
            <p>
              <span className="font-semibold">School:</span> {school}
            </p>
          )}
          {major && (
            <p>
              <span className="font-semibold">Major:</span> {major}
            </p>
          )}
          <p>
            <span className="font-semibold">Experience:</span>{" "}
            {experienceyears} years
          </p>
          <a
            href={linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            LinkedIn
          </a>
        </div>
      )}

      {/* Toggle button */}
      <button
        className="mt-2 text-xs text-[var(--dark-blue)] hover:underline self-start"
        onClick={(e) => {
          e.stopPropagation();
          setShowMore(!showMore);
        }}
      >
        {showMore ? "Show Less ▲" : "Show More ▼"}
      </button>
    </div>
  );
};

export default PersonCard;
