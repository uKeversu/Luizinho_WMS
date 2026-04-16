import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography
} from "@mui/material";

function ModalConfirmaRecebimento({
    open,
    onClose,
    onConfirm
}) {
    return (
        <Dialog open={open} onClose={onClose}
            slotProps={{
                paper: {
                    sx: {
                        bgcolor: "background.default",
                        color: "text.primary",
                    }
                }
            }}>
            <DialogTitle sx={{ color: 'text.primary' }}>Confirmar Recebimento</DialogTitle>

            <DialogContent>
                <Typography sx={{ color: 'text.primary' }}>
                    Tem certeza que deseja confirmar o recebimento?
                </Typography>
            </DialogContent>

            <DialogActions>
                <Button
                    variant="contained"
                    onClick={onClose}
                    sx={{ color: "primary.branco", bgcolor: 'primary.cancelar', '&:hover': { bgcolor: 'primary.cancelarHover' } }}
                >
                    Cancelar
                </Button>

                <Button
                    variant="contained"
                    onClick={onConfirm}
                    sx={{ color: "primary.branco", bgcolor: 'primary.confirmar', '&:hover': { bgcolor: 'primary.confirmarHover' } }}
                >
                    Confirmar
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default ModalConfirmaRecebimento;