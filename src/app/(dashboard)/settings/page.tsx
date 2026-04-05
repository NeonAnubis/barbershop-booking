"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { User, Lock, Bell, Palette, Globe, Save, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";

export default function SettingsPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const [notifications, setNotifications] = useState({
    appointments: true,
    reminders: true,
    marketing: false,
    reports: true,
  });

  const handleSave = async () => {
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaving(false);
    toast({ title: "Settings saved", description: "Your settings have been updated successfully." });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account and application preferences</p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">
            <User className="w-4 h-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security">
            <Lock className="w-4 h-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="business">
            <Globe className="w-4 h-4 mr-2" />
            Business
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="bg-blue-600 text-white text-2xl">
                    {session?.user?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" size="sm">Change Photo</Button>
                  <p className="text-xs text-gray-500 mt-1">JPG, GIF or PNG. Max 2MB.</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input defaultValue={session?.user?.name || ""} placeholder="Your name" />
                </div>
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input defaultValue={session?.user?.email || ""} type="email" />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input placeholder="+1-555-0100" />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Input defaultValue={(session?.user as any)?.role || "ADMIN"} disabled className="bg-gray-50" />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700" disabled={saving}>
                  {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : <><Save className="w-4 h-4 mr-2" />Save Changes</>}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your password and security preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Change Password</h3>
                <div className="space-y-2">
                  <Label>Current Password</Label>
                  <Input type="password" placeholder="••••••••" />
                </div>
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <Input type="password" placeholder="••••••••" />
                </div>
                <div className="space-y-2">
                  <Label>Confirm New Password</Label>
                  <Input type="password" placeholder="••••••••" />
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">Update Password</Button>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Two-Factor Authentication</h3>
                <p className="text-sm text-gray-500">
                  Add an extra layer of security to your account by enabling two-factor authentication.
                </p>
                <Button variant="outline">Enable 2FA</Button>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Active Sessions</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Current Session</p>
                      <p className="text-sm text-gray-500">Chrome on Windows • Active now</p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-red-600">Revoke</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose what you want to be notified about</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                {
                  key: "appointments" as const,
                  title: "New Appointments",
                  description: "Get notified when a new appointment is booked",
                },
                {
                  key: "reminders" as const,
                  title: "Appointment Reminders",
                  description: "Receive reminders before upcoming appointments",
                },
                {
                  key: "marketing" as const,
                  title: "Marketing Updates",
                  description: "Receive product updates and marketing emails",
                },
                {
                  key: "reports" as const,
                  title: "Weekly Reports",
                  description: "Get weekly business performance summaries",
                },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{item.title}</p>
                    <p className="text-sm text-gray-500">{item.description}</p>
                  </div>
                  <Switch
                    checked={notifications[item.key]}
                    onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, [item.key]: checked }))}
                  />
                </div>
              ))}

              <Separator />

              <div className="flex justify-end">
                <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700" disabled={saving}>
                  {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : <><Save className="w-4 h-4 mr-2" />Save Preferences</>}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="business">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Barbershop Information</CardTitle>
                <CardDescription>Details about your business</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Business Name</Label>
                    <Input defaultValue="BarberPro Cuts" placeholder="Your barbershop name" />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input placeholder="+1-555-0100" />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input placeholder="info@yourbarbershop.com" type="email" />
                  </div>
                  <div className="space-y-2">
                    <Label>Website</Label>
                    <Input placeholder="https://yourbarbershop.com" />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label>Address</Label>
                    <Input placeholder="123 Main Street, City, State, ZIP" />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700" disabled={saving}>
                    {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : <><Save className="w-4 h-4 mr-2" />Save</>}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Business Hours</CardTitle>
                <CardDescription>Set your regular operating hours</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day, i) => (
                  <div key={day} className="flex items-center gap-4">
                    <span className="w-24 text-sm font-medium text-gray-700">{day}</span>
                    <Switch defaultChecked={i < 6} />
                    <Input type="time" defaultValue="09:00" className="w-28 h-8 text-sm" />
                    <span className="text-gray-500">to</span>
                    <Input type="time" defaultValue={i < 6 ? "18:00" : "14:00"} className="w-28 h-8 text-sm" />
                  </div>
                ))}
                <div className="flex justify-end mt-4">
                  <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700" disabled={saving}>
                    {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : <><Save className="w-4 h-4 mr-2" />Save Hours</>}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
