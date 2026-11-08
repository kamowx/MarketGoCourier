import { BrowserRouter, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./App.css";

import Deliverysignin from "./screens/deliverysignin";
import Deliveryinfo from "./screens/deliveryinfo";
import Mybalance from "./screens/mybalance";
import Deliverycheck from "./screens/deliverycheck";
import Deliveryprofile from "./screens/deliverprofile";
import Homeorder from "./screens/homeorder";
import Deliveryorders from "./screens/deliveryorders";
import Orderstart from "./screens/orderstart";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Deliverysignin />} />
        <Route path="/deliverysignin" element={<Deliverysignin />} />
        <Route path="/deliveryinfo" element={<Deliveryinfo />} />
        <Route path="/mybalance" element={<Mybalance />} />
        <Route path="/deliverycheck" element={<Deliverycheck />} />
        <Route path="/deliveryprofile" element={<Deliveryprofile />} />
        <Route path="/homeorder" element={<Homeorder />} />
        <Route path="/deliveryorders" element={<Deliveryorders />} />
        <Route path="/orderstart/:id" element={<Orderstart />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
