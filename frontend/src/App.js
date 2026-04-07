import {
BrowserRouter,
Routes,
Route
} from"react-router-dom";
import User from "./pages/User";
import Homepage from "./pages/Homepage";
import Create from "./pages/Create";
import Posts from "./pages/Posts";
import Boards from "./pages/Boards";
import Groups from "./pages/Groups";
import Cpage from "./pages/Cpage";
import Upage from "./pages/Upage";

function App() {
  return (
    <div className="App">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<User/>}/>
            <Route path="/homepage" element={<Homepage/>}/>   
            <Route path="/create" element={<Create/>}/>
            <Route path="/posts" element={<Posts/>}/>
            <Route path="/boards" element={<Boards/>}/>
            <Route path="/groups" element={<Groups/>}/>
            <Route path="/cpage" element={<Cpage/>}/>
            <Route path="/upage" element={<Upage/>}/>
          </Routes>
        </BrowserRouter>
    </div>
  );
}

export default App;
