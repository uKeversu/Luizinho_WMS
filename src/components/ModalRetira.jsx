import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box
} from "@mui/material";

function ModalRetira({
  open,
  onClose,
  retirada,
  onChange,
  onConfirm
}
) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle><strong>Retirada de Peças</strong></DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <TextField
            label="Código da Peça"
            name="codigo"
            value={retirada.codigo || ""}
            onChange={onChange}
            sx={{
              mt: 2, width: '48%', '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: '#007bff',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#007bff',
                }
              }
            }}
          />
          <TextField
            label="Código interno"
            name="codigo_interno"
            value={retirada.codigo_interno || ""}
            onChange={onChange}
            sx={{
              mt: 2, width: '48%', '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: '#007bff',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#007bff',
                }
              }
            }}
          />
        </Box>

        <TextField
          fullWidth
          label="Quantidade"
          name="quantidade"
          type="number"
          value={retirada.quantidade || ""}
          onChange={onChange}
          sx={{
            mt: 2, '& .MuiOutlinedInput-root': {
              '&:hover fieldset': {
                borderColor: '#007bff',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#007bff',
              }
            }
          }}
        />

        <TextField
          fullWidth
          label="Motivo"
          name="motivo"
          value={retirada.motivo || ""}
          onChange={onChange}
          sx={{
            mt: 2, '& .MuiOutlinedInput-root': {
              '&:hover fieldset': {
                borderColor: '#007bff',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#007bff',
              }
            }
          }}
        />

        <TextField
          fullWidth
          label="NF"
          name="nf"
          value={retirada.nf || ""}
          onChange={onChange}
          sx={{
            mt: 2, '& .MuiOutlinedInput-root': {
              '&:hover fieldset': {
                borderColor: '#007bff',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#007bff',
              }
            }
          }}
        />

        <TextField
          fullWidth
          label="Código do Funcionário"
          name="funcionario"
          value={retirada.funcionario || ""}
          onChange={onChange}
          sx={{
            mt: 2, '& .MuiOutlinedInput-root': {
              '&:hover fieldset': {
                borderColor: '#007bff',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#007bff',
              }
            }
          }}
        />
      </DialogContent>

      <DialogActions>
        <Button variant="contained" color="error" onClick={onClose}>
          Cancelar
        </Button>

        <Button
          variant="contained"
          sx={{ bgcolor: '#00ca32', '&:hover': { bgcolor: '#009425' } }}
          onClick={onConfirm}
        >
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ModalRetira;