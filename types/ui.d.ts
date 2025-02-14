declare module "@/components/ui/dropdown-menu" {
  import * as React from "react";
  import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";

  export const DropdownMenu: React.FC<DropdownMenuPrimitive.DropdownMenuProps>;
  export const DropdownMenuTrigger: React.ForwardRefExoticComponent<
    DropdownMenuPrimitive.DropdownMenuTriggerProps &
      React.RefAttributes<HTMLButtonElement>
  >;
  export const DropdownMenuContent: React.ForwardRefExoticComponent<
    DropdownMenuPrimitive.DropdownMenuContentProps &
      React.RefAttributes<HTMLDivElement>
  >;
  export const DropdownMenuItem: React.ForwardRefExoticComponent<
    DropdownMenuPrimitive.DropdownMenuItemProps &
      React.RefAttributes<HTMLDivElement>
  >;
}
