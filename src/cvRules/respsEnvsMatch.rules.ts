import { CVData } from "../parse/model";
import { escapeRegExp, technologies } from "../parse/requirements.parser";
import { ICVCorrections } from "./model";

interface ICheckRespsEnvsMatch {
	cv: CVData,
	corrections: ICVCorrections,
}

export const checkRespsEnvsMatch= (props: ICheckRespsEnvsMatch) => {
	checkMatch(props);
}


const checkMatch = ({ cv, corrections }: ICheckRespsEnvsMatch) => {
	const projects = cv.projects;

	projects.forEach(project => {
		const respsTechs = project.techsFromResps;
		const unparsedEnv = project.environmentUnparsed;

		const regexpsRules = respsTechs.map(item =>{
			return {
				value: item,
				regexp: new RegExp(`(?<=^|\\s|\\,|\\()${escapeRegExp(item)}(?=$|\\s|\\,|\\)|\\.)`,'ig')
			}
		})

		regexpsRules.forEach((rule) => {
			if(!rule.regexp.test(unparsedEnv)) {
				corrections.projectCorrections[project.name].corrections.push(
					`<span style='color:red'>Добавить ${rule.value} в Environment</span>`
				)
			}
		});
	})
}