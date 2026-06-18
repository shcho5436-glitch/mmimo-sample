document.addEventListener("DOMContentLoaded", () => {
  const meanings = {
    "복주머니": "복주머니를 고른 유주는 복과 행운이 가득한 아이로 자라날 거예요.",
    "축구공": "축구공을 고른 유주는 건강하고 활기찬 아이로 자라날 거예요.",
    "연필": "연필을 고른 유주는 지혜롭고 배움을 사랑하는 아이로 자라날 거예요.",
    "오만원": "오만원을 고른 유주는 풍요롭고 넉넉한 삶을 만들어갈 거예요.",
    "실타래": "실타래를 고른 유주는 오래오래 건강하고 평안하게 자라날 거예요.",
    "판사봉": "판사봉을 고른 유주는 바르고 멋진 리더로 자라날 거예요."
  };

  const resultBox = document.querySelector(".result");
  const resultTitle = resultBox ? resultBox.querySelector("strong") : null;
  const resultText = resultBox ? resultBox.querySelector("p") : null;

  function showResult(label) {
    if (!resultTitle || !resultText) return;

    resultTitle.textContent = `${label} 선택!`;
    resultText.textContent = meanings[label] || "유주가 어떤 첫 선택을 할지 함께 상상해보세요.";
  }

  // 기존 돌잡이 버튼 클릭 기능 유지
  document.querySelectorAll(".choice-grid button").forEach((button) => {
    button.addEventListener("click", () => {
      const img = button.querySelector("img");
      const label = button.dataset.choice || button.innerText.trim() || (img ? img.alt : "");

      document.querySelectorAll(".choice-grid button").forEach((btn) => {
        btn.classList.remove("active");
      });

      button.classList.add("active");
      showResult(label);
    });
  });

  // 메인 이미지 위 용품 드래그 기능
  const propsLayer = document.querySelector(".props");
  const face = document.querySelector(".face-img");
  const props = document.querySelectorAll(".props .prop");

  if (!propsLayer || !face || props.length === 0) {
    console.warn("드래그 기능을 위한 요소를 찾지 못했습니다.");
    return;
  }

  let activeProp = null;
  let pointerOffsetX = 0;
  let pointerOffsetY = 0;

  function getLabelFromProp(prop) {
    return prop.alt || prop.dataset.choice || "돌잡이 물건";
  }

  function snapToFaceCenter(prop) {
    const layerRect = propsLayer.getBoundingClientRect();
    const faceRect = face.getBoundingClientRect();
    const propRect = prop.getBoundingClientRect();

    const faceCenterX = faceRect.left + faceRect.width / 2;
    const faceCenterY = faceRect.top + faceRect.height / 2;

    const nextLeft = faceCenterX - layerRect.left - propRect.width / 2;
    const nextTop = faceCenterY - layerRect.top - propRect.height / 2;

    prop.classList.remove("dragging");
    prop.classList.add("snap-animate", "dropped");

    prop.style.left = `${nextLeft}px`;
    prop.style.top = `${nextTop}px`;
    prop.style.right = "auto";
    prop.style.bottom = "auto";

    window.setTimeout(() => {
      prop.classList.remove("snap-animate");
    }, 260);

    showResult(getLabelFromProp(prop));
  }

  props.forEach((prop) => {
    prop.addEventListener("pointerdown", (event) => {
      event.preventDefault();

      activeProp = prop;

      const propRect = prop.getBoundingClientRect();
      const layerRect = propsLayer.getBoundingClientRect();

      pointerOffsetX = event.clientX - propRect.left;
      pointerOffsetY = event.clientY - propRect.top;

      // 기존 bottom/right 기반 위치를 드래그 가능한 left/top px 위치로 변환
      prop.style.left = `${propRect.left - layerRect.left}px`;
      prop.style.top = `${propRect.top - layerRect.top}px`;
      prop.style.right = "auto";
      prop.style.bottom = "auto";

      prop.classList.add("dragging");
      prop.setPointerCapture(event.pointerId);
    });

    prop.addEventListener("pointermove", (event) => {
      if (activeProp !== prop) return;

      const layerRect = propsLayer.getBoundingClientRect();

      const nextLeft = event.clientX - layerRect.left - pointerOffsetX;
      const nextTop = event.clientY - layerRect.top - pointerOffsetY;

      prop.style.left = `${nextLeft}px`;
      prop.style.top = `${nextTop}px`;
    });

    prop.addEventListener("pointerup", (event) => {
      if (activeProp !== prop) return;

      try {
        prop.releasePointerCapture(event.pointerId);
      } catch (error) {
        // 일부 브라우저에서 이미 해제된 경우 무시
      }

      activeProp = null;
      snapToFaceCenter(prop);
    });

    prop.addEventListener("pointercancel", () => {
      if (activeProp !== prop) return;

      activeProp = null;
      prop.classList.remove("dragging");
    });
  });
});
