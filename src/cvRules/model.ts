

export interface ICVCorrections {
	commonCorrections: string[],
	projectCorrections: {
		[key: string]: {
			corrections: string[],
		}
	}
}
