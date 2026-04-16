import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Typography
} from "@mui/material";

function ModalObservacoes({
    open,
    onClose,
    observacao_palet,
    onChange,
    onConfirm
}) {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            slotProps={{
                paper: {
                    sx: {
                        bgcolor: "background.default",
                        color: "text.primary",
                    }
                }
            }}
        >
            <DialogTitle>
                <Typography variant="h6" sx={{color: 'text.primary'}}>
                    <strong>Adicionar observação</strong>
                </Typography>
            </DialogTitle>

            <DialogContent>

                <TextField
                    label="Descrição"
                    name="observacao_palet"
                    fullWidth
                    value={observacao_palet}
                    onChange={onChange}
                    sx={{ mt: 2 }}
                />

            </DialogContent>

            <DialogActions>

                <Button
                    variant="contained"
                    sx={{ color: "primary.branco", bgcolor: 'primary.cancelar', '&:hover': { bgcolor: 'primary.cancelarHover' } }}
                    onClick={onClose}
                >
                    Cancelar
                </Button>

                <Button
                    variant="contained"
                    sx={{ color: "primary.branco", bgcolor: 'primary.confirmar', '&:hover': { bgcolor: 'primary.confirmarHover' } }}
                    onClick={onConfirm}
                >
                    Confirmar
                </Button>

            </DialogActions>
        </Dialog>
    );
}

export default ModalObservacoes;