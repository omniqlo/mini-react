import {
	FiberTags,
	FiberFlags,
	FiberNode,
	createFiber,
	getNextFiber,
	getParentWithHostComponent,
	getChildWithHostComponent,
} from "./fiber";
import type {ReactElement, Action, Hook, Fiber, DOMHostConfig} from "./types";

let hostConfig: DOMHostConfig;
let nextUnitOfWork: Fiber | null = null;
let currentRoot: Fiber | null = null;
let wipRoot: Fiber | null = null;
let deletions: Fiber[] = [];

let wipFiber: Fiber | null = null;
let hookIndex: number;

export function reconciler(__hostConfig: DOMHostConfig) {
	hostConfig = __hostConfig;
	return {createContainer, updateContainer};
}

function createContainer(containerInfo: Element) {
	return {containerInfo};
}

function updateContainer(
	element: ReactElement,
	container: ReturnType<typeof createContainer>,
): void {
	wipRoot = FiberNode(FiberTags.HostRoot, null as any, {children: [element]});
	wipRoot.stateNode = container.containerInfo;
	wipRoot.alternate = currentRoot;
	console.log("Render phase");
	nextUnitOfWork = wipRoot;
}

function commitRoot(): void {
	console.log("Commit phase");
	if (deletions.length > 0) {
		deletions.forEach(commitDeletion);
		deletions = [];
	}
	if (wipRoot?.child) {
		commitWork(wipRoot.child);
		currentRoot = wipRoot;
		wipRoot = null;
	}
	console.log("---");
}

function commitDeletion(fiber: Fiber): void {
	if (fiber.flags === FiberFlags.Deletion) {
		const parent = getParentWithHostComponent(fiber);
		const child = getChildWithHostComponent(fiber);
		hostConfig.removeChild(parent.stateNode, child.stateNode);
	}
}

function commitWork(fiber: Fiber): void {
	if (fiber.stateNode) {
		if (fiber.flags === FiberFlags.Placement) {
			const parent = getParentWithHostComponent(fiber);
			hostConfig.appendChild(parent.stateNode, fiber.stateNode);
		} else if (fiber.flags === FiberFlags.Update && fiber.alternate) {
			hostConfig.commitUpdate(
				fiber.stateNode,
				fiber.alternate.props,
				fiber.props,
			);
		}
	}

	if (fiber.child) {
		commitWork(fiber.child);
	}
	if (fiber.sibling) {
		commitWork(fiber.sibling);
	}
}

function workLoop(deadline: IdleDeadline): void {
	let shouldYield = false;
	while (nextUnitOfWork && !shouldYield) {
		nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
		if (deadline.timeRemaining() < 1) {
			shouldYield = true;
		}
	}

	if (!nextUnitOfWork && wipRoot) {
		commitRoot();
	}

	requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);

function performUnitOfWork(fiber: Fiber): Fiber | null {
	if (fiber.type instanceof Function) {
		// Function component
		wipFiber = fiber;
		wipFiber.hooks = [];
		hookIndex = 0;
		const children = fiber.type(fiber.props);
		reconcileChildren(fiber, [children]);
	} else {
		// Host component
		if (!fiber.stateNode) {
			fiber.stateNode =
				fiber.type === "TEXT_ELEMENT"
					? hostConfig.createTextInstance(fiber.props.nodeValue as any)
					: hostConfig.createInstance(fiber.type, fiber.props);
		}
		reconcileChildren(fiber, fiber.props.children as any);
	}

	return getNextFiber(fiber);
}

function reconcileChildren(parent: Fiber, elements: ReactElement[]): void {
	let index = 0;
	let oldFiber: Fiber | null = parent.alternate?.child || null;
	let prevSibling: Fiber | null = null;

	while (index < elements.length || oldFiber) {
		const element = elements[index++];
		const newFiber = getNewFiber(parent, oldFiber, element);

		if (oldFiber) {
			oldFiber = oldFiber.sibling;
		}

		if (!prevSibling) {
			parent.child = newFiber;
		} else {
			prevSibling.sibling = newFiber;
		}
		prevSibling = newFiber;
	}
}

function getNewFiber(
	parent: Fiber,
	oldFiber: Fiber | null,
	element: ReactElement | undefined,
): Fiber | null {
	let newFiber: Fiber | null = null;

	const canReuseFiber = oldFiber && element && oldFiber.type === element.type;

	if (canReuseFiber) {
		// Update
		newFiber = {
			...oldFiber,
			props: element.props,
			return: parent,
			alternate: oldFiber,
			flags: FiberFlags.Update,
		};
	} else {
		if (element) {
			// Create
			newFiber = createFiber(element.type, element.props);
			newFiber.return = parent;
			newFiber.flags = FiberFlags.Placement;
		}

		if (oldFiber) {
			// Remove
			oldFiber.flags = FiberFlags.Deletion;
			deletions.push(oldFiber);
		}
	}

	return newFiber;
}

export function useState<T = any>(
	initialState: T,
): [T, (action: Action<T>) => void] {
	const oldHook = wipFiber?.alternate?.hooks?.[hookIndex++] as
		| Hook<T>
		| undefined;
	const hook: Hook<T> = oldHook || {
		state: initialState,
		queue: [],
	};

	// Update hook.state if needed (when queue is non empty)
	oldHook?.queue?.forEach((action) => {
		hook.state = action instanceof Function ? action(hook.state) : action;
	});

	function setState(action: Action<T>) {
		// Queue the action for next render cycle
		hook.queue.push(action);
		wipRoot = {
			...(currentRoot as Fiber),
			alternate: currentRoot,
		};
		console.log("Render phase");
		nextUnitOfWork = wipRoot;
	}

	wipFiber?.hooks?.push(hook);

	return [hook.state, setState];
}
