export function wantsHumanTransfer(text: string): boolean {
  return /<TRANSFERT_HUMAIN\s*\/?>/i.test(text);
}

export function stripTransferMarker(text: string): string {
  return text.replace(/<TRANSFERT_HUMAIN\s*\/?>/gi, "").trim();
}
