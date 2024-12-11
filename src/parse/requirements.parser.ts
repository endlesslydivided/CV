import * as fs from 'fs';
import { Technologies, Keywords } from './model';
import path from 'path';

const staticDir = path.join(__dirname, '..', '..', 'src', 'static');

export const technologies: Technologies = JSON.parse(fs.readFileSync(path.join(staticDir, 'technologies.json'), 'utf-8'));
export const keywords: Keywords = JSON.parse(fs.readFileSync(path.join(staticDir, 'keywords.json'), 'utf-8'));

export const findMatches = (text: string): string[] => {
	const matches: string[] = [];

	const regex = new RegExp(`[^a-zA-Z](${keywords.join('|')})[^a-zA-Z]`, 'gi');

	let match: RegExpExecArray | null;
	while ((match = regex.exec(text)) !== null) {
		matches.push(match[1].toLowerCase());
	}

	return [...new Set(matches)];
};

export const escapeRegExp = (string: string): string => {
	return string.replace(/[.*+?^=!:#${}()|\[\]\/\\]/g, "\\$&");
}

export const findTechnologies = (text: string): Technologies => {
	const matches: { [category: string]: string[] } = {};


	Object.keys(technologies).forEach(category => {
		const categoryMatches: string[] = [];
		technologies[category].forEach(tech => {
			const regex = new RegExp('\\b' + escapeRegExp(tech) + '\\b', 'gi');
			if (regex.test(text)) {
				categoryMatches.push(tech);
			}
		});

		if (categoryMatches.length > 0) {
			matches[category] = categoryMatches;
		}
	});

	return matches;
}
