import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Recebimentos from './pages/Recebimentos';
import Dashboard from "./pages/Dashboard";
import Conferencia from "./pages/Conferencia";
import CadastrarFuncionario from "./pages/CadastrarFuncionario";
import Alertas from "./pages/Alertas"
import Rastreio from "./pages/Rastreio";

import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Recebimentos />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/Conferencia" element={<Conferencia />} />
        <Route path="/CadastrarFuncionario" element={<CadastrarFuncionario />} />
        <Route path="/Alertas" element={<Alertas />} />
        <Route path="/transito" element={<Dashboard tipo="transito" />} />
        <Route path="/recebidas" element={<Dashboard tipo="recebidas" />} />
        <Route path="/conferidas" element={<Dashboard tipo="conferidas" />} />
        <Route path="/rastreio/:codigo" element={<Rastreio />} />
      </Routes>
    </Router>
  );
}
export default App;