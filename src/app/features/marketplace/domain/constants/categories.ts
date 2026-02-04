/** Main categories with their subcategories for the marketplace (car parts). */
export const CATEGORIES_WITH_SUBCATEGORIES: Record<string, readonly string[]> = {
  Motor: ['Filtros', 'Juntas', 'Válvulas', 'Pistões', 'Bielas', 'Distribuição', 'Outro'],
  Transmissão: ['Embraiagem', 'Caixa de velocidades', 'Diferencial', 'Cardans', 'Outro'],
  Suspensão: ['Amortecedores', 'Molas', 'Coilovers', 'Braços','Outro'],
  Travagem: ['Pastilhas', 'Discos', 'Pinças','Tubos', 'Outro'],
  Escape: ['Coletor', 'Catalisador', 'Panela', 'Sonda lambda', 'Outro'],
  Interior: ['Bancos', 'Tablier', 'Consola', 'Volante', 'Outro'],
  Exterior: ['Para-choques', 'Capô', 'Portas', 'Espelhos', 'Faróis', 'Farolins', 'Outro'],
  'Jantes/Pneus': ['Jantes', 'Pneus', 'Acessórios', 'Outro'],
} as const;

export const MAIN_CATEGORIES = Object.keys(CATEGORIES_WITH_SUBCATEGORIES) as readonly string[];

export function getSubcategoriesFor(category: string): readonly string[] {
  return CATEGORIES_WITH_SUBCATEGORIES[category] ?? [];
}
