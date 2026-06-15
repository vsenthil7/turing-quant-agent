import React from "react";
import { permissionsFor, canManageUsers, type AccountProfile } from "../lib/account";
import { NotificationPrefsPanel } from "./NotificationPrefs";
import type { NotificationPrefs } from "../lib/notifyPrefs";

export interface AccountSettingsProps {
  profile: AccountProfile;
  prefs: NotificationPrefs;
  onPrefsChange: (p: NotificationPrefs) => void;
}

export function AccountSettings({ profile, prefs, onPrefsChange }: AccountSettingsProps) {
  return (
    <div className="account" aria-label="Account settings">
      <section aria-label="Profile">
        <h2>Profile</h2>
        <dl>
          <dt>Email</dt><dd>{profile.email}</dd>
          <dt>Role</dt><dd data-testid="role">{profile.role}</dd>
          <dt>Tenant</dt><dd>{profile.tenantId}</dd>
        </dl>
        <ul aria-label="permissions">
          {permissionsFor(profile.role).map(p => <li key={p}>{p}</li>)}
        </ul>
        {canManageUsers(profile.role) && <button data-testid="manage-users">Manage users</button>}
      </section>
      <NotificationPrefsPanel prefs={prefs} onChange={onPrefsChange} />
    </div>
  );
}
