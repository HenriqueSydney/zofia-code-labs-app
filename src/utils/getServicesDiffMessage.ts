type ExistingService = {
  serviceTypeId: string;
  serviceType: { name: string };
};

export function getServicesDiffMessage(
  currentServices: ExistingService[],
  newServiceIds: string[]
): string | null {
  const currentIds = new Set(currentServices.map((s) => s.serviceTypeId));
  const newIdsSet = new Set(newServiceIds);

  const removed = currentServices.filter(
    (s) => !newIdsSet.has(s.serviceTypeId)
  );

  const addedIds = newServiceIds.filter((id) => !currentIds.has(id));

  // Se nada mudou, retorna null
  if (removed.length === 0 && addedIds.length === 0) {
    return null;
  }

  const lines = ["Alterações no Escopo de Serviços:"];

  if (removed.length > 0) {
    lines.push(
      `- Removidos: ${removed.map((r) => r.serviceType.name).join(", ")}`
    );
  }

  if (addedIds.length > 0) {
    lines.push(`- Adicionados: ${addedIds.length} novo(s) serviço(s)`);
  }

  return lines.join("\n");
}
