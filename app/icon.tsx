import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: "#0F172A",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
          <path d="M16 14H30V18H20V22H28V26H20V34H16V14Z" fill="white" />
          <path d="M32 14H36V34H26V30H32V14Z" fill="white" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
