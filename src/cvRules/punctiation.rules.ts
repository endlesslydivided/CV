import { CVData } from "../parse/model";
import { ICVCorrections } from "./model";

interface ICheckPunctuationProps {
	cv: CVData,
	corrections: ICVCorrections,
}

export const checkPunctuation = (props: ICheckPunctuationProps) => {
	checkSemicolumns(props);
}

const checkSemicolumns = ({ cv, corrections }: ICheckPunctuationProps) => {
	const projects = cv.projects;

	projects.forEach(project => {
		const resps = project.responsibilities;
		resps.forEach((str) => {
			if (!str.endsWith(';')) {
				corrections.projectCorrections[project.name].corrections.push(
					`${str} - должна быть ; в конце`
				)
			}
		});

		if (resps.length > 0) {
			const finalResp = resps[resps.length - 1];
			if (!finalResp.endsWith('.')) {
				corrections.projectCorrections[project.name].corrections.push(
					`${finalResp} - должна быть . в конце`
				)
			}
		}
	})

}
