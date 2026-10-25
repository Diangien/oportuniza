// Mensagem de erro por baixo de um campo. Ligue-a ao campo com
// aria-describedby={id} e aria-invalid.
export function MensagemErro({ id, children }: { id: string; children?: string | undefined }) {
  if (!children) return null;
  return (
    <span id={id} className="mt-1.5 block text-xs font-normal text-destructive">
      {children}
    </span>
  );
}

// Props de acessibilidade para um campo com possível erro.
export function propsErro(id: string, erro: string | undefined) {
  return erro ? { "aria-invalid": true, "aria-describedby": `${id}-erro` } : {};
}
