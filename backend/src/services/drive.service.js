import { PlacementDrive } from '../models/PlacementDrive.js';
import { Job } from '../models/Job.js';
import { auditService } from './audit.service.js';
import { DRIVE_STATUS } from '../utils/constants.js';

export class PlacementDriveService {
  async getPublishedDrives(filters = {}, options = {}) {
    const { skip = 0, limit = 20, sort = { driveDate: -1 } } = options;

    return PlacementDrive.find({
      status: DRIVE_STATUS.SCHEDULED,
      driveDate: { $gte: new Date() },
      ...filters,
    })
      .skip(skip)
      .limit(limit)
      .sort(sort)
      .lean();
  }

  async getDriveById(driveId) {
    return PlacementDrive.findById(driveId).lean();
  }

  async createDrive(companyId, userId, driveData, req = null) {
    const drive = await PlacementDrive.create({
      company: companyId,
      title: driveData.title,
      description: driveData.description,
      driveDate: driveData.driveDate,
      startTime: driveData.startTime,
      endTime: driveData.endTime,
      venue: driveData.venue,
      mode: driveData.mode,
      meetingLink: driveData.meetingLink,
      eligibility: driveData.eligibility,
      createdBy: userId,
    });

    await auditService.log({
      actor: { _id: userId },
      action: 'DRIVE_CREATED',
      entity: 'PlacementDrive',
      entityId: drive._id,
      metadata: { action: 'CREATE' },
      req,
    });

    return drive.toObject();
  }

  async updateDrive(driveId, updates, userId, req = null) {
    const drive = await PlacementDrive.findByIdAndUpdate(
      driveId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!drive) {
      throw new Error('Placement drive not found');
    }

    await auditService.log({
      actor: { _id: userId },
      action: 'DRIVE_UPDATED',
      entity: 'PlacementDrive',
      entityId: drive._id,
      metadata: { action: 'UPDATE' },
      req,
    });

    return drive.toObject();
  }

  async deleteDrive(driveId) {
    return PlacementDrive.findByIdAndDelete(driveId).lean();
  }

  async checkEligibility(driveId, studentId) {
    const drive = await PlacementDrive.findById(driveId).lean();
    if (!drive) {
      throw new Error('Placement drive not found');
    }

    return {
      eligible: true, // Extend with actual eligibility logic as needed
      driveId,
      studentId,
    };
  }

  async getAllDrives(filters = {}, options = {}) {
    const { skip = 0, limit = 20, sort = { driveDate: -1 } } = options;
    const drives = await PlacementDrive.find(filters)
      .skip(skip)
      .limit(limit)
      .sort(sort)
      .lean();

    const total = await PlacementDrive.countDocuments(filters);
    return { drives, total };
  }
}

export const placementDriveService = new PlacementDriveService();