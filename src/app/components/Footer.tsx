import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="text-blue-500 py-4 sm:py-6 px-0 sm:px-6">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
            <div className="text-xs md:text-sm text-center md:text-left">
              Copyright &copy; 2024 The Property Advisors
            </div>
            <div className="flex mt-1 md:mt-0 text-xs md:text-sm">
                <a href="#" className="mx-2 hidden md:block">Contact Info:</a>
                <a href="tel:561-556-6098" className="hover:text-blue-800 mx-2">561-556-6098</a>
                <a href="mailto:Info@ThePropertyAdvisors.com" className="hover:text-blue-800 mx-2">Info@ThePropertyAdvisors.com</a>
            </div>
        </div>
    </footer>
  );
};

export default Footer;