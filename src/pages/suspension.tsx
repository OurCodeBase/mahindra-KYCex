import { Logo } from "../components";

export default function App() {
  return (
    <div className="py-12 flex flex-col justify-center items-center">
      <Logo/>
      <div className="p-10 backdrop-brightness-70 backdrop-contrast-125 border-1 border-stone-400 rounded-md text-shadow-stone-800 text-shadow-lg">
        <h1 className="text-2xl font-bold text-lime-400">
          Waiting for Request
        </h1>
        <p className="text-lime-100">
          Visit robin dms and open a invoice pdf...
        </p>
      </div>
    </div>
  )
}
