/** Legacy ownership is fixed at migration, never inferred from the current baby count. */
export function recordsForBaby<T extends { babyId?: string }>(records: T[], babyId: string | null | undefined, _babyCount: number, legacyOwnerId: string | null): T[] {
  if (!babyId) return [];
  return records.filter((record) => record.babyId === babyId || (!record.babyId && legacyOwnerId === babyId));
}
