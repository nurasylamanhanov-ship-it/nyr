export type Permission = "Камера" | "Микрофон" | "Геолокация" | "Контакты";
export type AppInfo = {
  id: string;
  name: string;
  category: string;
  icon: string;
  color: string;
  bg: string;
  permissions: Permission[];
  risk: boolean;
};
export const apps: AppInfo[] = [
  {
    id: "instagram",
    name: "Instagram",
    category: "Социальные сети",
    icon: "instagram",
    color: "#AA5175",
    bg: "#F9EAF0",
    permissions: ["Камера", "Микрофон", "Геолокация", "Контакты"],
    risk: true,
  },
  {
    id: "telegram",
    name: "Telegram",
    category: "Общение",
    icon: "send",
    color: "#3286AE",
    bg: "#E9F4FA",
    permissions: ["Камера", "Микрофон", "Контакты"],
    risk: false,
  },
  {
    id: "maps",
    name: "Карты",
    category: "Навигация",
    icon: "map",
    color: "#54825E",
    bg: "#EBF4E9",
    permissions: ["Геолокация"],
    risk: false,
  },
  {
    id: "browser",
    name: "Браузер",
    category: "Инструменты",
    icon: "globe",
    color: "#7B6AAB",
    bg: "#F0ECF8",
    permissions: ["Камера", "Геолокация"],
    risk: true,
  },
  {
    id: "music",
    name: "Музыка",
    category: "Развлечения",
    icon: "music",
    color: "#A27A43",
    bg: "#F8F0E3",
    permissions: ["Микрофон"],
    risk: false,
  },
  {
    id: "camera",
    name: "Камера",
    category: "Фото и видео",
    icon: "camera",
    color: "#56616B",
    bg: "#ECF0F2",
    permissions: ["Камера", "Микрофон", "Геолокация"],
    risk: false,
  },
];
export const events = [
  {
    app: apps[0],
    permission: "Геолокация",
    time: "12:42",
    description: "Доступ в фоновом режиме",
    blocked: true,
  },
  {
    app: apps[1],
    permission: "Микрофон",
    time: "12:38",
    description: "Во время голосового звонка",
    blocked: false,
  },
  {
    app: apps[2],
    permission: "Геолокация",
    time: "12:15",
    description: "Во время использования",
    blocked: false,
  },
  {
    app: apps[3],
    permission: "Камера",
    time: "11:56",
    description: "Запрос от веб-сайта",
    blocked: true,
  },
  {
    app: apps[5],
    permission: "Камера",
    time: "11:30",
    description: "Во время использования",
    blocked: false,
  },
];
export const permissionIcons: Record<string, string> = {
  Камера: "camera",
  Микрофон: "mic",
  Геолокация: "map-pin",
  Контакты: "users",
};
