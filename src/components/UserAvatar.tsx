import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/utils/twMerge";

interface IUserAvatar {
  userName?: string | null;
  image?: string | null;
  size?: "large" | "medium" | "small";
}
export function UserAvatar({ userName, image, size = "large" }: IUserAvatar) {
  const userNames = userName
    ? userName.split(" ")
    : ["Usuário", "Desconhecido"];
  const fallbackAvatar = `${userNames[0].charAt(0)} ${
    size !== "small" ? userNames[userNames.length - 1].charAt(0) ?? "" : ""
  }`.toUpperCase();

  const sizes: Record<"large" | "medium" | "small", string> = {
    large: "w-32 h-32",
    medium: "w-24 h-24",
    small: "w-12 h-12",
  };

  if (!image) {
    return (
      <div
        className={cn(
          "flex items-center justify-center text-white text-4xl font-bold border-4 border-white shadow-lg",
          "rounded-full bg-gradient-to-br from-blue-400 to-indigo-500",
          sizes[size]
        )}
      >
        {fallbackAvatar}
      </div>
    );
  }
  return (
    <Avatar className="w-32 h-32 bg-primary cursor-pointer border-2 border-primary">
      <AvatarImage src={image} alt={`${userName} avatar`} />
      <AvatarFallback>{fallbackAvatar}</AvatarFallback>
    </Avatar>
  );
}
