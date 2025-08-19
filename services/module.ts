import { BASE_URL } from "@/constants/config";
import { getAuthHeaders } from "./authHeaders";

interface Module {
  name: string;
  label: string;
}

// Module data
export const getModuleData = async (): Promise<Module[]> => {
  const headers = await getAuthHeaders();

  const response = await fetch(
    `${BASE_URL}/api/resource/Module%20Def?limit_page_length=None`,
    {
      headers,
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch module data");
  }

  const result = await response.json();
  return result.data;
};
