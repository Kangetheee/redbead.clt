export enum LegalTypeEnum {
  PRIVACY_POLICY = "PRIVACY_POLICY",
  TERMS_OF_SERVICE = "TERMS_OF_SERVICE",
}

export type Legal = {
  id: string;
  type: LegalTypeEnum;
  content: string;
  updatedAt: string;
};
