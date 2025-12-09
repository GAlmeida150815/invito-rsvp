// mobile/services/api.ts

const API_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("A variável EXPO_PUBLIC_API_URL não está definida no .env");
}

export const fetchEvent = async (code: string) => {
  try {
    const response = await fetch(`${API_URL}/api/events/${code}`);
    return await response.json();
  } catch (error) {
    console.error("Erro ao conectar à API:", error);
    return null;
  }
};
