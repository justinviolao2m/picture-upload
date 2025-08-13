import { FC } from "react";
import FileUpload from "./components/FileUpload";

interface PageProps {
  searchParams: {
    leadid?: string;
  };
}


const Page: FC<PageProps> = (props) => {
  const leadId = props.searchParams.leadid || null;
  return (
    <div 
      className="relative  flex items-center justify-center min-h-[calc(100vh-156px)] md:min-h-[calc(100vh-164px)] bg-cover bg-center"
      style={{ backgroundImage: "url('/images/bg.webp')" }}
    >
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div className="relative z-10">
      {leadId ? (
        <FileUpload leadId={leadId} />
      ) : (
        <p className="text-white text-xl">ID is missing</p>
      )}
      </div>
    </div>
  );
}

export default Page;
