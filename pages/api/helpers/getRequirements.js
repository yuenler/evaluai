import requirements from './data/requirements'

const getRequirements = (concentration) => {
  return requirements[concentration];
}

export default getRequirements;
