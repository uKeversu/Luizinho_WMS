// src\App.jsx

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";

import Recebimentos from './pages/Recebimentos';
import Dashboard from "./pages/Dashboard";
import Conferencia from "./pages/Conferencia";
import CadastrarFuncionario from "./pages/CadastrarFuncionario";
import Alertas from "./pages/Alertas";
import Rastreio from "./pages/Rastreio";
import AtualizarCean from "./pages/AtualizarCean";
import ConsultaGeral from "./pages/ConsultaGeral";
import PainelReimpressao from "./pages/PainelReimpressao";
import Produtividade from "./pages/Produtividade";
import ConsultaGuarda from "./pages/ConsultaGuarda";
import HistoricoLogs from "./pages/HistoricoLogs";
import ReimprimirSenhas from "./pages/ReimprimirSenhas";
import NotasEmTransito from "./pages/NotasEmTransito";
import PainelGerencial from './pages/PainelGerencial';
import RetiradaParaVenda from "./pages/RetiradaParaVenda";
import Temporadas from "./pages/Temporadas";
import Loja from "./pages/Loja";
import PainelGames from "./pages/PainelGames";
import PerfilJogador from "./pages/PerfilJogador";
import Tarefas from "./pages/Tarefas";

import AlertaAutorizacaoManual from "./components/autorizacao/AlertaAutorizacaoManual";

import './index.css';

function App() {

  const token = localStorage.getItem("nfe_token");

  const user = localStorage.getItem("user_info");

  const userInfo = user
    ? JSON.parse(user)
    : null;

  return (
    <ThemeProvider>

      <Router>

        <Routes>

          <Route path="/" element={<Dashboard />} />

          <Route
            path="/Recebimento"
            element={<Recebimentos />}
          />

          <Route
            path="/Conferencia"
            element={<Conferencia />}
          />

          <Route
            path="/CadastrarFuncionario"
            element={<CadastrarFuncionario />}
          />

          <Route
            path="/Alertas"
            element={<Alertas />}
          />

          <Route
            path="/transito"
            element={<Dashboard tipo="transito" />}
          />

          <Route
            path="/recebidas"
            element={<Dashboard tipo="recebidas" />}
          />

          <Route
            path="/conferidas"
            element={<Dashboard tipo="conferidas" />}
          />

          <Route
            path="/Rastreio/:codigo"
            element={<Rastreio />}
          />

          <Route
            path="/AtualizarCean"
            element={<AtualizarCean />}
          />

          <Route
            path="/ConsultaGeral"
            element={<ConsultaGeral />}
          />

          <Route
            path="/PainelReimpressao"
            element={<PainelReimpressao />}
          />

          <Route
            path="/Produtividade"
            element={<Produtividade />}
          />

          <Route
            path="/ConsultaGuarda"
            element={<ConsultaGuarda />}
          />

          <Route
            path="/HistoricoLogs/:notaId"
            element={<HistoricoLogs />}
          />

          <Route
            path="/ReimprimirSenhas"
            element={<ReimprimirSenhas />}
          />

          <Route
            path="/NotasEmTransito"
            element={<NotasEmTransito />}
          />

          <Route
            path="/PainelGerencial"
            element={<PainelGerencial />}
          />

          <Route
            path="/RetiradaParaVenda"
            element={<RetiradaParaVenda />}
          />

          <Route
            path="/Temporadas"
            element={<Temporadas />}
          />

          <Route
            path="/Loja"
            element={<Loja />}
          />

          <Route
            path="/PainelGames"
            element={<PainelGames />}
          />

          <Route
            path="/games/perfil/:codigo"
            element={<PerfilJogador />}
          />

          <Route
            path="/Tarefas"
            element={<Tarefas />}
          />

        </Routes>

        <AlertaAutorizacaoManual
          userInfo={userInfo}
          token={token}
        />

      </Router>

    </ThemeProvider>
  );
}

export default App;