const buttons = document.querySelectorAll(".choice-grid button");
const resultTitle = document.getElementById("resultTitle");
const resultDesc = document.getElementById("resultDesc");

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    buttons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");

    const title = button.dataset.title;
    const desc = button.dataset.desc;

    resultTitle.textContent = `${title}을(를) 선택하면?`;
    resultDesc.textContent = desc;
  });
});
