import type { Request, Response } from 'express';
import { EmergencyInformation } from '../models/EmergencyInformation.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { created, ok } from '../utils/apiResponse.js';
import { emergencyInfoSchema, emergencyInfoUpdateSchema } from '../validators/schemas.js';

export const listInfo = asyncHandler(async (req: Request, res: Response) => {
  // Unpublished guides are admin-only.
  const isAdmin = req.user?.role === 'admin';
  const items = await EmergencyInformation.find(isAdmin ? {} : { published: true })
    .sort({ disasterType: 1 })
    .lean();
  return ok(res, { items });
});

export const getInfo = asyncHandler(async (req: Request, res: Response) => {
  const item = await EmergencyInformation.findById(req.params.id).lean();
  if (!item) throw ApiError.notFound('That guide does not exist.');
  if (!item.published && req.user?.role !== 'admin') {
    throw ApiError.notFound('That guide does not exist.');
  }
  return ok(res, { item });
});

export const createInfo = asyncHandler(async (req: Request, res: Response) => {
  const input = emergencyInfoSchema.parse(req.body);
  const item = await EmergencyInformation.create(input);
  return created(res, { item: item.toJSON() });
});

export const updateInfo = asyncHandler(async (req: Request, res: Response) => {
  const input = emergencyInfoUpdateSchema.parse(req.body);
  const item = await EmergencyInformation.findByIdAndUpdate(req.params.id, input, {
    new: true,
    runValidators: true,
  }).lean();
  if (!item) throw ApiError.notFound('That guide does not exist.');
  return ok(res, { item });
});

export const deleteInfo = asyncHandler(async (req: Request, res: Response) => {
  const item = await EmergencyInformation.findByIdAndDelete(req.params.id);
  if (!item) throw ApiError.notFound('That guide does not exist.');
  return ok(res, { message: 'Guide deleted.' });
});
