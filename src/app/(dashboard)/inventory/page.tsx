"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Package, Plus, Search, AlertTriangle, Edit, Trash2, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { formatCurrency, formatDate } from "@/lib/utils";

const itemSchema = z.object({
  name: z.string().min(2, "Name is required"),
  category: z.string().min(1, "Category is required"),
  quantity: z.string().min(1, "Quantity is required"),
  unit: z.string().min(1, "Unit is required"),
  minStock: z.string().min(1, "Minimum stock is required"),
  price: z.string().min(1, "Price is required"),
  supplier: z.string().optional(),
});

type ItemForm = z.infer<typeof itemSchema>;

const CATEGORIES = ["Equipment", "Supplies", "Products", "Sanitation", "Furniture", "Other"];

export default function InventoryPage() {
  const { toast } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<ItemForm>({
    resolver: zodResolver(itemSchema),
  });

  const fetchItems = async () => {
    setLoading(true);
    try {
      const params = categoryFilter !== "all" ? `?category=${categoryFilter}` : "";
      const res = await fetch(`/api/inventory${params}`);
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, [categoryFilter]);

  const openCreateModal = () => {
    setEditingId(null);
    reset();
    setModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setEditingId(item.id);
    setValue("name", item.name);
    setValue("category", item.category);
    setValue("quantity", String(item.quantity));
    setValue("unit", item.unit);
    setValue("minStock", String(item.minStock));
    setValue("price", String(item.price));
    setValue("supplier", item.supplier || "");
    setModalOpen(true);
  };

  const onSubmit = async (data: ItemForm) => {
    setSubmitting(true);
    try {
      const url = editingId ? `/api/inventory/${editingId}` : "/api/inventory";
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to save item");

      toast({ title: editingId ? "Item updated" : "Item added", description: "The inventory item has been saved." });
      setModalOpen(false);
      fetchItems();
    } catch {
      toast({ title: "Error", description: "Failed to save item.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const deleteItem = async (id: string) => {
    try {
      await fetch(`/api/inventory/${id}`, { method: "DELETE" });
      toast({ title: "Item deleted", description: "The item has been removed from inventory." });
      setDeleteConfirmId(null);
      fetchItems();
    } catch {
      toast({ title: "Error", description: "Failed to delete item.", variant: "destructive" });
    }
  };

  const filteredItems = items.filter((item) => {
    if (!searchQuery) return true;
    return item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           item.category.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const lowStockItems = filteredItems.filter((item) => item.quantity <= item.minStock);
  const totalValue = filteredItems.reduce((sum, item) => sum + item.quantity * item.price, 0);

  const getStockStatus = (item: any) => {
    const ratio = item.quantity / item.minStock;
    if (ratio <= 0) return { label: "Out of Stock", color: "text-red-700 bg-red-100" };
    if (ratio <= 1) return { label: "Low Stock", color: "text-orange-700 bg-orange-100" };
    if (ratio <= 2) return { label: "Medium", color: "text-yellow-700 bg-yellow-100" };
    return { label: "In Stock", color: "text-green-700 bg-green-100" };
  };

  const getStockPercent = (item: any) => {
    if (item.minStock === 0) return 100;
    return Math.min((item.quantity / (item.minStock * 3)) * 100, 100);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
          <p className="text-gray-500 mt-1">Track products, tools, and supplies</p>
        </div>
        <Button onClick={openCreateModal} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">{filteredItems.length}</div>
              <div className="text-xs text-gray-500">Total Items</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <div className={`text-xl font-bold ${lowStockItems.length > 0 ? "text-orange-600" : "text-gray-900"}`}>
                {lowStockItems.length}
              </div>
              <div className="text-xs text-gray-500">Low/Out of Stock</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">{formatCurrency(totalValue)}</div>
              <div className="text-xs text-gray-500">Total Inventory Value</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <div className="mb-6 bg-orange-50 border border-orange-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-orange-900">Low Stock Alert</h3>
              <p className="text-sm text-orange-700 mt-1">
                {lowStockItems.length} item{lowStockItems.length > 1 ? "s are" : " is"} running low:{" "}
                {lowStockItems.map(i => i.name).join(", ")}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{filteredItems.length} item{filteredItems.length !== 1 ? "s" : ""}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No items found</p>
              <p className="text-sm">Add your first inventory item</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Stock Level</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Restocked</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => {
                  const status = getStockStatus(item);
                  const percent = getStockPercent(item);
                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">{item.name}</div>
                          {item.supplier && <div className="text-xs text-gray-400">{item.supplier}</div>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">{item.category}</span>
                      </TableCell>
                      <TableCell className="w-32">
                        <div className="space-y-1">
                          <Progress
                            value={percent}
                            className={`h-2 ${percent <= 33 ? "bg-red-100 [&>div]:bg-red-500" : percent <= 66 ? "bg-orange-100 [&>div]:bg-orange-500" : "bg-green-100 [&>div]:bg-green-500"}`}
                          />
                          <div className="text-xs text-gray-400">Min: {item.minStock} {item.unit}</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {item.quantity} {item.unit}
                      </TableCell>
                      <TableCell className="text-gray-600">{formatCurrency(item.price)}</TableCell>
                      <TableCell>
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${status.color}`}>
                          {status.label}
                        </span>
                      </TableCell>
                      <TableCell className="text-gray-500 text-sm">
                        {item.lastRestocked ? formatDate(item.lastRestocked) : "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600" onClick={() => openEditModal(item)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-gray-500 hover:text-red-600" onClick={() => setDeleteConfirmId(item.id)}>
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
            <DialogTitle>{editingId ? "Edit Item" : "Add Inventory Item"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Item Name *</Label>
              <Input placeholder="e.g., Oster Classic 76 Clippers" {...register("name")} className={errors.name ? "border-red-500" : ""} />
              {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select onValueChange={(v) => setValue("category", v)}>
                  <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-red-500 text-xs">{errors.category.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Unit *</Label>
                <Input placeholder="e.g., units, liters, boxes" {...register("unit")} className={errors.unit ? "border-red-500" : ""} />
                {errors.unit && <p className="text-red-500 text-xs">{errors.unit.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Quantity *</Label>
                <Input type="number" min="0" step="0.01" placeholder="0" {...register("quantity")} className={errors.quantity ? "border-red-500" : ""} />
                {errors.quantity && <p className="text-red-500 text-xs">{errors.quantity.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Min Stock *</Label>
                <Input type="number" min="0" step="0.01" placeholder="0" {...register("minStock")} className={errors.minStock ? "border-red-500" : ""} />
                {errors.minStock && <p className="text-red-500 text-xs">{errors.minStock.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Unit Price ($) *</Label>
                <Input type="number" min="0" step="0.01" placeholder="0.00" {...register("price")} className={errors.price ? "border-red-500" : ""} />
                {errors.price && <p className="text-red-500 text-xs">{errors.price.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Supplier</Label>
              <Input placeholder="Supplier name" {...register("supplier")} />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={submitting}>
                {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : (editingId ? "Update" : "Add Item")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete Item?</DialogTitle></DialogHeader>
          <p className="text-gray-600 text-sm">This will permanently delete the inventory item.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteConfirmId && deleteItem(deleteConfirmId)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
