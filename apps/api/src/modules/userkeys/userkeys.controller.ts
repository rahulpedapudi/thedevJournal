import type { Request, Response } from "express";
import {
  createUserKey,
  getUserKeyByProvider,
  getUserKeys,
} from "./userkeys.service";
import type { KeyCreateBody } from "./userkeys.types";

export async function createKey(
  req: Request<{}, {}, KeyCreateBody>,
  res: Response,
) {
  const userId = req.user?.id as string;
  const { provider, key } = req.body;

  if (!provider || !key) {
    res.status(400).json({
      message: "Provider and Key are required",
    });
    return;
  }

  try {
    const createdKey = await createUserKey(userId, provider, key);

    res.status(201).json({
      message: "Key created successfully",
      data: createdKey,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
}

export async function getKeys(req: Request, res: Response) {
  const userId = req.user?.id as string;

  try {
    const keys = await getUserKeys(userId);

    if (!keys) {
      res.status(404).json({
        message: "No keys found",
      });
      return;
    }

    res.status(200).json({
      message: "Keys retrieved successfully",
      data: keys,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
}

export async function getKeyByProvider(
  req: Request<{ provider: string }>,
  res: Response,
) {
  const userId = req.user?.id as string;
  const { provider } = req.params;

  if (!provider) {
    res.status(400).json({
      message: "Provider is required",
    });
    return;
  }

  try {
    const key = await getUserKeyByProvider(userId, provider);

    if (!key) {
      res.status(404).json({
        message: "No key found for this provider",
      });
      return;
    }

    res.status(200).json({
      message: "Key retrieved successfully",
      data: key,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
}
