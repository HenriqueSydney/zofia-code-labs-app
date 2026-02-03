import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/utils/twMerge";

type Size = "large" | "medium" | "small" | "tiny";

interface IUserAvatar {
  userName?: string | null;
  image?: string | null;
  size?: Size;
}
export function UserAvatar({ userName, image, size = "large" }: IUserAvatar) {
  const userNames = userName
    ? userName.split(" ")
    : ["Usuário", "Desconhecido"];
  const fallbackAvatar = `${userNames[0].charAt(0)} ${
    ["large", "medium"].includes(size)
      ? (userNames[userNames.length - 1].charAt(0) ?? "")
      : ""
  }`.toUpperCase();

  const sizes: Record<Size, string> = {
    large: "w-32 h-32",
    medium: "w-24 h-24",
    small: "w-12 h-12",
    tiny: "w-8 h-8",
  };

  const textSizes: Record<Size, string> = {
    large: "text-4xl",
    medium: "text-3xl",
    small: "text-2xl",
    tiny: "text-1xl",
  };

  if (!image) {
    return (
      <div
        className={cn(
          "flex items-center justify-center text-white font-bold border-4 border-white shadow-lg",
          "rounded-full bg-gradient-to-br from-blue-400 to-indigo-500",
          sizes[size],
          textSizes[size],
        )}
      >
        {fallbackAvatar}
      </div>
    );
  }

  return (
    <Avatar
      className={cn(
        "bg-primary cursor-pointer border-2 border-primary",
        "rounded-full bg-gradient-to-br from-blue-400 to-indigo-500",
        "flex items-center justify-center text-white font-bold border-4 border-white shadow-lg",
        sizes[size],
      )}
    >
      <AvatarImage
        src={image}
        alt={`${userName} avatar`}
        className={sizes[size]}
      />
      <AvatarFallback>{fallbackAvatar}</AvatarFallback>
    </Avatar>
  );
}
