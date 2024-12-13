import { CVData } from "../parse/model";
import { escapeRegExp } from "../parse/requirements.parser";
import { ICVCorrections } from "./model";

const JS_LOST_SUFFIXES = {
	"Node JS": "Node",
	"React JS": "React",
	"Vue JS": "Vue",
	"Express JS": "Express",
	"D3 JS": "D3",
	"Nest JS": "Nest",
	"Next JS": "Next",
	"Web3 JS": "Web3",
}

const ALIKE_TECHS = {
	"React-router-dom": "React JS",
	"React Query": "React JS",
	"Next Auth": "Next JS",
	"i18next": "Next JS",
}

const JS_SUFFIXES = {
	"Node JS": "Node.js",
	"React JS": "React.js",
	"Vue JS": "Vue.js",
	"Nest JS": "Nest.js",
	"Express JS": "Express.js",
	"D3 JS": "D3.js",
	"Next JS": "Next.js",
	"JQuery": "JQuery.js",
	"Web3 JS": "Web3.js",
	"Ethers JS": "Ethers.js",
	"Bitcoin JS": "Bitcoin.js",
	"Ethereum JS": "Ethereum.js",
	"Truffle JS": "Truffle.js",
	"Chainlink JS": "Chainlink.js",
	"IPFS JS": "IPFS.js",
	"Moralis JS": "Moralis.js",
	"Solidity JS": "Solidity.js",
}

interface ICheckJSSuffix {
	cv: CVData,
	corrections: ICVCorrections,
}

export const checkJSSuffixeRules = (props: ICheckJSSuffix) => {
	checkIncorrectJSSuffix(props);
	checkLostJSSuffix(props);
}


const checkIncorrectJSSuffix = ({ cv, corrections }: ICheckJSSuffix) => {
	const projects = cv.projects;

	const regexpsRules = Object.entries(JS_SUFFIXES).map(item =>{
		return {
			key: item[0],
			value: item[1],
			regexp: new RegExp(`\\b${escapeRegExp(item[1])}\\b`,'i')
		}
	})

	projects.forEach(project => {
		const resps = project.responsibilities;
		resps.forEach((str,index) => {
			regexpsRules.forEach((rule) => {
				if(rule.regexp.test(str)) {
					corrections.projectCorrections[project.name].corrections.push(
						`${str} - <span style='color:red'>заменить ${rule.value} на ${rule.key}</span>`
					)
				}
			})
		});
	})

	regexpsRules.forEach((rule) => {
		if(rule.regexp.test(cv.summary)) {
			corrections.commonCorrections.push(
				`${cv.summary} - <span style='color:red'>заменить ${rule.value} на ${rule.key}</span>`
			)
		}
	})

}

const checkLostJSSuffix = ({ cv, corrections }: ICheckJSSuffix) => {
	const projects = cv.projects;

	const regexpsRules = Object.entries(JS_LOST_SUFFIXES).map(item =>{
		return {
			key: item[0],
			value: item[1],
			regexp: new RegExp(`\\b${item[1]}(?!\\sJS|\\s\.js)\\b`,'i')
		}
	})

	projects.forEach(project => {
		const resps = project.responsibilities;
		resps.forEach((str,index) => {
			regexpsRules.forEach((rule) => {
				if(rule.regexp.test(str)) {
					const alikeRegexp = Object.entries(ALIKE_TECHS)
					.filter(item => item[1] === rule.key)
					.map(item => new RegExp(`\\b${item[0]}\\b`,'i'));
					console.log('alikeRegexp',alikeRegexp)
					if(alikeRegexp.some(rule => rule.test(str))) {
						return;
					}
					corrections.projectCorrections[project.name].corrections.push(
						`${str} - <span style='color:red'>добавить JS к ${rule.value}</span>`
					)
				}
			})
		});
	})

	regexpsRules.forEach((rule) => {
		if(rule.regexp.test(cv.summary)) {
			corrections.commonCorrections.push(
				`${cv.summary} - <span style='color:red'>добавить JS к ${rule.value}</span>`
			)
		}
	})

}
