// Import all sheet components that need registration
// Note: For v10, sheets with refs still work, but SheetRegister helps manage them centrally
// Since we're using refs throughout, we can keep the current pattern but ensure all sheets have unique id

export const Sheets = () => {
  // For now, return null since we're using refs with id
  // If you want to migrate to SheetRegister pattern later, you can register sheets here:
  // return <SheetRegister sheets={{'select-sheet': SelectSheet, 'confirmation-sheet': ConfirmationSheet}} />
  return null
}
