"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AddressList } from "@/components/addresses/address-list";
import { AddressForm } from "@/components/addresses/address-form";
import { AddressResponse } from "@/lib/address/types/address.types";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AddressPageClient() {
  const router = useRouter();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<AddressResponse | null>(
    null
  );

  const handleEdit = (address: AddressResponse) => {
    router.push(`/addresses/${address.id}/edit`);
  };

  const handleView = (address: AddressResponse) => {
    router.push(`/addresses/${address.id}/details`);
  };

  const handleAddSuccess = () => {
    setShowAddForm(false);
  };

  const handleEditSuccess = () => {
    setEditingAddress(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Addresses</h1>
          <p className="text-muted-foreground mt-2">
            Manage your shipping and billing addresses
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Address
        </Button>
      </div>

      <AddressList onEdit={handleEdit} onSelect={handleView} />

      {/* Add Address Dialog */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Address</DialogTitle>
          </DialogHeader>
          <AddressForm
            onSuccess={handleAddSuccess}
            onCancel={() => setShowAddForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Address Dialog */}
      <Dialog
        open={!!editingAddress}
        onOpenChange={() => setEditingAddress(null)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Address</DialogTitle>
          </DialogHeader>
          {editingAddress && (
            <AddressForm
              address={editingAddress}
              onSuccess={handleEditSuccess}
              onCancel={() => setEditingAddress(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
