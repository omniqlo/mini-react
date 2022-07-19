const {resolve} = require("path");

module.exports = {
	"*": "prettier --ignore-unknown --write",
	"*.{js,jsx,ts,tsx}": "eslint --fix",
	"package.json": (files) =>
		files
			.map((file) => [`cd ${resolve(file, "..")}`, 'sh -c "fixpack || true"'])
			.flat(),
};
