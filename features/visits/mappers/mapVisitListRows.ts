import { imagePathToUri } from '@/lib/helpers/image-paths';

import { VisitListDTO } from '../types/visit-dto';

export interface VisitListRow {
  visitId: number | null;
  visitedAt: string | null;
  visitComments: string | null;
  visitDeleted?: boolean | null;
  restaurantId?: number | null;
  restaurantName?: string | null;
  restaurantDeleted?: boolean | null;
  imageId?: number | null;
  imagePath?: string | null;
}

export function mapVisitListRows(rows: VisitListRow[]): VisitListDTO[] {
  return rows.reduce<VisitListDTO[]>((acc, row) => {
    if (!row.visitId) {
      return acc;
    }

    let visit = acc.find((item) => item.id === row.visitId);

    if (!visit) {
      visit = {
        id: row.visitId,
        visited_at: row.visitedAt ?? '',
        comments: row.visitComments ?? null,
        deleted: row.visitDeleted ?? undefined,
        restaurant: {
          id: row.restaurantId ?? 0,
          name: row.restaurantName ?? '',
          deleted: row.restaurantDeleted ?? undefined,
        },
        images: [],
      };
      acc.push(visit);
    }

    if (row.imageId && row.imagePath && !visit.images.some((image) => image.id === row.imageId)) {
      visit.images.push({
        id: row.imageId,
        uri: imagePathToUri(row.imagePath),
      });
    }

    return acc;
  }, []);
}
