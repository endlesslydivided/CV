import { CVData, Technologies } from "../parse/model";
import { checkJSSuffixeRules } from "./jsSuffix.rules";
import { ICVCorrections } from "./model";
import { checkPunctuation } from "./punctiation.rules";

interface IBeginCheckProps {
	cv: CVData,
	techsKeywords: Technologies,
	keywords: string[]
}

export const beginCheck = (props: IBeginCheckProps) => {
	const {
		cv,
		techsKeywords,
		keywords
	} = props;

	const corrections: ICVCorrections = {
		commonCorrections: [],
		projectCorrections: {}
	};

	cv.projects.forEach(project => {
		corrections.projectCorrections[project.name] = {
			corrections: []
		}
	})

	checkPunctuation({
		corrections,
		cv
	});

	checkJSSuffixeRules({
		corrections,
		cv
	})

	return corrections;
}
