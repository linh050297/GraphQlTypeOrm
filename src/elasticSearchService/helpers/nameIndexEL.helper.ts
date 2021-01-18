export function nameIndexStandardized(nameIndex: string): string | boolean {
    // ***nameIndex:
  // Lowercase only
  // Cannot include \, /, *, ?, ", <, >, |, ` ` (space character), ,, #
  // Indices prior to 7.0 could contain a colon (:), but that’s been deprecated and won’t be supported in 7.0+
  // Cannot start with -, _, +
  // Cannot be . or ..
  // Cannot be longer than 255 bytes (note it is bytes, so multi-byte characters will count towards the 255 limit faster)

  let regex = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;

  if (regex.test(nameIndex) === true) {
    return false;
  }

  return nameIndex = nameIndex.toLowerCase(); 
  
}