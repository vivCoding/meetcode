import {
  Button,
  Divider,
  Modal,
  ModalClose,
  ModalDialog,
  Stack,
  Typography,
} from "@mui/joy"
import * as React from "react"
import { useEffect, useState } from "react"

type PropsType = {
  title: string
  value: string
  open: boolean
  onClose: (value: boolean) => void
}

export default function ConfirmationDialog(props: PropsType) {
  const { title, onClose, value: valueProp, open, ...other } = props
  const [value, setValue] = useState(valueProp)

  useEffect(() => {
    if (!open) {
      setValue(valueProp)
    }
  }, [valueProp, open])

  const handleCancel = () => {
    onClose(false)
  }

  const handleOk = () => {
    onClose(true)
  }

  return (
    <Modal open={open} onClose={handleCancel}>
      <ModalDialog variant="outlined">
        <ModalClose />
        <Typography level="inherit" component="h2" mb={1.5}>
          {title}
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Typography mb={3}>{value}</Typography>
        <Stack direction="row" justifyContent="flex-end">
          <Button variant="plain" color="neutral" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="solid" color="danger" onClick={handleOk}>
            OK
          </Button>
        </Stack>
      </ModalDialog>
    </Modal>
  )

  // return (
  //   <Dialog
  //     // sx={{ "& .MuiDialog-paper": { width: "80%", maxHeight: 435 } }}
  //     maxWidth="xs"
  //     open={open}
  //     {...other}
  //   >
  //     <DialogTitle>{title}</DialogTitle>
  //     <DialogContent dividers>{value}</DialogContent>
  //     <DialogActions>
  //       <Button autoFocus onClick={handleCancel}>
  //         Cancel
  //       </Button>
  //       <Button onClick={handleOk}>Ok</Button>
  //     </DialogActions>
  //   </Dialog>
  // )
}
