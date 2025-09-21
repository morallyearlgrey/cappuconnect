import React from 'react';

interface PersonCardProps {
  name: string;
  title: string;
  image: string;
}

const PersonCard: React.FC<PersonCardProps> = ({ name, title, image }) => {
  return (
    <div className="flex items-center space-x-4 bg-white bg-opacity-30 rounded-lg p-3 hover:bg-opacity-40 transition-all cursor-pointer">
      <div className="w-12 h-12 rounded-full overflow-hidden bg-[#768CA3]">
        <img 
          src={image} 
          alt={name} 
          className="w-full h-full object-cover"
        />
      </div>
      <div>
        <h3 className="text-[#25344F] font-semibold text-sm">{name}</h3>
        <p className="text-[#25344F] text-xs">{title}</p>
      </div>
    </div>
  );
};

export default PersonCard;
