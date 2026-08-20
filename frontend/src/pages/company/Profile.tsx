import { useQuery } from '@tanstack/react-query';
import { companyApi } from '../../services/api';
import { cn } from '../../utils';
import { Building2, Mail, Phone, MapPin, Globe, Save } from 'lucide-react';
import { useState } from 'react';

function CompanyProfile() {
  const { data: profile, isLoading } = useQuery({
    queryKey: ['company-profile'],
    queryFn: () => companyApi.getProfile(),
  });

  const [isEditing, setIsEditing] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted rounded animate-pulse w-1/3" />
        <div className="h-64 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Company Profile</h1>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 border rounded-md hover:bg-muted transition-colors"
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      <div className="bg-card border rounded-xl p-6">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 bg-muted/20 rounded-lg flex items-center justify-center">
            <Building2 className="h-10 w-10 text-muted-foreground" />
          </div>
          <div className="flex-1 space-y-2">
            <h2 className="text-xl font-semibold text-foreground">{profile?.name || 'Company Name'}</h2>
            <p className="text-muted-foreground">{profile?.industry || 'Industry'}</p>
            {profile?.isVerified ? (
              <span className="inline-block px-2.5 py-0.5 text-xs bg-success/10 text-success rounded-full">Verified</span>
            ) : (
              <span className="inline-block px-2.5 py-0.5 text-xs bg-warning/10 text-warning rounded-full">Pending Verification</span>
            )}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {profile?.website && (
            <div className="flex items-center gap-3">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{profile.website}</a>
            </div>
          )}
          {profile?.contactInfo?.email && (
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{profile.contactInfo.email}</span>
            </div>
          )}
          {profile?.contactInfo?.phone && (
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{profile.contactInfo.phone}</span>
            </div>
          )}
          {profile?.contactInfo?.address && (
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{profile.contactInfo.address}</span>
            </div>
          )}
        </div>

        {profile?.description && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">About</h3>
            <p className="text-foreground whitespace-pre-wrap">{profile.description}</p>
          </div>
        )}

        {isEditing && (
          <div className="mt-6 pt-6 border-t">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Company Name</label>
                <input type="text" defaultValue={profile?.name} className="w-full mt-1 px-3 py-2 border rounded-md bg-background" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Industry</label>
                <input type="text" defaultValue={profile?.industry} className="w-full mt-1 px-3 py-2 border rounded-md bg-background" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Website</label>
                <input type="text" defaultValue={profile?.website} className="w-full mt-1 px-3 py-2 border rounded-md bg-background" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Description</label>
                <textarea defaultValue={profile?.description} rows={4} className="w-full mt-1 px-3 py-2 border rounded-md bg-background resize-none" />
              </div>
              <div className="flex justify-end">
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CompanyProfile;
