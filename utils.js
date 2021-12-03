export const randomColor = () => Math.floor(Math.random() * 16777215).toString(16);

export const randomNumbers = (maxNumber) => Math.floor(Math.random() * maxNumber);

export const filterItems = (needle, heystack) => {
  const query = needle.toLowerCase();
  return heystack.filter((item) => item.name.toLowerCase().indexOf(query) >= 0);
};
