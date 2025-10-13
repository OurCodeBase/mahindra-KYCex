// import { useToken } from "./hooks";
import { Suspension, Home, Authentication } from "./pages";

function App() {
  // const { token } = useToken();
  return (
    <div className="banner w-md max-w-md">
      {false ? (
        <Suspension/>
      ) : (
        <Authentication>
          <h1>Hello World!</h1>
        </Authentication>
      )}
    </div>
  )
}

export default App
