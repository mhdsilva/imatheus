/** Public assets must follow the deployment base, including GitHub project URLs. */
export const assetPath = (name: string) =>
  `${import.meta.env.BASE_URL}assets/${name}.png`;
