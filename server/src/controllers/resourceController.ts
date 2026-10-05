import type { Request, Response } from 'express';
import type { FilterQuery } from 'mongoose';
import { EmergencyResource, type IEmergencyResource } from '../models/EmergencyResource.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { created, ok, paginated } from '../utils/apiResponse.js';
import { distanceKm } from '../utils/geo.js';
import { resourceQuerySchema, resourceSchema, resourceUpdateSchema } from '../validators/schemas.js';

export const listResources = asyncHandler(async (req: Request, res: Response) => {
  const q = resourceQuerySchema.parse(req.query);

  const filters: Record<string, unknown> = {};
  if (q.type) filters.type = q.type;
  if (q.status) filters.status = q.status;
  if (q.search) {
    const rx = new RegExp(q.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filters.$or = [{ name: rx }, { address: rx }];
  }

  const [rows, total] = await Promise.all([
    EmergencyResource.find(filters as FilterQuery<IEmergencyResource>)
      .sort({ name: 1 })
      .skip((q.page - 1) * q.limit)
      .limit(q.limit)
      .lean(),
    EmergencyResource.countDocuments(filters as FilterQuery<IEmergencyResource>),
  ]);

  // Annotate with distance when the caller shared a position, then re-sort.
  const hasOrigin = q.latitude !== undefined && q.longitude !== undefined;
  const items = hasOrigin
    ? rows
        .map((r) => ({
          ...r,
          distanceKm: distanceKm({ latitude: q.latitude!, longitude: q.longitude! }, r),
        }))
        .sort((a, b) => a.distanceKm - b.distanceKm)
    : rows;

  return paginated(res, items, q.page, q.limit, total);
});

export const getResource = asyncHandler(async (req: Request, res: Response) => {
  const resource = await EmergencyResource.findById(req.params.id).lean();
  if (!resource) throw ApiError.notFound('That resource does not exist.');
  return ok(res, { resource });
});

export const createResource = asyncHandler(async (req: Request, res: Response) => {
  const input = resourceSchema.parse(req.body);
  if (input.availability > input.capacity) {
    throw ApiError.badRequest('Available units cannot exceed total capacity.');
  }
  const resource = await EmergencyResource.create(input);
  return created(res, { resource: resource.toJSON() });
});

export const updateResource = asyncHandler(async (req: Request, res: Response) => {
  const input = resourceUpdateSchema.parse(req.body);
  const resource = await EmergencyResource.findById(req.params.id);
  if (!resource) throw ApiError.notFound('That resource does not exist.');

  Object.assign(resource, input);
  if (resource.availability > resource.capacity) {
    throw ApiError.badRequest('Available units cannot exceed total capacity.');
  }
  await resource.save();

  return ok(res, { resource: resource.toJSON() });
});

export const deleteResource = asyncHandler(async (req: Request, res: Response) => {
  const resource = await EmergencyResource.findByIdAndDelete(req.params.id);
  if (!resource) throw ApiError.notFound('That resource does not exist.');
  return ok(res, { message: 'Resource deleted.' });
});
