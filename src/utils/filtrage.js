export function filtrerParStatut(items, filtre) {
  if (filtre === 'actifs')   return items.filter(it => it.actif);
  if (filtre === 'inactifs') return items.filter(it => !it.actif);
  return items;
}