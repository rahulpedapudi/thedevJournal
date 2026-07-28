import { db } from "../../db/db";
import type { SearchSchema } from "./search.types";
import { devNote } from "../../db/schemas";
import { eq, and, sql } from "drizzle-orm";

export async function searchService(userId: string, reqQuery: SearchSchema) {
  const { q, limit, projectId, status } = reqQuery;

  if (!q || typeof q !== "string" || q.trim().length < 2) {
    return { results: [], total: 0 };
  }

  const query = q.trim();

  // Build filters
  const filters = [eq(devNote.userId, userId), eq(devNote.isDeleted, false)];

  if (projectId) filters.push(eq(devNote.projectId, projectId));

  //   if (status) filters.push(eq(devNote., status));

  const results = await db
    .select({
      id: devNote.id,
      title: devNote.title,
      rawContent: devNote.rawContent,
      enrichedContent: devNote.enrichedContent,
      noteType: devNote.noteType,
      aiStatus: devNote.aiStatus,
      projectId: devNote.projectId,
      createdAt: devNote.createdAt,
      updatedAt: devNote.updatedAt,

      rank: sql<number>`
        ts_rank(
          ${devNote.searchVector},
          websearch_to_tsquery('english', ${query})
        )
    `,

      // headline: snippet with matched terms highlighted
      headline: sql<string>`
        ts_headline('english',
          coalesce(${devNote.rawContent}, ''),
          websearch_to_tsquery('english', ${query}),
          'MaxWords=15, MinWords=8, StartSel=<mark>, StopSel=</mark>'
        )
      `,
    })
    .from(devNote)
    .where(
      and(
        ...filters,
        sql`${devNote.searchVector} @@ websearch_to_tsquery('english', ${query})`,
      ),
    )
    .orderBy(sql`rank DESC`)
    .limit(parseInt(limit as string, 10));

  return {
    data: results,
    total: results.length,
  };
}
