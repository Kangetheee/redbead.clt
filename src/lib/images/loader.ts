"use client";

type Props = {
  src: string;
  width: number;
  quality: number;
};

export default function cloudfrontLoader({ src, width, quality }: Props) {
  const distribution = process.env.NEXT_PUBLIC_CLOUDFRONT_URL!;

  const imageSrc = src.includes(distribution)
    ? src
    : `https://${distribution}${src}`;

  const url = new URL(imageSrc);
  url.searchParams.set("format", "auto");
  url.searchParams.set("width", width.toString());
  url.searchParams.set("quality", (quality || 75).toString());
  return url.href;
}
