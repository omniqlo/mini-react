import type {ReactNode, ReactElement} from "./types";

const isValidChild = (child: ReactNode): boolean =>
	child instanceof Object ||
	typeof child === "string" ||
	typeof child === "number";

export function createElement(
	type: ReactElement["type"],
	props: Record<string, any> | null,
	...children: ReactNode[] | ReactNode[][]
): ReactElement {
	const element: ReactElement = {
		type,
		props: {
			...props,
			children: children
				.flat()
				.filter(isValidChild)
				.map((child) =>
					child instanceof Object
						? child
						: {
								type: "TEXT_ELEMENT",
								props: {children: [], nodeValue: child},
						  },
				),
		},
	};

	if (Object.freeze) {
		Object.freeze(element.props.children);
		Object.freeze(element.props);
		Object.freeze(element);
	}

	return element;
}
