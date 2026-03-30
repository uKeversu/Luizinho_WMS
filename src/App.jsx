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
        <Route path="/conferencia/:id" element={<Conferencia />} />
      </Routes>
    </Router>
  );
}
export default App;