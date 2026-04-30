import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import Recebimentos from './pages/Recebimentos';
import Dashboard from "./pages/Dashboard";
import Conferencia from "./pages/Conferencia";
import CadastrarFuncionario from "./pages/CadastrarFuncionario";
import Alertas from "./pages/Alertas"
import Rastreio from "./pages/Rastreio";
import AtualizarCean from "./pages/AtualizarCean"
import ConsultaGeral from "./pages/ConsultaGeral"

import './index.css';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Recebimentos />} />
          <Route path="/Dashboard" element={<Dashboard />} />
          <Route path="/Conferencia" element={<Conferencia />} />
          <Route path="/CadastrarFuncionario" element={<CadastrarFuncionario />} />
          <Route path="/Alertas" element={<Alertas />} />
          <Route path="/transito" element={<Dashboard tipo="transito" />} />
          <Route path="/recebidas" element={<Dashboard tipo="recebidas" />} />
          <Route path="/conferidas" element={<Dashboard tipo="conferidas" />} />
          <Route path="/Rastreio/:codigo" element={<Rastreio />} />
          <Route path="/AtualizarCean" element={<AtualizarCean />} />
          <Route path="/ConsultaGeral" element={<ConsultaGeral />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}
export default App;