import { StaticImageData } from "next/image";

export type StaticLogo = {
  src: {
    light: StaticImageData;
    dark: StaticImageData;
  };
  alt: string;
  width: number;
  height: number;
};
