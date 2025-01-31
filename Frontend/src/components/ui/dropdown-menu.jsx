import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

export const DropdownMenuRoot = DropdownMenu.Root;
export const DropdownMenuTrigger = DropdownMenu.Trigger;
export const DropdownMenuContent = DropdownMenu.Content;
export const DropdownMenuItem = DropdownMenu.Item;
export const DropdownMenuSeparator = DropdownMenu.Separator;

// Optionally export a default component wrapper for convenience
const DropdownMenuComponent = ({ children, ...props }) => {
  return <DropdownMenu.Root {...props}>{children}</DropdownMenu.Root>;
};

export default DropdownMenuComponent;
