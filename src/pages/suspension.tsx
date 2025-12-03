import { Logo } from "@/components";

export default function App() {
  return (
    <div className="items-center bg-gradient-to-r from-background to-transparent">
      <Logo/>
      <div className="p-10 bg-gradient-to-t from-background to-transparent to-60%">
        <h1 className="text-6xl uppercase font-bold">
          Looking for source
        </h1>
        <p className="uppercase font-bold text-[12px] tracking-widest">
          Visit robin dms and open a invoice pdf
        </p>
      </div>
    </div>
  )
}
