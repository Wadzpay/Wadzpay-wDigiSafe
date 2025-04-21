
/**
 * Validates whether a string is a valid Algorand address
 * @param address The address to validate
 * @returns boolean indicating if the address is valid
 */
export const validateAlgorandAddress = (address: string): boolean => {
  // Algorand addresses are base32 encoded and should be 58 characters long starting with A
  return /^[A-Z2-7]{58}$/.test(address);
};
