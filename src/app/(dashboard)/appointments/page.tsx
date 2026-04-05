"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Calendar, Plus, Search, Filter, MessageSquare,
  Edit, Trash2, Check, X, Clock, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { formatCurrency, formatDateTime } from "@/lib/utils";

const appointmentSchema = z.object({
  clientId: z.string().min(1, "Please select a client"),
  barberId: z.string().min(1, "Please select a barber"),
  serviceId: z.string().min(1, "Please select a service"),
  scheduledAt: z.string().min(1, "Please select a date and time"),
  notes: z.string().optional(),
});

type AppointmentForm = z.infer<typeof appointmentSchema>;

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: "Pending", color: "text-yellow-700", bg: "bg-yellow-100" },
  CONFIRMED: { label: "Confirmed", color: "text-blue-700", bg: "bg-blue-100" },
  COMPLETED: { label: "Completed", color: "text-green-700", bg: "bg-green-100" },
  CANCELLED: { label: "Cancelled", color: "text-red-700", bg: "bg-red-100" },
};

export default function AppointmentsPage() {
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [barbers, setBarbers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<AppointmentForm>({
    resolver: zodResolver(appointmentSchema),
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);

      const [aptsRes, clientsRes, servicesRes, barbersRes] = await Promise.all([
        fetch(`/api/appointments?${params}`),
        fetch("/api/clients"),
        fetch("/api/services"),
        fetch("/api/barbers"),
      ]);

      const [aptsData, clientsData, servicesData, barbersData] = await Promise.all([
        aptsRes.json(),
        clientsRes.json(),
        servicesRes.json(),
        barbersRes.json(),
      ]);

      setAppointments(Array.isArray(aptsData) ? aptsData : []);
      setClients(Array.isArray(clientsData) ? clientsData : []);
      setServices(Array.isArray(servicesData) ? servicesData : []);
      setBarbers(Array.isArray(barbersData) ? barbersData : []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const openCreateModal = () => {
    setEditingId(null);
    reset();
    setModalOpen(true);
  };

  const openEditModal = (apt: any) => {
    setEditingId(apt.id);
    const localDateTime = new Date(apt.scheduledAt);
    const offset = localDateTime.getTimezoneOffset();
    const adjusted = new Date(localDateTime.getTime() - offset * 60000);
    setValue("clientId", apt.clientId);
    setValue("barberId", apt.barberId);
    setValue("serviceId", apt.serviceId);
    setValue("scheduledAt", adjusted.toISOString().slice(0, 16));
    setValue("notes", apt.notes || "");
    setModalOpen(true);
  };

  const onSubmit = async (data: AppointmentForm) => {
    setSubmitting(true);
    try {
      const url = editingId ? `/api/appointments/${editingId}` : "/api/appointments";
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to save appointment");

      toast({ title: editingId ? "Appointment updated" : "Appointment created", description: "The appointment has been saved successfully." });
      setModalOpen(false);
      fetchData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to save appointment.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/appointments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      toast({ title: "Status updated", description: `Appointment marked as ${status.toLowerCase()}` });
      fetchData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update status.", variant: "destructive" });
    }
  };

  const deleteAppointment = async (id: string) => {
    try {
      await fetch(`/api/appointments/${id}`, { method: "DELETE" });
      toast({ title: "Appointment deleted", description: "The appointment has been removed." });
      setDeleteConfirmId(null);
      fetchData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete appointment.", variant: "destructive" });
    }
  };

  const sendWhatsAppReminder = (apt: any) => {
    const phone = apt.client.phone?.replace(/\D/g, "");
    const dateStr = formatDateTime(apt.scheduledAt);
    const message = encodeURIComponent(
      `Hi ${apt.client.name}! This is a reminder for your appointment at BarberPro.\n\n` +
      `Service: ${apt.service.name}\n` +
      `Date: ${dateStr}\n` +
      `Barber: ${apt.barber.name}\n\n` +
      `Please reply to confirm or reschedule. Thank you!`
    );
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
  };

  const filteredAppointments = appointments.filter((apt) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      apt.client?.name?.toLowerCase().includes(q) ||
      apt.service?.name?.toLowerCase().includes(q) ||
      apt.barber?.name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-500 mt-1">Manage all your barbershop appointments</p>
        </div>
        <Button onClick={openCreateModal} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          New Appointment
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by client, service, or barber..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {filteredAppointments.length} appointment{filteredAppointments.length !== 1 ? "s" : ""}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No appointments found</p>
              <p className="text-sm">Create your first appointment to get started</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Barber</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAppointments.map((apt) => {
                  const status = statusConfig[apt.status] || statusConfig.PENDING;
                  return (
                    <TableRow key={apt.id}>
                      <TableCell className="font-medium">{apt.client?.name}</TableCell>
                      <TableCell className="text-gray-600">{apt.service?.name}</TableCell>
                      <TableCell className="text-gray-600">{apt.barber?.name}</TableCell>
                      <TableCell className="text-gray-600">{formatDateTime(apt.scheduledAt)}</TableCell>
                      <TableCell className="font-medium text-green-700">{formatCurrency(apt.totalAmount)}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                          {status.label}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          {apt.status === "PENDING" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() => updateStatus(apt.id, "CONFIRMED")}
                              title="Confirm appointment"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          )}
                          {(apt.status === "PENDING" || apt.status === "CONFIRMED") && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-teal-600 hover:text-teal-700 hover:bg-teal-50"
                              onClick={() => sendWhatsAppReminder(apt)}
                              title="Send WhatsApp reminder"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </Button>
                          )}
                          {apt.status === "CONFIRMED" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 px-2 text-green-600 hover:text-green-700 hover:bg-green-50 text-xs"
                              onClick={() => updateStatus(apt.id, "COMPLETED")}
                            >
                              Complete
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600"
                            onClick={() => openEditModal(apt)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-gray-500 hover:text-red-600"
                            onClick={() => setDeleteConfirmId(apt.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Appointment" : "New Appointment"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Client</Label>
                <Select onValueChange={(v) => setValue("clientId", v)} defaultValue={watch("clientId")}>
                  <SelectTrigger className={errors.clientId ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.clientId && <p className="text-red-500 text-xs">{errors.clientId.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Service</Label>
                <Select onValueChange={(v) => setValue("serviceId", v)} defaultValue={watch("serviceId")}>
                  <SelectTrigger className={errors.serviceId ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select service" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name} — {formatCurrency(s.price)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.serviceId && <p className="text-red-500 text-xs">{errors.serviceId.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Barber</Label>
              <Select onValueChange={(v) => setValue("barberId", v)} defaultValue={watch("barberId")}>
                <SelectTrigger className={errors.barberId ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select barber" />
                </SelectTrigger>
                <SelectContent>
                  {barbers.map((b) => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.barberId && <p className="text-red-500 text-xs">{errors.barberId.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Date & Time</Label>
              <Input
                type="datetime-local"
                {...register("scheduledAt")}
                className={errors.scheduledAt ? "border-red-500" : ""}
              />
              {errors.scheduledAt && <p className="text-red-500 text-xs">{errors.scheduledAt.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea placeholder="Any special requests or notes..." {...register("notes")} rows={3} />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={submitting}>
                {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : (editingId ? "Update" : "Create")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Appointment?</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600 text-sm">This action cannot be undone. The appointment will be permanently deleted.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteConfirmId && deleteAppointment(deleteConfirmId)}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
