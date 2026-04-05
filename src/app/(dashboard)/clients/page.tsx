"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Users, Plus, Search, Phone, Mail, Calendar,
  Edit, Trash2, ChevronRight, MessageSquare, Loader2, User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { formatDate, formatDateTime, formatCurrency } from "@/lib/utils";

const clientSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().min(6, "Phone number is required"),
  birthDate: z.string().optional(),
  notes: z.string().optional(),
});

type ClientForm = z.infer<typeof clientSchema>;

export default function ClientsPage() {
  const { toast } = useToast();
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ClientForm>({
    resolver: zodResolver(clientSchema),
  });

  const fetchClients = async (search?: string) => {
    setLoading(true);
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : "";
      const res = await fetch(`/api/clients${params}`);
      const data = await res.json();
      setClients(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching clients:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchClients(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const openCreateModal = () => {
    setEditingId(null);
    reset();
    setModalOpen(true);
  };

  const openEditModal = (client: any) => {
    setEditingId(client.id);
    setValue("name", client.name);
    setValue("email", client.email || "");
    setValue("phone", client.phone);
    setValue("notes", client.notes || "");
    if (client.birthDate) {
      setValue("birthDate", new Date(client.birthDate).toISOString().split("T")[0]);
    }
    setModalOpen(true);
  };

  const openDetailModal = (client: any) => {
    setSelectedClient(client);
    setDetailModalOpen(true);
  };

  const onSubmit = async (data: ClientForm) => {
    setSubmitting(true);
    try {
      const url = editingId ? `/api/clients/${editingId}` : "/api/clients";
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to save client");

      toast({ title: editingId ? "Client updated" : "Client created", description: "The client has been saved successfully." });
      setModalOpen(false);
      fetchClients();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to save client.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const deleteClient = async (id: string) => {
    try {
      await fetch(`/api/clients/${id}`, { method: "DELETE" });
      toast({ title: "Client deleted", description: "The client has been removed." });
      setDeleteConfirmId(null);
      fetchClients();
    } catch {
      toast({ title: "Error", description: "Failed to delete client.", variant: "destructive" });
    }
  };

  const sendWhatsApp = (client: any, type: "reminder" | "suggestion") => {
    const phone = client.phone?.replace(/\D/g, "");
    const message = type === "reminder"
      ? `Hi ${client.name}! We miss you at BarberPro. It's been a while since your last visit. Book your next appointment today!`
      : `Hi ${client.name}! Time for your next haircut? Based on your history, we think you're due for a visit. Book online or reply here!`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    CONFIRMED: "bg-blue-100 text-blue-800",
    COMPLETED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-500 mt-1">Manage your client relationships</p>
        </div>
        <Button onClick={openCreateModal} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Client
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">{clients.length}</div>
              <div className="text-xs text-gray-500">Total Clients</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">
                {clients.reduce((sum, c) => sum + (c.totalVisits || 0), 0)}
              </div>
              <div className="text-xs text-gray-500">Total Visits</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">
                {clients.filter(c => c.totalVisits >= 5).length}
              </div>
              <div className="text-xs text-gray-500">Loyal Clients (5+ visits)</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by name, email or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{clients.length} client{clients.length !== 1 ? "s" : ""}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : clients.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No clients found</p>
              <p className="text-sm">Add your first client to get started</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Total Visits</TableHead>
                  <TableHead>Last Visit</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm flex-shrink-0">
                          {client.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{client.name}</div>
                          {client.notes && <div className="text-xs text-gray-400 truncate max-w-32">{client.notes}</div>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <Phone className="w-3.5 h-3.5" />
                          {client.phone}
                        </div>
                        {client.email && (
                          <div className="flex items-center gap-1.5 text-sm text-gray-500">
                            <Mail className="w-3.5 h-3.5" />
                            {client.email}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">{client.totalVisits}</span>
                        {client.totalVisits >= 10 && (
                          <span className="text-xs bg-gold-100 text-orange-700 bg-orange-100 rounded-full px-1.5 py-0.5">VIP</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600 text-sm">
                      {client.lastVisit ? formatDate(client.lastVisit) : <span className="text-gray-400">Never</span>}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600"
                          onClick={() => openDetailModal(client)}
                          title="View details"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-teal-600 hover:text-teal-700 hover:bg-teal-50"
                          onClick={() => sendWhatsApp(client, "reminder")}
                          title="Send WhatsApp"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600"
                          onClick={() => openEditModal(client)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-gray-500 hover:text-red-600"
                          onClick={() => setDeleteConfirmId(client.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Client" : "Add New Client"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label>Full Name *</Label>
                <Input placeholder="John Smith" {...register("name")} className={errors.name ? "border-red-500" : ""} />
                {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Phone *</Label>
                <Input placeholder="+1-555-0100" {...register("phone")} className={errors.phone ? "border-red-500" : ""} />
                {errors.phone && <p className="text-red-500 text-xs">{errors.phone.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input placeholder="john@example.com" {...register("email")} className={errors.email ? "border-red-500" : ""} />
                {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Date of Birth</Label>
                <Input type="date" {...register("birthDate")} />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Notes</Label>
                <Textarea placeholder="Preferences, hair type, special notes..." {...register("notes")} rows={3} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={submitting}>
                {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : (editingId ? "Update" : "Add Client")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Client Detail Modal */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Client Profile</DialogTitle>
            <DialogDescription>Full visit history and client information</DialogDescription>
          </DialogHeader>
          {selectedClient && (
            <div className="space-y-6">
              {/* Client info */}
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xl">
                  {selectedClient.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">{selectedClient.name}</h3>
                  <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-600">
                    <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{selectedClient.phone}</span>
                    {selectedClient.email && <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{selectedClient.email}</span>}
                  </div>
                  {selectedClient.notes && (
                    <p className="mt-2 text-sm text-gray-500 bg-gray-50 rounded p-2">{selectedClient.notes}</p>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center bg-blue-50 rounded-xl p-4">
                  <div className="text-2xl font-bold text-blue-700">{selectedClient.totalVisits}</div>
                  <div className="text-xs text-blue-600 mt-1">Total Visits</div>
                </div>
                <div className="text-center bg-green-50 rounded-xl p-4">
                  <div className="text-2xl font-bold text-green-700">{selectedClient.appointments?.filter((a: any) => a.status === "COMPLETED").length || 0}</div>
                  <div className="text-xs text-green-600 mt-1">Completed</div>
                </div>
                <div className="text-center bg-purple-50 rounded-xl p-4">
                  <div className="text-2xl font-bold text-purple-700">
                    {formatCurrency(selectedClient.appointments?.filter((a: any) => a.status === "COMPLETED").reduce((sum: number, a: any) => sum + a.totalAmount, 0) || 0)}
                  </div>
                  <div className="text-xs text-purple-600 mt-1">Total Spent</div>
                </div>
              </div>

              {/* Next appointment suggestion */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Next Appointment Suggestion</h4>
                <p className="text-sm text-blue-700 mb-3">
                  Based on their history, this client is due for a visit. The last visit was{" "}
                  {selectedClient.lastVisit ? formatDate(selectedClient.lastVisit) : "never"}.
                </p>
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => sendWhatsApp(selectedClient, "suggestion")}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Send WhatsApp Reminder
                </Button>
              </div>

              {/* Visit History */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Visit History</h4>
                {selectedClient.appointments?.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">No appointment history</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedClient.appointments?.map((apt: any) => (
                      <div key={apt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm text-gray-900">{apt.service?.name}</p>
                          <p className="text-xs text-gray-500">{formatDateTime(apt.scheduledAt)} • {apt.barber?.name}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-green-700">{formatCurrency(apt.totalAmount)}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[apt.status] || "bg-gray-100 text-gray-700"}`}>
                            {apt.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete Client?</DialogTitle></DialogHeader>
          <p className="text-gray-600 text-sm">This will permanently delete the client and all their appointment history.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteConfirmId && deleteClient(deleteConfirmId)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
