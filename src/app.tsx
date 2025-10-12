import { useToken } from "./hooks";
import { Await } from "./pages";

function App() {
  const { token } = useToken();
  if (token == null) return <Await/>
  return (
    <div>
      <h1>{JSON.stringify(token)}</h1>
    </div>
  )
}

export default App
