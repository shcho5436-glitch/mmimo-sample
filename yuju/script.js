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

  const baby = document.querySelector(".baby");
  const propsLayer = document.querySelector(".props");
  const props = document.querySelectorAll(".props .prop");

  let activeProp = null;
  let heldProp = null;
  let pointerOffsetX = 0;
  let pointerOffsetY = 0;

  function showResult(label) {
    if (!resultTitle || !resultText) return;

    resultTitle.textContent = `${label} 선택!`;
    resultText.textContent = meanings[label] || "유주가 어떤 첫 선택을 할지 함께 상상해보세요.";
  }

  function triggerCelebration() {
    if (!baby) return;

    baby.classList.remove("celebrating");
    void baby.offsetWidth;
    baby.classList.add("celebrating");
  }

  function getLabelFromProp(prop) {
    return prop.alt || prop.dataset.choice || "돌잡이 물건";
  }

  function saveHomePosition(prop) {
    if (!propsLayer || !prop) return;

    const layerRect = propsLayer.getBoundingClientRect();
    const propRect = prop.getBoundingClientRect();

    prop.dataset.homeLeft = String(propRect.left - layerRect.left);
    prop.dataset.homeTop = String(propRect.top - layerRect.top);
  }

  function saveAllHomePositions() {
    props.forEach((prop) => {
      if (!prop.classList.contains("dragging") && !prop.classList.contains("real-held-prop")) {
        saveHomePosition(prop);
      }
    });
  }

  function returnPropHome(prop) {
    if (!prop) return;

    const homeLeft = Number(prop.dataset.homeLeft || 0);
    const homeTop = Number(prop.dataset.homeTop || 0);

    prop.classList.remove("dragging", "returning", "real-held-prop");
    prop.classList.add("returning");

    prop.style.left = `${homeLeft}px`;
    prop.style.top = `${homeTop}px`;
    prop.style.right = "auto";
    prop.style.bottom = "auto";

    window.setTimeout(() => {
      prop.classList.remove("returning");
    }, 300);
  }

  function returnPreviousHeldProp(exceptProp) {
    if (heldProp && heldProp !== exceptProp) {
      returnPropHome(heldProp);
    }
  }

  function movePropToLeftHand(prop) {
    if (!prop || !propsLayer || !baby) return;

    returnPreviousHeldProp(prop);

    const layerRect = propsLayer.getBoundingClientRect();
    const babyRect = baby.getBoundingClientRect();
    const propRect = prop.getBoundingClientRect();

    /*
      실제 물품을 왼손 위치로 보내는 기준값.
      정밀 위치는 여기 숫자만 바꾸면 됨.

      handXRatio:
      0.18 = 더 왼쪽
      0.24 = 현재
      0.30 = 더 오른쪽

      handYRatio:
      0.25 = 더 위
      0.34 = 현재
      0.43 = 더 아래
    */
    const handXRatio = 0.20;
    const handYRatio = 0.28;

    const handCenterX = babyRect.left + babyRect.width * handXRatio;
    const handCenterY = babyRect.top + babyRect.height * handYRatio;

    const nextLeft = handCenterX - layerRect.left - propRect.width / 2;
    const nextTop = handCenterY - layerRect.top - propRect.height / 2;

    prop.classList.remove("dragging", "returning");
    prop.classList.add("real-held-prop");

    prop.style.left = `${nextLeft}px`;
    prop.style.top = `${nextTop}px`;
    prop.style.right = "auto";
    prop.style.bottom = "auto";

    heldProp = prop;
  }

  document.querySelectorAll(".choice-grid button").forEach((button) => {
    button.addEventListener("click", () => {
      const img = button.querySelector("img");
      const label = button.dataset.choice || button.innerText.trim() || (img ? img.alt : "");

      document.querySelectorAll(".choice-grid button").forEach((btn) => {
        btn.classList.remove("active");
      });

      button.classList.add("active");

      const sourceProp = Array.from(props).find((prop) => getLabelFromProp(prop) === label);

      if (sourceProp) {
        movePropToLeftHand(sourceProp);
      }

      showResult(label);
      triggerCelebration();
    });
  });

  if (!propsLayer || props.length === 0) {
    console.warn("드래그 기능을 위한 물품 레이어를 찾지 못했습니다.");
    return;
  }

  window.requestAnimationFrame(saveAllHomePositions);
  window.addEventListener("load", saveAllHomePositions);
  window.addEventListener("resize", saveAllHomePositions);

  props.forEach((prop) => {
    prop.addEventListener("pointerdown", (event) => {
      event.preventDefault();

      activeProp = prop;

      const propRect = prop.getBoundingClientRect();
      const layerRect = propsLayer.getBoundingClientRect();

      pointerOffsetX = event.clientX - propRect.left;
      pointerOffsetY = event.clientY - propRect.top;

      prop.style.left = `${propRect.left - layerRect.left}px`;
      prop.style.top = `${propRect.top - layerRect.top}px`;
      prop.style.right = "auto";
      prop.style.bottom = "auto";

      prop.classList.remove("returning", "real-held-prop");
      prop.classList.add("dragging");

      if (heldProp === prop) {
        heldProp = null;
      }

      try {
        prop.setPointerCapture(event.pointerId);
      } catch (error) {}
    });

    prop.addEventListener("pointermove", (event) => {
      if (activeProp !== prop) return;

      const layerRect = propsLayer.getBoundingClientRect();

      prop.style.left = `${event.clientX - layerRect.left - pointerOffsetX}px`;
      prop.style.top = `${event.clientY - layerRect.top - pointerOffsetY}px`;
    });

    prop.addEventListener("pointerup", (event) => {
      if (activeProp !== prop) return;

      try {
        prop.releasePointerCapture(event.pointerId);
      } catch (error) {}

      activeProp = null;

      const label = getLabelFromProp(prop);

      movePropToLeftHand(prop);
      showResult(label);
      triggerCelebration();
    });

    prop.addEventListener("pointercancel", () => {
      if (activeProp !== prop) return;

      activeProp = null;
      returnPropHome(prop);
    });
  });
});

