export const fireEvent = (link: string) => {
  const a = document.createElement("a");
  a.href = link;
  a.target = "_blank";

  a.dispatchEvent(
    new window.MouseEvent("click", {
      view: window,
      bubbles: true,
      cancelable: true,
    }),
  );
};
