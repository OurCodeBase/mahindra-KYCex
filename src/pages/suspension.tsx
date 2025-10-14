import { Logo } from "../components";

export default function App() {
  return (
    <div className="py-12">
      <Logo/>
      <div className="text-center py-8 backdrop-brightness-70 backdrop-contrast-125">
        <h1 className="text-2xl font-bold text-lime-400 text-shadow-lg">
          Waiting for Reload
        </h1>
        <p className="text-lime-100 text-shadow-lg">
          Goto robin and reload invoice chapter...
        </p>
      </div>
    </div>
  )
}
