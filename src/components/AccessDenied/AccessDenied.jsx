import React from "react";
import { Link } from "react-router-dom";

function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full text-center text-[#378CE7] font-mono">
      {/* Navbar */}
      <div className="flex justify-between w-full bg-[#378CE7] p-4">
        <Link to="/login" className="text-white underline wavy mx-2 transition-all duration-300">
          Login
        </Link>
        <Link to="/login" className="text-white underline wavy mx-2 transition-all duration-300">
          Logout
        </Link>
      </div>
      {/* End Navbar */}
      <div className="flex flex-col items-center justify-center h-full z-10">
        <h1 className="text-4xl font-bold mt-4">403 Forbidden</h1>
        <p className="my-2 px-4 text-lg text-[#124076] leading-relaxed tracking-wide shadow-lg">
          You do not have permission to access this page.
        </p>
        <p className="my-2 px-4 text-lg text-[#124076] leading-relaxed tracking-wide shadow-lg">
          Please <Link to="/login" className="text-blue-500 underline">login</Link> with appropriate credentials or contact the administrator for access.
        </p>
      </div>
      <div className="absolute top-0 left-0 w-full h-full bg-cover bg-center opacity-40 z-0" style={{ backgroundImage: "url('../Images/world_map.jpg')" }}></div>
    </div>
  );
}

export default AccessDenied;
