import {
BrowserRouter,
Routes,
Route
} from"react-router-dom";
import Login from "./pages/Login";
import Add from "./pages/Add";
import Update from "./pages/Update";

function App() {
  return (
    <div className="App">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login/>}/>
            <Route path="/add" element={<Add/>}/>
            <Route path="/update" element={<Update/>}/>                        
          </Routes>
        </BrowserRouter>
    </div>
  );
}

export default App;
