import { Role } from '@/types/profile';

export const getDisplayName = (profile: any): string => {
  if (profile?.petOwner?.username) return profile.petOwner.username;

  if (profile?.veterinarian?.firstName) {
    return `${profile.veterinarian.firstName} ${profile.veterinarian.lastName}`;
  }

  if (profile?.serviceProvider?.firstName) {
    return `${profile.serviceProvider.firstName} ${profile.serviceProvider.lastName}`;
  }

  return profile?.user.email?.split('@')[0] || "User";
};

export const getRoleName = (role?: Role): string => {
  switch (role) {
    case Role.OWNER: return "Pet Owner";
    case Role.VET: return "Veterinarian";
    case Role.SERVICE: return "Service Provider";
    case Role.ADMIN: return "Administrator";
    default: return "User";
  }
};

export const getAvatarUrl = (profile: any): string => {
  const role = profile?.user.role;

  if (role === Role.OWNER && profile?.petOwner?.avatarUrl) {
    return profile.petOwner.avatarUrl;
  }

  if (role === Role.VET && profile?.veterinarian?.avatarUrl) {
    return profile.veterinarian.avatarUrl;
  }

  if (role === Role.SERVICE && profile?.serviceProvider?.avatarUrl) {
    return profile.serviceProvider.avatarUrl;
  }

  const seed = getDisplayName(profile);
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(seed)}&background=FF6B6B&color=fff`;
};