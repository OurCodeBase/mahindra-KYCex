import { Logo } from "../components";

export default function App() {
  return (
    <div className="p-8">
      <Logo/>
      <div className="text-center py-12 text-shadow-lg/35">
        <h1 className="text-2xl font-bold text-lime-400">
          Waiting for Reload
        </h1>
        <p className="text-lime-100">
          Goto robin and reload invoice section...
        </p>
      </div>
    </div>
  )
}
