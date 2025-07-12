type Subject =
  | "User"
  | "Role"
  | "Client"
  | "ClientRelationship"
  | "Channel"
  | "Interaction"
  | "Question"
  | "QuestionAnswer"
  | "Bot"
  | "BotQuestionFlow"
  | "Conversation"
  | "Message"
  | "Underwriter"
  | "InsurancePlan"
  | "Recommendation"
  | "Feedback"
  | "AITrainingData"
  | "NotificationPreference"
  | "ActivityLog"
  | "AuditTrail"
  | "AiAgent"
  | "AiModel"
  | "Legal"
  | "WebsiteEnquiry"
  | "Faq"
  | "InsuranceType";

export type Permission =
  | "*"
  | `${Subject}:create`
  | `${Subject}:read`
  | `${Subject}:update`
  | `${Subject}:delete`;
