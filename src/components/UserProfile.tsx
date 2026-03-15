"use client";

import Image from "next/image";

interface UserProfileProps {
  name: string;
  imageUrl: string;
  profileUrl: string;
}

export default function UserProfile({ name, imageUrl, profileUrl }: UserProfileProps) {
  return (
    <a
      href={profileUrl}
      target="_blank"
      rel="noreferrer"
      className="flex h-[38px] max-w-full items-center justify-end gap-[14px] rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E4841]/30 sm:w-[177px]"
      aria-label={`Open ${name} profile`}
    >
      <div className="text-right">
        <p className="text-base font-semibold leading-[19px] text-[#1E4841] hover:underline">{name}</p>
      </div>

      <div className="h-[38px] w-[38px] overflow-hidden rounded-full bg-[#BBF49C]">
        <Image
          src={imageUrl}
          alt={`${name} profile photo`}
          width={38}
          height={38}
          className="h-full w-full object-cover"
          priority
        />
      </div>
    </a>
  );
}
