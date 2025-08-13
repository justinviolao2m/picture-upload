import React from 'react';

const Header: React.FC = () => {
  return (
    <div className="bg-white text-dark py-6 shadow-md">
      <div className="container mx-auto flex justify-center sm:justify-between items-center">
        <img src="/images/the-property-advisors-logo.webp" alt="Logo" className="h-10 sm:h-12 ml-4" />
      </div>
    </div>
  );
};

export default Header;