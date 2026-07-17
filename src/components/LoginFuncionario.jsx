import { useState, useEffect, useContext } from "react";
import {
  Container,
  Card,
  Typography,
  TextField,
  Button,
  Snackbar,
  Alert
} from "@mui/material";

import { ThemeContext } from "../context/ThemeContext";
import '../style/App.css';

function LoginFuncionario({ onLogin }) {

  const [codigo, setCodigo] = useState("");
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    severity: "success",
    message: ""
  });

  const API = "http://192.168.1.185:8077";

  const fazerLogin = async () => {

    if (!codigo.trim()) {
      setSnackbar({
        open: true,
        severity: "warning",
        message: "Digite o código"
      });
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

      // Usuário não encontrado
      if (res.status === 404) {
        setSnackbar({
          open: true,
          severity: "error",
          message: "Usuário não encontrado"
        });

        return;
      }

      if (!res.ok) throw new Error();

      const data = await res.json();

      onLogin(data);

      setSnackbar({
        open: true,
        severity: "success",
        message: "Login realizado"
      });

    } catch (err) {

      setSnackbar({
        open: true,
        severity: "error",
        message: "Usuário não encontrado"
      });

    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 10 }}>
      <Card sx={{ p: 3, boxShadow: '0vh 0.1vh 0.5vh #000000', bgcolor: 'background.card' }}>
        <Typography variant="h5">
          Login do Funcionário
        </Typography>

        <TextField
          fullWidth
          label="Código"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          sx={{
            mt: 2, bgcolor: 'background.card', '& .MuiOutlinedInput-root': {
              '&:hover fieldset': {
                borderColor: '#007bff',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#007bff',
              }
            }
          }}
          onKeyDown={(e) => e.key === "Enter" && fazerLogin()}
          autoComplete="off"
          inputProps={{
            spellCheck: false,
            autoCorrect: "off",
            autoCapitalize: "off",
          }}
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

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{
            width: "100%",
            color: "white"
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

    </Container>
  );
}

export default LoginFuncionario;