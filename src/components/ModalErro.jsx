import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem
} from "@mui/material";

function ModalErro({
    open,
    onClose,
    erro,
    onChange,
    onConfirm
}) {
    return (
        <Dialog open={open} onClose={onClose} fullWidth>
            <DialogTitle><strong>Relatar Erro</strong></DialogTitle>

            <DialogContent>

                <TextField
                    select
                    fullWidth
                    label="Tipo de Erro"
                    name="tipo"
                    value={erro.tipo || ""}
                    onChange={onChange}
                    error={!erro.tipo}
                    helperText={!erro.tipo ? "Selecione um tipo" : ""}
                    sx={{ mt: 2, '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                                borderColor: '#007bff',
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: '#007bff',
                            }
                        } }}
                >
                    <MenuItem value="avaria">Avaria</MenuItem>
                    <MenuItem value="falta">Falta</MenuItem>
                    <MenuItem value="divergencia">Divergência</MenuItem>
                    <MenuItem value="outro">Outro</MenuItem>
                </TextField>

                <TextField
                    fullWidth
                    label="Descrição do Erro"
                    name="descricao"
                    multiline
                    rows={3}
                    value={erro.descricao || ""}
                    onChange={onChange}
                    error={!erro.descricao?.trim()}
                    helperText={!erro.descricao?.trim() ? "Obrigatório" : ""}
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
                    value={erro.funcionario || ""}
                    onChange={onChange}
                    sx={{ mt: 2, '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                                borderColor: '#007bff',
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: '#007bff',
                            }
                        } }}
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

export default ModalErro;