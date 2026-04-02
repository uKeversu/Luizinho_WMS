import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Recebimentos from './pages/Recebimentos';
import Dashboard from "./pages/Dashboard";
import Conferencia from "./pages/Conferencia";
import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Recebimentos />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/Conferencia" element={<Conferencia />} />
        <Route path="/transito" element={<Dashboard tipo="transito" />} />
        <Route path="/recebidas" element={<Dashboard tipo="recebidas" />} />
        <Route path="/conferidas" element={<Dashboard tipo="conferidas" />} />
      </Routes>
    </Router>
  );
}
export default App;