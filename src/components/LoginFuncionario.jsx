// src/components/LoginFuncionario.jsx

import { useState } from "react";
import {
  Container,
  Card,
  Typography,
  TextField,
  Button,
  Snackbar,
  Alert
} from "@mui/material";

import "../style/App.css";

function LoginFuncionario({ onLogin }) {

  const [codigo, setCodigo] = useState("");
  const [pin, setPin] = useState("");
  const [pinNecessario, setPinNecessario] = useState(false);
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
        message: "Digite um código de funcionário!"
      });

      return;
    }

    // Se o funcionário possui PIN, exige que ele seja informado
    if (pinNecessario && !pin.trim()) {
      setSnackbar({
        open: true,
        severity: "warning",
        message: "Digite o PIN!"
      });

      return;
    }

    setLoading(true);

    try {

      const body = {
        codigo: codigo.trim()
      };

      // Só envia o PIN quando o funcionário possui PIN
      if (pinNecessario) {
        body.pin = pin;
      }

      const res = await fetch(`${API}/api/login/sigel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401 && !data.pin_necessario) {

        setSnackbar({
          open: true,
          severity: "error",
          message: data.erro || "Usuário não encontrado"
        });

        setPin("");
        return;
      }

      if (data.pin_necessario === true) {

        setPinNecessario(true);

        setSnackbar({
          open: true,
          severity: "info",
          message: "Digite o PIN do funcionário"
        });

        return;
      }

      if (res.status === 401) {

        setSnackbar({
          open: true,
          severity: "error",
          message: data.erro || "PIN incorreto"
        });

        setPin("");
        return;
      }

      if (!res.ok) {
        throw new Error();
      }

      onLogin(data);

      setSnackbar({
        open: true,
        severity: "success",
        message: "Login realizado"
      });

      setTimeout(() => {
        window.location.reload();
      }, 25);

    } catch (err) {

      setSnackbar({
        open: true,
        severity: "error",
        message: "Não foi possível realizar o login"
      });

    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 10 }}>

      <Card
        sx={{
          p: 3,
          boxShadow: "0vh 0.1vh 0.5vh #000000",
          bgcolor: "background.card"
        }}
      >

        <Typography variant="h5">
          Login do Funcionário
        </Typography>

        {/* CÓDIGO DO FUNCIONÁRIO */}

        <TextField
          fullWidth
          label="Código"
          value={codigo}
          onChange={(e) => {
            setCodigo(e.target.value);

            // Se mudar o código, volta para a etapa inicial
            setPinNecessario(false);
            setPin("");
          }}
          sx={{
            mt: 2,
            bgcolor: "background.card",
            "& .MuiOutlinedInput-root": {
              "&:hover fieldset": {
                borderColor: "#007bff",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#007bff",
              }
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              fazerLogin();
            }
          }}
          autoComplete="off"
          autoFocus
          inputProps={{
            spellCheck: false,
            autoCorrect: "off",
            autoCapitalize: "off",
          }}
        />

        {/* Só aparece quando o backend informa que o funcionário possui PIN. */}

        {pinNecessario && (
          <TextField
            fullWidth
            label="PIN"
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            sx={{
              mt: 2,
              bgcolor: "background.card",
              "& .MuiOutlinedInput-root": {
                "&:hover fieldset": {
                  borderColor: "#007bff",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#007bff",
                }
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                fazerLogin();
              }
            }}
            autoComplete="off"
            autoFocus
            inputProps={{
              spellCheck: false,
              autoCorrect: "off",
              autoCapitalize: "off",
              inputMode: "numeric"
            }}
          />
        )}

        <Button
          fullWidth
          variant="contained"
          sx={{
            mt: 2,
            bgcolor: "#007bff"
          }}
          onClick={fazerLogin}
          disabled={loading}
        >
          {loading ? "Entrando..." : "Entrar"}
        </Button>

      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() =>
          setSnackbar({
            ...snackbar,
            open: false
          })
        }
        anchorOrigin={{
          vertical: "top",
          horizontal: "center"
        }}
      >

        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={() =>
            setSnackbar({
              ...snackbar,
              open: false
            })
          }
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