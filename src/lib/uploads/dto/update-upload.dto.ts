import { CreateUploadDto } from "./create-upload.dto";

export type UpdateUploadDto = Partial<CreateUploadDto> & { id: string };
