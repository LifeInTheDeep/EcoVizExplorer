export const listToString = (list) => {
  if (list.length === 1) return list[0];
  if (list.length === 2) return list[0] + " and " + list[1];
  const lastElement = list[list.length - 1];
  const listWithoutLastElement = list.slice(0, -1);
  return listWithoutLastElement.join(", ") + ", and " + lastElement;
};
