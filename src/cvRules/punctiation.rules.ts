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
		resps.forEach((str,index) => {
			if (!str.endsWith(';') && index !== resps.length - 1) {
				corrections.projectCorrections[project.name].corrections.push(
					`${str} - <span style='color:red'>должна быть ; в конце</span>`
				)
			}
		});

		if (resps.length > 0) {
			const finalResp = resps[resps.length - 1];
			if (!finalResp.endsWith('.')) {
				corrections.projectCorrections[project.name].corrections.push(
					`${finalResp} - <span style='color:red'> должна быть . в конце</span>`
				)
			}
		}
	})

}
