'use strict';

const path = require('path');
const globby = require('globby');
const denodeify = require('util').promisify;
const readFile = denodeify(require('fs-extra').readFile);

async function constructBrowserDeps() {
	const dependencies = await globby(['bower_components/*/origami.json', 'origami.json']);
	const requiredFeatures = [];
	await Promise.all(dependencies.map(async dependency => {
		if (dependency.startsWith('/')) {
			dependency = dependency.substr(1);
		}
		const origami = JSON.parse(await readFile(path.resolve(dependency), 'utf-8'));
		if (origami.browserFeatures && origami.browserFeatures.required) {
			requiredFeatures.push(...origami.browserFeatures.required);
		}
	}));

	const features = Array.from(new Set(requiredFeatures));
	if (features.length > 0) {
		return `https://polyfill.io/v3/polyfill.min.js?features=,${features.join(',')}&flags=gated&unknown=polyfill`;
	} else {
		return 'https://polyfill.io/v3/polyfill.min.js?flags=gated&unknown=polyfill';
	}
}

module.exports = constructBrowserDeps;
