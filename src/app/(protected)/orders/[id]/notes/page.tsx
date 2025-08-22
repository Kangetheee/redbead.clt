"use client";

import React, { useState, useMemo } from "react";
import {
  useOrders,
  useCustomerNotes,
  useAddCustomerInstructions,
} from "@/hooks/use-orders";
import { GetOrdersDto } from "@/lib/orders/dto/orders.dto";
import { OrderResponse, CustomerNote } from "@/lib/orders/types/orders.types";
import {
  Search,
  Filter,
  Plus,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  User,
  Calendar,
  ShoppingCart,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function NotesPage() {
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");
  const [noteTargetOrderId, setNoteTargetOrderId] = useState<string>(""); // New state for note target
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [showAddNote, setShowAddNote] = useState(false);
  const [newNote, setNewNote] = useState({ instructions: "", isUrgent: false });

  // Fetch orders with search and filter params
  const ordersParams: GetOrdersDto = useMemo(
    () => ({
      ...(searchQuery && { search: searchQuery }),
      ...(statusFilter !== "all" && { status: statusFilter }),
    }),
    [searchQuery, statusFilter]
  );

  const { data: ordersData, isLoading: ordersLoading } =
    useOrders(ordersParams);

  const addNotesMutation = useAddCustomerInstructions();

  // Get the order for note display (use noteTargetOrderId if adding note, otherwise selectedOrderId)
  const displayOrderId = showAddNote ? noteTargetOrderId : selectedOrderId;
  const { data: displayNotes, isLoading: displayNotesLoading } =
    useCustomerNotes(displayOrderId, !!displayOrderId);

  const toggleOrderExpansion = (orderId: string) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
      // If we're collapsing the selected order, clear selection
      if (orderId === selectedOrderId) {
        setSelectedOrderId("");
      }
    } else {
      newExpanded.add(orderId);
      setSelectedOrderId(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const handleAddNote = async () => {
    if (!noteTargetOrderId || !newNote.instructions.trim()) return;

    try {
      await addNotesMutation.mutateAsync({
        orderId: noteTargetOrderId,
        instructions: newNote,
      });
      setNewNote({ instructions: "", isUrgent: false });
      setShowAddNote(false);
      // Update the selected order to show the new note
      setSelectedOrderId(noteTargetOrderId);
    } catch (error) {
      console.error("Failed to add note:", error);
    }
  };

  const handleShowAddNote = () => {
    setShowAddNote(true);
    // Pre-select the currently selected order if available
    if (selectedOrderId) {
      setNoteTargetOrderId(selectedOrderId);
    }
  };

  const handleCancelAddNote = () => {
    setShowAddNote(false);
    setNoteTargetOrderId("");
    setNewNote({ instructions: "", isUrgent: false });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "urgent":
      case "high":
        return "text-red-600 bg-red-50";
      case "medium":
        return "text-yellow-600 bg-yellow-50";
      case "low":
        return "text-green-600 bg-green-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "text-yellow-700 bg-yellow-100";
      case "processing":
        return "text-blue-700 bg-blue-100";
      case "shipped":
        return "text-green-700 bg-green-100";
      case "delivered":
        return "text-green-800 bg-green-200";
      case "cancelled":
        return "text-red-700 bg-red-100";
      default:
        return "text-gray-700 bg-gray-100";
    }
  };

  // Get the selected order details for note target
  const selectedNoteTargetOrder = ordersData?.items?.find(
    (order: OrderResponse) => order.id === noteTargetOrderId
  );

  if (ordersLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Customer Notes
          </h1>
          <p className="text-gray-600">
            Manage customer instructions and notes for orders
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Orders List */}
          <div className="lg:col-span-2 space-y-4">
            {!ordersData?.items?.length ? (
              <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No orders found
                </h3>
                <p className="text-gray-500">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            ) : (
              ordersData.items.map((order: OrderResponse) => (
                <div
                  key={order.id}
                  className="bg-white rounded-lg shadow-sm border"
                >
                  <div
                    className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleOrderExpansion(order.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {expandedOrders.has(order.id) ? (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        )}
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            #{order.orderNumber}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {order.user.name}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}
                        >
                          {order.status}
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {formatCurrency(order.totalAmount)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {expandedOrders.has(order.id) && (
                    <div className="border-t p-4 bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">
                            Order Details
                          </h4>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p>
                              <span className="font-medium">Email:</span>{" "}
                              {order.user.email}
                            </p>
                            <p>
                              <span className="font-medium">Phone:</span>{" "}
                              {order.user.phone}
                            </p>
                            <p>
                              <span className="font-medium">Items:</span>{" "}
                              {order.orderItems.length}
                            </p>
                            <p>
                              <span className="font-medium">Created:</span>{" "}
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">
                            Shipping Address
                          </h4>
                          <div className="text-sm text-gray-600">
                            <p>{order.shippingAddress.recipientName}</p>
                            <p>{order.shippingAddress.street}</p>
                            <p>
                              {order.shippingAddress.city},{" "}
                              {order.shippingAddress.state}{" "}
                              {order.shippingAddress.postalCode}
                            </p>
                            <p>{order.shippingAddress.country}</p>
                          </div>
                        </div>
                      </div>

                      {order.notes && (
                        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                          <h5 className="font-medium text-blue-900 mb-1">
                            Order Notes
                          </h5>
                          <p className="text-sm text-blue-700">{order.notes}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Notes Panel */}
          <div className="space-y-6">
            {/* Add Note Form */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">
                  Add Customer Note
                </h3>
                <button
                  onClick={handleShowAddNote}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {showAddNote && (
                <div className="space-y-4">
                  {/* Order Selection Dropdown */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Order
                    </label>
                    <div className="relative">
                      <ShoppingCart className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <select
                        value={noteTargetOrderId}
                        onChange={(e) => setNoteTargetOrderId(e.target.value)}
                        className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                      >
                        <option value="">Choose an order...</option>
                        {ordersData?.items?.map((order: OrderResponse) => (
                          <option key={order.id} value={order.id}>
                            #{order.orderNumber} - {order.user.name} (
                            {formatCurrency(order.totalAmount)})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Selected Order Preview */}
                    {selectedNoteTargetOrder && (
                      <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">
                              #{selectedNoteTargetOrder.orderNumber}
                            </p>
                            <p className="text-sm text-gray-600">
                              {selectedNoteTargetOrder.user.name} •{" "}
                              {selectedNoteTargetOrder.user.email}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedNoteTargetOrder.status)}`}
                          >
                            {selectedNoteTargetOrder.status}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <textarea
                    value={newNote.instructions}
                    onChange={(e) =>
                      setNewNote({
                        ...newNote,
                        instructions: e.target.value,
                      })
                    }
                    placeholder="Enter customer instructions or notes..."
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />

                  <div className="flex items-center space-x-3">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newNote.isUrgent}
                        onChange={(e) =>
                          setNewNote({
                            ...newNote,
                            isUrgent: e.target.checked,
                          })
                        }
                        className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />
                      <span className="text-sm text-gray-700">
                        Mark as urgent
                      </span>
                    </label>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={handleAddNote}
                      disabled={
                        !noteTargetOrderId ||
                        !newNote.instructions.trim() ||
                        addNotesMutation.isPending
                      }
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {addNotesMutation.isPending ? "Adding..." : "Add Note"}
                    </button>
                    <button
                      onClick={handleCancelAddNote}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Existing Notes */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-4 border-b">
                <h3 className="font-semibold text-gray-900">
                  Customer Notes
                  {displayOrderId && (
                    <span className="text-sm font-normal text-gray-500 ml-2">
                      for #
                      {
                        ordersData?.items?.find(
                          (o: OrderResponse) => o.id === displayOrderId
                        )?.orderNumber
                      }
                    </span>
                  )}
                </h3>
              </div>

              <div className="p-4">
                {displayNotesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                ) : !displayNotes?.length ? (
                  <div className="text-center py-8">
                    <MessageSquare className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-gray-500 text-sm">
                      {displayOrderId
                        ? "No notes found for this order"
                        : "Select an order to view customer notes"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {displayNotes.map((note: CustomerNote) => (
                      <div key={note.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(note.priority)}`}
                            >
                              {note.priority}
                            </span>
                            <span className="text-xs text-gray-500 capitalize">
                              {note.type}
                            </span>
                          </div>

                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {new Date(note.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <p className="text-gray-900 mb-2">{note.content}</p>

                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <User className="h-3 w-3" />
                          <span>by {note.createdBy}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
