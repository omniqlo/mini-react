// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import * as React from "../src/react";
import * as ReactDOM from "../src/react-dom";

function App() {
	const [count, setCount] = React.useState(0);

	return (
		<div>
			<h1>{count}</h1>
			<button type="button" onClick={() => setCount(count + 1)}>
				Increment
			</button>
			<button type="button" onClick={() => setCount(count - 1)}>
				Decrement
			</button>
		</div>
	);
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<App />,
);
