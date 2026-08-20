import { useState } from 'react';
import { cn } from '../../utils';
import { Settings, Shield, Bell, Mail, Globe, Save } from 'lucide-react';

function AdminSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Configure platform-wide settings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {[
              { id: 'general', label: 'General', icon: Settings },
              { id: 'security', label: 'Security', icon: Shield },
              { id: 'notifications', label: 'Notifications', icon: Bell },
              { id: 'email', label: 'Email', icon: Mail },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors"
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">General Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Platform Name</label>
                <input
                  type="text"
                  defaultValue="PlaceX"
                  className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Platform URL</label>
                <input
                  type="text"
                  defaultValue="https://placex.app"
                  className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">Enable AI Features</label>
                <label className="relative inline-flex h-6 w-10 shrink-0 cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only" />
                  <div className="h-6 w-10 rounded-full bg-primary" />
                  <span className="absolute inset-0" />
                </label>
              </div>
            </div>
          </div>

          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2">
            <Save className="h-4 w-4" />
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminSettings;
