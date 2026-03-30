import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
} from "@mui/material";

function ModalObservacoes({
    open,
    onClose,
    observacao_palet,
    onChange,
    onConfirm
}
) {
    return (
        <Dialog open={open} onClose={onClose} fullWidth>
            <DialogTitle><strong>Adicionar observação</strong></DialogTitle>

            <DialogContent>

                <TextField
                    label="Observação"
                    name="observacao_palet"
                    fullWidth
                    value={observacao_palet}
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

export default ModalObservacoes;