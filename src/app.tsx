// import { useToken } from "./hooks";
import { Suspension, Home } from "./pages";

function App() {
  // const { token } = useToken();
  return (
    <div>
      {false ? (
        <Suspension/>
      ) : (
        <Home/>
      )}
    </div>
  )
}

export default App
