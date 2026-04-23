import {
BrowserRouter,
Routes,
Route
} from"react-router-dom";
import Login from "./pages/Login";
import Homepage from "./pages/Homepage";
import Create from "./pages/Create";
import Cpage from "./pages/Cpage";
import Upage from "./pages/Upage";

function App() {
  return (
    <div className="App">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login/>}/>
            <Route path="/homepage" element={<Homepage/>}/>   
            <Route path="/create" element={<Create/>}/>
            <Route path="/cpage" element={<Cpage/>}/>
            <Route path="/upage" element={<Upage/>}/>
          </Routes>
        </BrowserRouter>
    </div>
  );
}

export default App;
