import type {ReactElement, Fiber} from "./types";

export const FiberTags = {
	FunctionComponent: "FunctionComponent",
	ClassComponent: "ClassComponent",
	HostRoot: "HostRoot",
	HostComponent: "HostComponent",
	HostText: "HostText",
};

export const FiberFlags = {
	NoFlags: 0,
	PerformedWork: 1,
	Placement: 2,
	Update: 4,
	Deletion: 16,
};

export function FiberNode(
	tag: string,
	type: ReactElement["type"],
	props: any,
): Fiber {
	return {
		tag,
		type,
		props,
		stateNode: null,
		return: null,
		child: null, // First child
		sibling: null,
		alternate: null,
		flags: null,
		hooks: [],
	};
}

export function createFiber(
	type: ReactElement["type"],
	props: ReactElement["props"],
): Fiber {
	let fiberTag;
	if (type instanceof Function) {
		fiberTag = FiberTags.FunctionComponent;
	} else if (type === "TEXT_ELEMENT") {
		fiberTag = FiberTags.HostText;
	} else if (typeof type === "string") {
		fiberTag = FiberTags.HostComponent;
	} else {
		throw new Error("Invalid element type");
	}

	return FiberNode(fiberTag, type, props);
}

// Priority: child > sibling > uncle
export function getNextFiber(fiber: Fiber): Fiber | null {
	if (fiber.child) {
		return fiber.child;
	}
	let nextFiber: Fiber | null = fiber;
	while (nextFiber) {
		if (nextFiber.sibling) {
			return nextFiber.sibling;
		}
		nextFiber = nextFiber.return;
	}
	return nextFiber;
}

export function getParentWithHostComponent(fiber: Fiber): Fiber {
	let parent: Fiber = fiber.return!;
	while (!parent.stateNode) {
		parent = parent.return!;
	}
	return parent;
}

export function getChildWithHostComponent(fiber: Fiber): Fiber {
	let child: Fiber = fiber;
	while (!child.stateNode) {
		child = fiber.child!;
	}
	return child;
}
