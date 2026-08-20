import { AuditLog } from '../models/AuditLog.js';

export class AuditService {
  async log({
    actor,
    action,
    entity,
    entityId,
    metadata = {},
    req = null,
  }) {
    const payload = {
      actor: actor?._id || actor?.id,
      actorRole: actor?.role,
      action,
      entity,
      entityId: entityId,
      metadata,
      ipAddress: req?.ip,
      userAgent: req?.get ? req.get('user-agent') : undefined,
    };

    try {
      await AuditLog.create(payload);
    } catch (error) {
      console.error('[Audit] Failed to create audit log:', error.message);
    }
  }
}

export const auditService = new AuditService();