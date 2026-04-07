import { useState } from "react";
import {
  Container,
  Card,
  Typography,
  TextField,
  Button
} from "@mui/material";

function LoginFuncionario({ onLogin }) {

  const [codigo, setCodigo] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState("");

  const API = "http://192.168.1.185:8077";

  const fazerLogin = async () => {
    if (!codigo.trim()) {
      setResultado({ tipo: "warning", msg: "Digite o código" });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API}/api/funcionario/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ codigo })
      });

      if (!res.ok) throw new Error();

      const data = await res.json();

      onLogin(data);

      setResultado({ tipo: "success", msg: "Login realizado" });

    } catch (err) {
      setResultado({ tipo: "error", msg: "Erro de conexão ou login" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 10 }}>
      <Card sx={{ p: 3, boxShadow: '0vh 0.1vh 0.5vh #000000', bgcolor: '#f3f3f3' }}>
        <Typography variant="h5">
          Login do Funcionário
        </Typography>

        <TextField
          fullWidth
          label="Código"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          sx={{
            mt: 2, bgcolor: '#FFFFFF', '& .MuiOutlinedInput-root': {
              '&:hover fieldset': {
                borderColor: '#007bff',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#007bff',
              }
            }
          }}
          onKeyDown={(e) => e.key === "Enter" && fazerLogin()}
        />

        <Button
          fullWidth
          variant="contained"
          sx={{ mt: 2, bgcolor: '#007bff' }}
          onClick={fazerLogin}
          disabled={loading}
        >
          {loading ? "Entrando..." : "Entrar"}
        </Button>
      </Card>
    </Container>
  );
}

export default LoginFuncionario;