import { API_KEY, API_SECRET, BASE_URL } from "@/constants/config";

interface Module {
  name: string;
  label: string;
}

// Module data
export const getModuleData = async (): Promise<Module[]> => {
  const response = await fetch(
    `${BASE_URL}/api/resource/Module%20Def?limit_page_length=None`,
    {
      headers: {
        Authorization: `token ${API_KEY}:${API_SECRET}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch module data");
  }

  const result = await response.json();
  return result.data;
};
