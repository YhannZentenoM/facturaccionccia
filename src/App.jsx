import { AuthContextProvider } from "./context/AuthContext";
import RouterApp from "./routers/router";

function App() {
  return (
    <AuthContextProvider>
      <RouterApp />
    </AuthContextProvider>
  );
}

export default App;
