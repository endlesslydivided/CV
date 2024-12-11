import { technologies } from "./requirements.parser";

const clouds = technologies['Clouds'];

export const unprefixedClouds = clouds?.map(item => item.replace(/(AWS|Azure|GCP|Heroku|DigitalOcean|Salesforce)\s{1}/,''));
