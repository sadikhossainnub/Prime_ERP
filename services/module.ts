import { apiRequest } from "./api";

interface Module {
  name: string;
  label: string;
}

// Module data
export const getModuleData = async (): Promise<Module[]> => {
  const response = await apiRequest('Module Def?fields=["name","label"]&filters=[["disabled","=",0]]');
  return response.data;
};
