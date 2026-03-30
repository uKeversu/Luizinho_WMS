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
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Confirmar Recebimento</DialogTitle>

            <DialogContent>
                <Typography>
                    Tem certeza que deseja confirmar o recebimento?
                </Typography>
            </DialogContent>

            <DialogActions>
                <Button
                    variant="contained"
                    color="error"
                    onClick={onClose}
                >
                    Cancelar
                </Button>

                <Button
                    variant="contained"
                    sx={{ bgcolor: '#00ca32' }}
                    onClick={onConfirm}
                >
                    Confirmar
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default ModalConfirmaRecebimento;