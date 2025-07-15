type Subject =
  | "User"
  | "Role"
  | "UserDevice"
  | "ActivityLog"
  | "AuditTrail"
  | "VerificationToken"
  | "Category"
  | "Product"
  | "CustomizationOption"
  | "CustomizationOptionValue"
  | "Design"
  | "DesignTemplate"
  | "DesignApproval"
  | "DesignAsset"
  | "DesignPreset"
  | "Canvas"
  | "Font"
  | "Cart"
  | "CartItem"
  | "Order"
  | "OrderItem"
  | "OrderNote"
  | "CheckoutSession"
  | "Customer"
  | "CustomerTag"
  | "Address"
  | "ShippingZone"
  | "ShippingRate"
  | "Payment"
  | "BulkOrder"
  | "BulkOrderItem"
  | "EmailTemplate"
  | "EmailLog"
  | "NotificationPreference"
  | "NotificationTemplate"
  | "EscalationRule"
  | "Media"
  | "MediaFolder"
  | "Upload"
  | "UploadFolder"
  | "BehaviorPattern"
  | "CalculationSchedule"
  | "Pattern"
  | "Station"
  | "Match"
  | "Summary"
  | "Metric";

export type Permission =
  | "*"
  | `${Subject}:create`
  | `${Subject}:read`
  | `${Subject}:update`
  | `${Subject}:delete`;

export type PermissionAction = "create" | "read" | "update" | "delete";

export interface PermissionDetails {
  subject: Subject;
  action: PermissionAction;
  description: string;
  dependencies?: {
    action: PermissionAction;
    subject: Subject;
  }[];
}
