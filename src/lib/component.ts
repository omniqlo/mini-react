export class Component<P = any> {
	props: P;
	constructor(props: P) {
		this.props = props;
	}
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
Component.prototype.isReactComponent = {};

export function isClassComponent(component: any) {
	const {prototype} = component;
	return !!(prototype && prototype.isReactComponent);
}
