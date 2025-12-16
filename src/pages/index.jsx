import { useState } from "react";
const Home = () => {
  return (
    <div className="min-h-screen w-auto bg-gray-100 flex items-center justify-center">
      <div className="h-150 w-100 bg-white py-5 px-8 rounded-2xl mt-15">
        <div className="object-cover  w-15">
          <img src="./main.png"></img>
        </div>
        <h1 className="text-4xl font-extrabold mt-2.5 ">Join Us! 😎</h1>
        <p className="text-gray-400 w-100 mt-1">
          Please provide all current information accurately.
        </p>
        <h1 className="text-black mt-5 text-[13px]">First name</h1>
        <div className="space-y-5 mt-2 ">
          <input
            className="text border rounded-xl w-full py-1 border-gray-400 hover:to-blue-500"
            placeholder="Placeholder"
            onChange={(e) => setData({ ...Data, Firstname: e.target.value })}
          ></input>
          <p className="text-black  text-[13px]">Last name</p>

          <input
            className="text border rounded-xl w-full py-1 border-gray-400 hover:to-blue-500"
            placeholder="Placeholder"
            onChange={(e) => setData({ ...Data, Firstname: e.target.value })}
          ></input>
        </div>
      </div>
    </div>
  );
};
export default Home;
