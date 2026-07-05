import { useContext } from "react";
import { PermissionsContext } from "./PermissionProvider";

export const useAuthorization = () => {
  const context = useContext(PermissionsContext);
  if (context === undefined) {
    throw new Error("useAuthorization must be used within a PermissionProvider");
  }
  return context;
};
