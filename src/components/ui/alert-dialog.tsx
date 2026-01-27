import React from "react";

export type AlertDialogProps = {
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	children?: React.ReactNode;
	className?: string;
};

export const AlertDialog: React.FC<AlertDialogProps> = ({ children }) => <>{children}</>;
export const AlertDialogTrigger: React.FC<React.PropsWithChildren<{ asChild?: boolean }>> = ({ children }) => <>{children}</>;
export const AlertDialogContent: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children }) => <>{children}</>;
export const AlertDialogHeader: React.FC<React.PropsWithChildren<{}>> = ({ children }) => <>{children}</>;
export const AlertDialogFooter: React.FC<React.PropsWithChildren<{}>> = ({ children }) => <>{children}</>;
export const AlertDialogTitle: React.FC<React.PropsWithChildren<{}>> = ({ children }) => <>{children}</>;
export const AlertDialogDescription: React.FC<React.PropsWithChildren<{}>> = ({ children }) => <>{children}</>;
export const AlertDialogAction: React.FC<React.PropsWithChildren<{ disabled?: boolean; onClick?: () => void; className?: string }>> = ({ children, onClick }) => (
	<button onClick={onClick as any}>{children}</button>
);
export const AlertDialogCancel: React.FC<React.PropsWithChildren<{ onClick?: () => void; className?: string }>> = ({ children, onClick }) => (
	<button onClick={onClick as any}>{children}</button>
);

export default AlertDialog;
