export type ReactNode =
	| ReactElement
	| string
	| number
	| boolean
	| null
	| undefined;

export type ReactElementProps = {
	[key: string]: any;
	children: ReactNode[];
};

export type ReactElement = {
	type: ((props: ReactElementProps) => ReactElement) | string;
	props: ReactElementProps;
};

export type Action<T = any> = T | ((state: T) => T);

export type Hook<T = any> = {
	state: T;
	queue: Action<T>[];
};

export type Fiber = {
	tag: string;
	type: ReactElement["type"];
	props: ReactElementProps;
	stateNode: any;
	return: Fiber | null;
	child: Fiber | null; // First child
	sibling: Fiber | null;
	alternate: Fiber | null;
	flags: number | null;
	hooks: Hook[];
};

export type HostConfig<HostNode, TextNode> = {
	createInstance: (type: string, props: ReactElementProps) => HostNode;
	createTextInstance: (text: string) => TextNode;
	appendChild: (parentInstance: HostNode, child: HostNode | TextNode) => void;
	removeChild: (parentInstance: HostNode, child: HostNode | TextNode) => void;
	commitUpdate: (
		instance: any,
		oldProps: ReactElementProps,
		newProps: ReactElementProps,
	) => void;
};

export type DOMHostConfig = HostConfig<Element, Text>;
