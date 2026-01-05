import Swal from "sweetalert2";

export const confirmAction = async ({
  title = "Are you sure?",
  text = "This action cannot be undone.",
  confirmText = "Yes, proceed",
  cancelText = "Cancel",
  icon = "warning"
} = {}) => {
  const result = await Swal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    reverseButtons: true,
    focusCancel: true
  });

  return result.isConfirmed;
};
