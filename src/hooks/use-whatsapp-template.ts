import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getWhatsAppTemplatesAction,
  sendWhatsAppTemplateAction,
} from "@/lib/channels/whatsapp-template/whatsapp-template.actions";
import {
  getConversationsNeedingTemplateAction,
  getConversationsWithTemplateStatusAction,
  sendReengagementTemplateAction,
  bulkSendReengagementTemplatesAction,
  type ConversationWithTemplateStatus,
} from "@/lib/conversations/conversation.actions";
import { tags } from "@/lib/shared/constants";
import type {
  TemplateQueryDto,
  SendTemplateDto,
} from "@/lib/channels/dto/whatsapp-template.dto";
import { TemplateData } from "@/lib/channels/types/whatsapp-template.types";

export interface TemplateAnalytics {
  totalConversations: number;
  needingTemplate: number;
  canSendTemplate: number;
  averageHoursSinceLastMessage: number;
  conversationsByHours: Array<{
    range: string;
    count: number;
  }>;
}

export function useWhatsAppTemplates(query?: TemplateQueryDto) {
  return useQuery({
    queryKey: [tags.WHATSAPP_TEMPLATE, query],
    queryFn: async () => {
      const result = await getWhatsAppTemplatesAction(query);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

export function useConversationsNeedingTemplate(hoursThreshold: number = 23) {
  return useQuery({
    queryKey: [tags.CONVERSATION, "needing-template", hoursThreshold],
    queryFn: async () => {
      const result =
        await getConversationsNeedingTemplateAction(hoursThreshold);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    refetchInterval: 30000,
  });
}

export function useConversationsWithTemplateStatus(
  query?: string,
  hoursThreshold: number = 23
) {
  return useQuery({
    queryKey: [
      tags.CONVERSATION,
      "with-template-status",
      query,
      hoursThreshold,
    ],
    queryFn: async () => {
      const result = await getConversationsWithTemplateStatusAction(
        query,
        hoursThreshold
      );
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
  });
}

export function useSendReengagementTemplate() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      conversationId,
      templateData,
    }: {
      conversationId: string;
      templateData: SendTemplateDto;
    }) => {
      const result = await sendReengagementTemplateAction({
        conversationId,
        templateData,
      });
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      toast.success("Template sent successfully!");
      queryClient.invalidateQueries({ queryKey: [tags.CONVERSATION] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to send template: ${error.message}`);
      // console.log("you")
    },
  });

  return {
    sendTemplate: mutation.mutate,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
}

export function useBulkSendReengagementTemplates() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      templateData,
      conversationIds,
      hoursThreshold = 23,
    }: {
      templateData: Omit<SendTemplateDto, "to">;
      conversationIds?: string[];
      hoursThreshold?: number;
    }) => {
      const result = await bulkSendReengagementTemplatesAction(
        templateData,
        conversationIds,
        hoursThreshold
      );
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: (data: {
      successful: string[];
      failed: { id: string; error: string }[];
    }) => {
      const { successful, failed } = data;

      if (successful.length > 0) {
        toast.success(
          `Successfully sent templates to ${successful.length} conversation${successful.length !== 1 ? "s" : ""}`
        );
      }

      if (failed.length > 0) {
        toast.error(
          `Failed to send templates to ${failed.length} conversation${failed.length !== 1 ? "s" : ""}`
        );
      }

      queryClient.invalidateQueries({ queryKey: [tags.CONVERSATION] });
    },
    onError: (error: Error) => {
      toast.error(`Bulk send failed: ${error.message}`);
    },
  });

  return {
    bulkSendTemplates: mutation.mutate,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
}

export function useTemplateAnalytics(hoursThreshold: number = 23) {
  return useQuery<TemplateAnalytics, Error>({
    queryKey: [tags.CONVERSATION, "template-analytics", hoursThreshold],
    queryFn: async () => {
      const conversationsResult =
        await getConversationsWithTemplateStatusAction("", hoursThreshold);
      if (!conversationsResult.success)
        throw new Error(conversationsResult.error);

      const conversations = conversationsResult.data.results;
      const needingTemplate = conversations.filter(
        (c: ConversationWithTemplateStatus) => c.needsTemplate
      );
      const canSendTemplate = conversations.filter(
        (c: ConversationWithTemplateStatus) => c.canSendTemplate
      );

      const hoursData = needingTemplate
        .filter(
          (c: ConversationWithTemplateStatus) =>
            c.hoursSinceLastMessage !== null
        )
        .map((c: ConversationWithTemplateStatus) => c.hoursSinceLastMessage!);

      const averageHours =
        hoursData.length > 0
          ? hoursData.reduce((sum: number, hours: number) => sum + hours, 0) /
            hoursData.length
          : 0;

      const hourRange = [
        {
          range: "23-48 hours",
          count: hoursData.filter((h: number) => h >= 23 && h <= 48).length,
        },
      ];

      return {
        totalConversations: conversations.length,
        needingTemplate: needingTemplate.length,
        canSendTemplate: canSendTemplate.length,
        averageHoursSinceLastMessage: averageHours,
        conversationsByHours: hourRange,
      };
    },
  });
}

export function useSendTemplateSuggestion() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      conversationId,
      templateData,
    }: {
      conversationId: string;
      templateData: SendTemplateDto;
    }) => {
      if (!templateData.to) {
        throw new Error("Recipient phone number is required");
      }
      if (!templateData.templateName) {
        throw new Error("Template name is required");
      }
      if (!templateData.templateText) {
        throw new Error("Template text is required");
      }
      if (!templateData.languageCode) {
        throw new Error("Language code is required");
      }

      const payload: SendTemplateDto = {
        to: templateData.to,
        templateName: templateData.templateName,
        templateText: templateData.templateText,
        languageCode: templateData.languageCode,
      };

      console.log("Template payload:", payload);

      const result = await sendWhatsAppTemplateAction(conversationId, payload);

      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      toast.success("Template sent successfully!");
      queryClient.invalidateQueries({ queryKey: [tags.CONVERSATION] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to send template: ${error.message}`);
      console.log("you1");
    },
  });

  return {
    sendTemplateSuggestion: mutation.mutate,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
}

export const buildSendTemplateDto = ({
  templateData,
  variables,
  to,
  // userId,
  // token,
  languageCode = "en",
}: {
  templateData: TemplateData;
  variables: Record<string, string>;
  to: string;
  userId?: string;
  token?: string;
  languageCode?: string;
}): SendTemplateDto => {
  // Only format components if they have parameters (variables)
  // let components: any[] | undefined;

  // if (templateData.components && templateData.components.length > 0) {
  //   const componentsWithParams = templateData.components
  //     .map((component, componentIndex) => {
  //       // Only include component if it has parameters
  //       if (component.parameters && component.parameters.length > 0) {
  //         const parameters = component.parameters.map((param, paramIndex) => {
  //           const variableKey = `${componentIndex}-${paramIndex}`;
  //           const variableValue = variables[variableKey] || '';

  //           return {
  //             type: param.type,
  //             text: variableValue,
  //           };
  //         });

  //         return {
  //           type: component.type,
  //           parameters: parameters,
  //         };
  //       }

  //       return null;
  //     })
  //     .filter(Boolean); // Remove null values

  //   // if (componentsWithParams.length > 0) {
  //   //   components = componentsWithParams;
  //   // }
  // }

  // Generate template text
  const templateText = generateTemplateTextFromData(templateData, variables);

  // Build the DTO
  const dto: SendTemplateDto = {
    to,
    templateName: templateData.name,
    templateText,
    languageCode,
  };
  return dto;
};

// Helper function to generate template text
const generateTemplateTextFromData = (
  templateData: TemplateData,
  variables: Record<string, string>
): string => {
  if (!templateData.components || templateData.components.length === 0) {
    return templateData.name;
  }

  let text = "";

  templateData.components.forEach((component, componentIndex) => {
    if (component.text) {
      let componentText = component.text;

      // Replace placeholder variables with actual values
      component.parameters?.forEach((param, paramIndex) => {
        const key = `${componentIndex}-${paramIndex}`;
        const value = variables[key] || "";

        const placeholder = `{{${paramIndex + 1}}}`;
        componentText = componentText.replace(placeholder, value);
      });

      text += componentText + "\n";
    }
  });

  return text.trim() || templateData.name;
};
