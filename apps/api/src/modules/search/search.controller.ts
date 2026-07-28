import type { Request, Response } from "express";
import type { SearchSchema } from "./search.types";
import { searchService } from "./search.service";

export async function searchController(
  req: Request<{}, {}, SearchSchema>,
  res: Response,
) {
  const userId = req.user?.id!;
  const { q, limit, projectId, status } = req.query;

  try {
    const results = await searchService(userId, {
      q: q as string,
      limit: limit as string,
      projectId: projectId as string,
      status: status as string,
    });

    res.status(200).json({
      success: true,
      results,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal Server Error - ${error}`,
    });
  }
}
