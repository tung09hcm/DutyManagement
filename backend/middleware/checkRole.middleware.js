import { Organization, User, UserOrganization } from "../model/index.js";

export const checkRole = async (userId, orgId) => {
  const membership = await UserOrganization.findOne({
    where: { userId, organizationId: orgId },
  });
  return membership ? membership.role : null;
};