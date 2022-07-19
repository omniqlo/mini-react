import {reconciler} from "./lib/reconciler";
import type {ReactElement, DOMHostConfig} from "./lib/types";

const isEvent = (name: string) => name.startsWith("on");
const isProp = (name: string) => !isEvent(name) && name !== "children";
const getEventType = (name: string) => name.toLowerCase().substring(2);

// https://github.com/facebook/react/blob/main/packages/react-reconciler/README.md#an-incomplete-reference
const domHostConfig: DOMHostConfig = {
	createInstance(type, props) {
		const el = document.createElement(type) as any;

		// Add properties
		Object.keys(props)
			.filter(isProp)
			.forEach((name) => {
				if (name === "style") {
					Object.entries(props[name]).forEach(([k, v]) => {
						el.style[k] = v;
					});
				} else {
					el[name] = props[name];
				}
			});

		// Add event listeners
		Object.keys(props)
			.filter(isEvent)
			.forEach((name) => {
				el.addEventListener(getEventType(name), props[name]);
			});

		return el;
	},

	createTextInstance(text) {
		return document.createTextNode(text);
	},

	appendChild(parentInstance, child) {
		parentInstance.appendChild(child);
	},

	removeChild(parentInstance, child) {
		parentInstance.removeChild(child);
	},

	commitUpdate(instance, oldProps, newProps) {
		// Remove event listeners
		Object.keys(oldProps)
			.filter(isEvent)
			.forEach((name) => {
				instance.removeEventListener(getEventType(name), oldProps[name]);
			});

		// Remove properties
		Object.keys(oldProps)
			.filter(isProp)
			.forEach((name) => {
				instance[name] = "";
			});

		// Add properties
		Object.keys(newProps)
			.filter(isProp)
			.forEach((name) => {
				if (name === "style") {
					Object.entries(newProps[name]).forEach(([k, v]) => {
						instance.style[k] = v;
					});
				} else {
					instance[name] = newProps[name];
				}
			});

		// Add event listeners
		Object.keys(newProps)
			.filter(isEvent)
			.forEach((name) => {
				instance.addEventListener(getEventType(name), newProps[name]);
			});
	},
};

const domRenderer = reconciler(domHostConfig);

export function createRoot(container: Element) {
	if (!container) {
		throw new Error("Target container is not a DOM element");
	}

	const root = domRenderer.createContainer(container);

	function render(element: ReactElement) {
		domRenderer.updateContainer(element, root);
	}

	return {
		render,
	};
}
