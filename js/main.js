(() => {
  let yOffset = 0; // window.pageYOffset 대신 쓸 변수, 현재 스크롤한 위치, 몇 픽셀을 스크롤했는지
  let prevScrollHeight = 0; // 현재 스크롤 위치(yOffset)보다 이전에 위치한 스크롤 섹션들의 스크롤 높이값의 합
  let currentScene = 0; // 현재 활성화된(누 앞에 보고 있는) 씬(scroll-section)
  let enterNewScene = false; // 새로운 scene이 시작되는 순간 true가 된다
  let acc = 0.1;
  let delayedYOffset = 0;
  let rafId;
  let rafState;

  // 각 scene에 대한 정보가 있는 객체
  const sceneInfo = [
    {
      // 0
      type: 'sticky',
      heightNum: 5, // 브라우저 높이의 5배로 scrollHeight를 세팅한다
      scrollHeight: 0,
      objs: {
        container: document.querySelector('#scroll-section-0'),
        messageA: document.querySelector('#scroll-section-0 .main-message.a'),
        messageB: document.querySelector('#scroll-section-0 .main-message.b'),
        messageC: document.querySelector('#scroll-section-0 .main-message.c'),
        messageD: document.querySelector('#scroll-section-0 .main-message.d'),
        canvas: document.querySelector('#vidoe-canvas-0'),
        context: document.querySelector('#vidoe-canvas-0').getContext('2d'),
        videoImages: [],
      }, // DOM 객체 요소
      values: {
        videoImageCount: 300,
        imageSequence: [0, 299], // 특정 구간이 아닌 처음부터 끝까지 재생되기 때문에 start, end 없다
        canvas_opacity: [1, 0, { start: 0.9, end: 1 }], // scene이 끝날 때 사라지도록 값 설정
        messageA_opacity_in: [0, 1, { start: 0.1, end: 0.2 }], // 전체 스크롤의 비율을 1로 봤을 때의 비율
        messageB_opacity_in: [0, 1, { start: 0.3, end: 0.4 }],
        messageC_opacity_in: [0, 1, { start: 0.5, end: 0.6 }],
        messageD_opacity_in: [0, 1, { start: 0.7, end: 0.8 }],
        messageA_translateY_in: [20, 0, { start: 0.1, end: 0.2 }],
        messageB_translateY_in: [20, 0, { start: 0.3, end: 0.4 }],
        messageC_translateY_in: [20, 0, { start: 0.5, end: 0.6 }],
        messageD_translateY_in: [20, 0, { start: 0.7, end: 0.8 }],
        messageA_opacity_out: [1, 0, { start: 0.25, end: 0.3 }],
        messageB_opacity_out: [1, 0, { start: 0.45, end: 0.5 }],
        messageC_opacity_out: [1, 0, { start: 0.65, end: 0.7 }],
        messageD_opacity_out: [1, 0, { start: 0.85, end: 0.9 }],
        messageA_translateY_out: [0, -20, { start: 0.25, end: 0.3 }],
        messageB_translateY_out: [0, -20, { start: 0.45, end: 0.5 }],
        messageC_translateY_out: [0, -20, { start: 0.65, end: 0.7 }],
        messageD_translateY_out: [0, -20, { start: 0.85, end: 0.9 }],
      },
    },

    {
      // 1
      type: 'normal',
      // heightNum: 5, // normal 에서는 필요 없음
      scrollHeight: 0,
      objs: {
        container: document.querySelector('#scroll-section-1'),
      },
    },

    {
      // 2
      type: 'sticky',
      heightNum: 5,
      scrollHeight: 0,
      objs: {
        container: document.querySelector('#scroll-section-2'),
        messageA: document.querySelector('#scroll-section-2 .a'),
        messageB: document.querySelector('#scroll-section-2 .b'),
        messageC: document.querySelector('#scroll-section-2 .c'),
        pinB: document.querySelector('#scroll-section-2 .b .pin'),
        pinC: document.querySelector('#scroll-section-2 .c .pin'),
        canvas: document.querySelector('#vidoe-canvas-1'),
        context: document.querySelector('#vidoe-canvas-1').getContext('2d'),
        videoImages: [],
      },
      values: {
        videoImageCount: 960,
        imageSequence: [0, 959],
        canvas_opacity_in: [0, 1, { start: 0, end: 0.1 }],
        canvas_opacity_out: [1, 0, { start: 0.95, end: 1 }],
        messageA_translateY_in: [20, 0, { start: 0.15, end: 0.2 }],
        messageB_translateY_in: [30, 0, { start: 0.5, end: 0.55 }],
        messageC_translateY_in: [30, 0, { start: 0.72, end: 0.77 }],
        messageA_opacity_in: [0, 1, { start: 0.15, end: 0.2 }],
        messageB_opacity_in: [0, 1, { start: 0.5, end: 0.55 }],
        messageC_opacity_in: [0, 1, { start: 0.72, end: 0.77 }],
        messageA_translateY_out: [0, -20, { start: 0.3, end: 0.35 }],
        messageB_translateY_out: [0, -20, { start: 0.58, end: 0.63 }],
        messageC_translateY_out: [0, -20, { start: 0.85, end: 0.9 }],
        messageA_opacity_out: [1, 0, { start: 0.3, end: 0.35 }],
        messageB_opacity_out: [1, 0, { start: 0.58, end: 0.63 }],
        messageC_opacity_out: [1, 0, { start: 0.85, end: 0.9 }],
        pinB_scaleY: [0.5, 1, { start: 0.5, end: 0.55 }],
        pinC_scaleY: [0.5, 1, { start: 0.72, end: 0.77 }],
        pinB_opacity_in: [0, 1, { start: 0.5, end: 0.55 }],
        pinC_opacity_in: [0, 1, { start: 0.72, end: 0.77 }],
        pinB_opacity_out: [1, 0, { start: 0.58, end: 0.63 }],
        pinC_opacity_out: [1, 0, { start: 0.85, end: 0.9 }],
      },
    },

    {
      // 3
      type: 'sticky',
      heightNum: 5,
      scrollHeight: 0,
      objs: {
        container: document.querySelector('#scroll-section-3'),
        canvasCaption: document.querySelector('.canvas-caption'),
        canvas: document.querySelector('.image-blend-canvas'),
        context: document.querySelector('.image-blend-canvas').getContext('2d'),
        imagesPath: [
          './images/blend-image-1.jpg',
          './images/blend-image-2.jpg',
        ],
        images: [],
      },
      values: {
        rect1X: [0, 0, { start: 0, end: 0 }], // 왼쪽 X 좌표, 미리 정할 수 없기에 0으로 일단 세팅
        rect2X: [0, 0, { start: 0, end: 0 }], // 오른쪽 X 좌표
        blendHeight: [0, 0, { start: 0, end: 0 }], // 두번째 보여질 이미지
        canvas_scale: [0, 0, { start: 0, end: 0 }],
        canvasCaption_opacity: [0, 1, { start: 0, end: 0 }],
        canvasCaption_translateY: [20, 0, { start: 0, end: 0 }],
        rectStartY: 0,
      },
    },
  ];

  function setCanvasImage() {
    let imgElem;
    for (let i = 0; i < sceneInfo[0].values.videoImageCount; i++) {
      imgElem = new Image();
      imgElem.src = `./video/001/IMG_${6726 + i}.JPG`;
      sceneInfo[0].objs.videoImages.push(imgElem);
    }

    let imgElem2;
    for (let i = 0; i < sceneInfo[2].values.videoImageCount; i++) {
      imgElem2 = new Image();
      imgElem2.src = `./video/002/IMG_${7027 + i}.JPG`;
      sceneInfo[2].objs.videoImages.push(imgElem2);
    }

    let imgElem3;
    for (let i = 0; i < sceneInfo[3].objs.imagesPath.length; i++) {
      imgElem3 = new Image();
      imgElem3.src = sceneInfo[3].objs.imagesPath[i];
      sceneInfo[3].objs.images.push(imgElem3);
    }
  }

  function checkMenu() {
    // yOffset = window.pageYOffset, 현재 스크롤 된 위치
    if (yOffset > 44) {
      document.body.classList.add('local-nav-sticky');
    } else {
      document.body.classList.remove('local-nav-sticky');
    }
  }

  function setLayoyt() {
    // 각 스크롤 섹션의 높이 세팅

    for (let i = 0; i < sceneInfo.length; i++) {
      if (sceneInfo[i].type === 'sticky') {
        sceneInfo[i].scrollHeight = sceneInfo[i].heightNum * window.innerHeight;
      } else if (sceneInfo[i].type === 'normal') {
        sceneInfo[i].scrollHeight = sceneInfo[i].objs.container.offsetHeight;
      }
      sceneInfo[
        i
      ].objs.container.style.height = `${sceneInfo[i].scrollHeight}px`;
    }

    // 새로고침했을 때 현재 섹션에 맞는 id 값을 body에 설정해주기 위해
    yOffset = window.pageYOffset;
    let totalScrollHeight = 0;
    for (let i = 0; i < sceneInfo.length; i++) {
      totalScrollHeight += sceneInfo[i].scrollHeight;
      if (totalScrollHeight >= yOffset) {
        currentScene = i;
        break;
      }
    }
    document.body.setAttribute('id', `show-scene-${currentScene}`);

    const heightRatio = window.innerHeight / 1080; // 윈도우의 창 높이 / 원래 캔버스 높이
    // console.log(heightRatio);, 창크기에 맞는 비율을 구해주고. 그 비율에 맞게 scale을 키워준다.
    sceneInfo[0].objs.canvas.style.transform = `translate3d(-50%, -50%, 0) scale(${heightRatio})`;
    sceneInfo[2].objs.canvas.style.transform = `translate3d(-50%, -50%, 0) scale(${heightRatio})`;

    /**
     * css의 .sticky-elem-canvas canvas 를 통해서 top 50%, left 50%으로 이동시킨 상태이다
     * translate에서의 %는, 내 자신의 크기가 기준이 된다
     * 만약 폭 1000px 높이 1000px인 요소라면
     * translate(-50%, -50%)는 픽셀로 한다면  translate(-500px, -500px)이 된다.
     *
     */
  }

  setLayoyt();

  function scrollLoop() {
    enterNewScene = false;
    // console.log(window.pageYOffset); // 현재 스크롤한 위치, 몇 픽셀을 스크롤했는지
    // 2번섹션 또는 3번 섹션이 언제 시작되는지는, 얼마나 스크롤을 했는지, 이전 스크롤을 얼마나 했는지를 통해서 알 수 있다

    prevScrollHeight = 0;

    for (let i = 0; i < currentScene; i++) {
      prevScrollHeight += sceneInfo[i].scrollHeight;
    }

    // 스크롤이 내려갈 때
    // 현재 스클로한 위치가 이전 섹션까지 스크롤 높이 값의 합과 현재 섹션의 스크롤 값을 합한 것 보다 큰 경우, 씬이 바뀐다
    if (
      delayedYOffset >
      prevScrollHeight + sceneInfo[currentScene].scrollHeight
    ) {
      enterNewScene = true;
      currentScene++;
      document.body.setAttribute('id', `show-scene-${currentScene}`);
    }

    if (delayedYOffset < prevScrollHeight) {
      enterNewScene = true;

      // safari의 경우, 첫번째 씬에서 위로 스크롤 할 때 - 가 될 수도 있기 때문
      // 즉, 브라우저 바운스 효과로 인해 마이너스가 되는 것을 방지 (모바일)
      if (currentScene === 0) return;
      currentScene--;
      document.body.setAttribute('id', `show-scene-${currentScene}`);
    }

    if (enterNewScene) return;

    /**
     * enterNewScene 사용하는 이유
     *
     * 대부분의 브라우저에서는 0에서 멈추게 되는데요, 강의에서 이야기한 것 처럼 일부 브라우저에서
     * 맨 위로 갔을 때 바운싱 효과 때문에 0보다 더 위로 간 것으로 인식이 되어,
     * 첫번째 씬에서 더 위로 갔다고 판정이 나오면 그런 경우에 마이너스가 나올 수 있어서 안전장치를 해 준 것이랍니다.
     *
     * 즉, playAnimation 함수에서 messageA_opacity_in 값이 음수가 나오는 경우가 있는데 이를 방지하기 위함이다
     */

    playAnimation();
  }

  function calcValues(values, currentYOffset) {
    // values는 opacity 변화의 시작값과 끝값이 있는 배열
    // currentYOffset는 현재 씬에서 얼마나 스크롤 되었는지에 대한 값
    let rv;

    // 현재 씬(스크롤섹션)에서 스크롤 된 범위를 비율로 구하기
    const scrollHeight = sceneInfo[currentScene].scrollHeight;
    const scrollRatio = currentYOffset / scrollHeight; // 현재 씬(스크롤섹션)에서 스크롤 된 범위의 비율 값

    if (values.length === 3) {
      // start ~ end 사이에 애니메이션 실행
      // 즉, start ~ end 사이에서 글자가 서서히 분명해진다
      // 만약 start ~ end 지정되지 않으면, value[0], value[1] 사이에서 글자가 서서히 분명해진다
      const partScrollStart = values[2].start * scrollHeight;
      const partScrollEnd = values[2].end * scrollHeight;
      const partScrollHeight = partScrollEnd - partScrollStart;

      if (
        currentYOffset >= partScrollStart &&
        currentYOffset <= partScrollEnd
      ) {
        rv =
          ((currentYOffset - partScrollStart) / partScrollHeight) *
            (values[1] - values[0]) +
          values[0];
        // (currentYOffset - partScrollStart) / partScrollHeight) : start ~ end 사이의 구간에서 얼마나 진행되었는지 구하기 위한 것
      } else if (currentYOffset < partScrollStart) {
        rv = values[0];
      } else if (currentYOffset > partScrollEnd) {
        rv = values[1];
      }
    } else {
      // 구간이 정해지지 않은 경우
      rv = scrollRatio * (values[1] - values[0]) + values[0]; // 값의 전체 범위에 곱해주고 초기값을 더해준다
    }

    return rv;
  }

  function playAnimation() {
    const objs = sceneInfo[currentScene].objs;
    const values = sceneInfo[currentScene].values;
    const currentYOffset = yOffset - prevScrollHeight; // currentYOffset는 현재 씬에서 얼마나 스크롤 되었는지에 대한 값

    const scrollHeight = sceneInfo[currentScene].scrollHeight;
    const scrollRatio = currentYOffset / scrollHeight; //  현재 씬에서 얼마나 스크롤 되었는지에 대한 비율

    switch (currentScene) {
      case 0:
        // let sequence = Math.round(
        //   calcValues(values.imageSequence, currentYOffset)
        // );
        // objs.context.drawImage(objs.videoImages[sequence], 0, 0);
        objs.canvas.style.opacity = calcValues(
          values.canvas_opacity,
          currentYOffset
        );

        if (scrollRatio <= 0.22) {
          // in
          objs.messageA.style.opacity = calcValues(
            values.messageA_opacity_in,
            currentYOffset
          );
          objs.messageA.style.transform = `translate3d(${calcValues(
            values.messageA_translateY_in,
            currentYOffset
          )}%)`;
          // translate3d처럼 3d가 붙어 있으면 하드웨어 가속이 보정이된다
          // 즉 퍼포먼스가 좋다
          // 따라서 애플에서도 3d 이동이 아니더라도 translate3d 사용해서 translateY에서 translate3d로 수정해주었다
        } else {
          // out
          objs.messageA.style.opacity = calcValues(
            values.messageA_opacity_out,
            currentYOffset
          );
          objs.messageA.style.transform = `translate3d(${calcValues(
            values.messageA_translateY_out,
            currentYOffset
          )}%)`;
        }

        if (scrollRatio <= 0.42) {
          // in
          objs.messageB.style.opacity = calcValues(
            values.messageB_opacity_in,
            currentYOffset
          );
          objs.messageB.style.transform = `translate3d(0, ${calcValues(
            values.messageB_translateY_in,
            currentYOffset
          )}%, 0)`;
        } else {
          // out
          objs.messageB.style.opacity = calcValues(
            values.messageB_opacity_out,
            currentYOffset
          );
          objs.messageB.style.transform = `translate3d(0, ${calcValues(
            values.messageB_translateY_out,
            currentYOffset
          )}%, 0)`;
        }

        if (scrollRatio <= 0.62) {
          // in
          objs.messageC.style.opacity = calcValues(
            values.messageC_opacity_in,
            currentYOffset
          );
          objs.messageC.style.transform = `translate3d(0, ${calcValues(
            values.messageC_translateY_in,
            currentYOffset
          )}%, 0)`;
        } else {
          // out
          objs.messageC.style.opacity = calcValues(
            values.messageC_opacity_out,
            currentYOffset
          );
          objs.messageC.style.transform = `translate3d(0, ${calcValues(
            values.messageC_translateY_out,
            currentYOffset
          )}%, 0)`;
        }

        if (scrollRatio <= 0.82) {
          // in
          objs.messageD.style.opacity = calcValues(
            values.messageD_opacity_in,
            currentYOffset
          );
          objs.messageD.style.transform = `translate3d(0, ${calcValues(
            values.messageD_translateY_in,
            currentYOffset
          )}%, 0)`;
        } else {
          // out
          objs.messageD.style.opacity = calcValues(
            values.messageD_opacity_out,
            currentYOffset
          );
          objs.messageD.style.transform = `translate3d(0, ${calcValues(
            values.messageD_translateY_out,
            currentYOffset
          )}%, 0)`;
        }

        break;
      case 1:
        break;
      case 2:
        // let sequence2 = Math.round(
        //   calcValues(values.imageSequence, currentYOffset)
        // );
        // objs.context.drawImage(objs.videoImages[sequence2], 0, 0);

        if (scrollRatio <= 0.5) {
          // in
          objs.canvas.style.opacity = calcValues(
            values.canvas_opacity_in,
            currentYOffset
          );
        } else {
          // out
          objs.canvas.style.opacity = calcValues(
            values.canvas_opacity_out,
            currentYOffset
          );
        }

        if (scrollRatio <= 0.25) {
          // in
          objs.messageA.style.opacity = calcValues(
            values.messageA_opacity_in,
            currentYOffset
          );
          objs.messageA.style.transform = `translate3d(0, ${calcValues(
            values.messageA_translateY_in,
            currentYOffset
          )}%, 0)`;
        } else {
          // out
          objs.messageA.style.opacity = calcValues(
            values.messageA_opacity_out,
            currentYOffset
          );
          objs.messageA.style.transform = `translate3d(0, ${calcValues(
            values.messageA_translateY_out,
            currentYOffset
          )}%, 0)`;
        }

        if (scrollRatio <= 0.57) {
          // in
          objs.messageB.style.transform = `translate3d(0, ${calcValues(
            values.messageB_translateY_in,
            currentYOffset
          )}%, 0)`;
          objs.messageB.style.opacity = calcValues(
            values.messageB_opacity_in,
            currentYOffset
          );
          objs.pinB.style.transform = `scaleY(${calcValues(
            values.pinB_scaleY,
            currentYOffset
          )})`;
        } else {
          // out
          objs.messageB.style.transform = `translate3d(0, ${calcValues(
            values.messageB_translateY_out,
            currentYOffset
          )}%, 0)`;
          objs.messageB.style.opacity = calcValues(
            values.messageB_opacity_out,
            currentYOffset
          );
          objs.pinB.style.transform = `scaleY(${calcValues(
            values.pinB_scaleY,
            currentYOffset
          )})`;
        }

        if (scrollRatio <= 0.83) {
          // in
          objs.messageC.style.transform = `translate3d(0, ${calcValues(
            values.messageC_translateY_in,
            currentYOffset
          )}%, 0)`;
          objs.messageC.style.opacity = calcValues(
            values.messageC_opacity_in,
            currentYOffset
          );
          objs.pinC.style.transform = `scaleY(${calcValues(
            values.pinC_scaleY,
            currentYOffset
          )})`;
        } else {
          // out
          objs.messageC.style.transform = `translate3d(0, ${calcValues(
            values.messageC_translateY_out,
            currentYOffset
          )}%, 0)`;
          objs.messageC.style.opacity = calcValues(
            values.messageC_opacity_out,
            currentYOffset
          );
          objs.pinC.style.transform = `scaleY(${calcValues(
            values.pinC_scaleY,
            currentYOffset
          )})`;
        }

        // currentScene 3에서 쓰는 캔버스를 미리 그려주기 시작

        if (scrollRatio > 0.9) {
          const objs = sceneInfo[3].objs;
          const values = sceneInfo[3].values;
          const widthRatio = window.innerWidth / objs.canvas.width;
          const heightRatio = window.innerHeight / objs.canvas.height;
          let canvasScaleRatio;

          // 비율에 따라 캔버스의 크기 조절을 해준다
          // 어떤 경우에도 캔버스가 브라우저에 꽉 차게 해주기 위해서
          if (widthRatio <= heightRatio) {
            // 캔버스보다 브라우저 창이 홀쭉한 경우 - 브라우저가 캔버스에 비해 가로 대비 세로가 더 길다
            canvasScaleRatio = heightRatio;
          } else {
            // 캔버스보다 브라우저 창이 납작한 경우 - 브라우저가 캔버스에 비해 세로 대비 가로가 더 길다
            canvasScaleRatio = widthRatio;
          }
          objs.canvas.style.transform = `scale(${canvasScaleRatio})`;
          // 만약 canvasScaleRatio = heightRatio; 라면
          // heightRatio에 맞춰서 scale을 가로, 세로로 키워주기 때문에 세로 크기는 브라우저와 캔버스가 맞고
          // 가로 크기는 캔버스가 더 길어진다
          // 그 이유는 canvasScaleRatio = widthRatio 값은 canvasScaleRatio = heightRatio; 보다 더 작기 때문이다
          // 예를들어 widthRatio = 0.5, heightRatio = 0.7 인 경우, 가로,세로 모두 0.7 만큼 커지기 때문에
          // 가로로는 캔버스가 더 커지는 것이다
          objs.context.fillStyle = 'white';
          objs.context.drawImage(objs.images[0], 0, 0);

          // 캔버스 사이즈에 맞춰 가정한 innerWidth와 innerHeight

          // 즉, 위에서 구한 canvasScaleRatio 만큼 곱해주어서 canvas 크기를 조정해 준 상태이다.
          // 따라서 canvasScaleRatio를 나누어서 양 옆의 흰색 영역을 그리기 위한 새로운 canvas를 구해주는 것이다

          /**
           * 현재 캔버스의 높이가 창 높이에 딱 맞도록 조정되어 있는데요,
           * 만약 세로로 홀쭉한 스마트폰에 저 캔버스를 채운다면 캔버스의 좌우는 잘리게 되겠지요?
           * 그런데 좌우에 그려질 하얀 박스는 캔버스의 양 끝이 아니라,
           * 우리 눈에 보이는 캔버스 영역의 좌우 끝에 배치되어야 하므로
           * 그 계산을 위해서 현재 창 사이즈와 같은 비율의 캔버스 크기를 설정한다고 생각하시면 됩니다.
           *
           * 즉, 흰색 너비 또한 캔버스에 포함되기 때문에 이를 위해서 새로운 캔버스를 구해주어야 하기 때문에
           * canvasScaleRatio를 나누어서 새로운 width, Height를 구해주는 것이다
           *
           * 따라서, 창 사이즈와 같은 비율의 캔버스 크기를 구하는 것이 바로 아래
           * recalculatedInnerWidth, recalculatedInnerHeight 이다.
           *
           */

          // https://www.inflearn.com/course/%EC%95%A0%ED%94%8C-%EC%9B%B9%EC%82%AC%EC%9D%B4%ED%8A%B8-%EC%9D%B8%ED%84%B0%EB%9E%99%EC%85%98-%ED%81%B4%EB%A1%A0/unit/42821?category=questionDetail&tab=community&q=54063

          // 캔버스를 위에서 줄이는데 canvasScaleRatio를 곱해서 사용했으므로
          // window.innerWidth, window.innerHeight에 canvasScaleRatio를 나누어주면,
          // window.innerWidth, window.innerHeight 비율에 맞는 새로운 캔버스를 만들 수 있다.

          // const recalculatedInnerWidth = window.innerWidth / canvasScaleRatio;
          // const recalculatedInnerHeight = window.innerHeight / canvasScaleRatio;

          // 브라우저에서 스크롤바를 뺀 값을 구한 값을 구하기 위해
          // 위의 window.innerWidth 값을 사용하면 화면에 캔버스가 꽉 차도 위에 빈 부분이 남아있게 된다.
          const recalculatedInnerWidth =
            document.body.offsetWidth / canvasScaleRatio;
          const recalculatedInnerHeight = window.innerHeight / canvasScaleRatio;

          const whiteRectWidth = recalculatedInnerWidth * 0.15; // 흰색 박스의 너비

          // index 0은 흰색 박스 이동하기전 초기값
          values.rect1X[0] = (objs.canvas.width - recalculatedInnerWidth) / 2;
          values.rect1X[1] = values.rect1X[0] - whiteRectWidth;
          values.rect2X[0] =
            values.rect1X[0] + recalculatedInnerWidth - whiteRectWidth;
          values.rect2X[1] = values.rect2X[0] + whiteRectWidth;

          // 좌우 흰색 박스 그리기
          objs.context.fillRect(
            parseInt(values.rect1X[0]), // x
            0, //y
            parseInt(whiteRectWidth), // width, parseInt 해준 것은, 캔버스에서 정수로 해주면 그릴 때 성능이 좀 더 좋아지기 때문
            objs.canvas.height // height: ;
          );
          objs.context.fillRect(
            parseInt(values.rect2X[0]), // x
            0,
            parseInt(whiteRectWidth),
            objs.canvas.height
          );
        }
        break;

      case 3:
        let step = 0;

        // 가로 , 세로 모두 꽉 차게 하기 위해서 여기서 세팅 (계산 필요)
        const widthRatio = window.innerWidth / objs.canvas.width;
        const heightRatio = window.innerHeight / objs.canvas.height;
        let canvasScaleRatio;

        // 비율에 따라 캔버스의 크기 조절을 해준다
        // 어떤 경우에도 캔버스가 브라우저에 꽉 차게 해주기 위해서
        if (widthRatio <= heightRatio) {
          // 캔버스보다 브라우저 창이 홀쭉한 경우 - 브라우저가 캔버스에 비해 가로 대비 세로가 더 길다
          canvasScaleRatio = heightRatio;
        } else {
          // 캔버스보다 브라우저 창이 납작한 경우 - 브라우저가 캔버스에 비해 세로 대비 가로가 더 길다
          canvasScaleRatio = widthRatio;
        }
        objs.canvas.style.transform = `scale(${canvasScaleRatio})`;
        // 만약 canvasScaleRatio = heightRatio; 라면
        // heightRatio에 맞춰서 scale을 가로, 세로로 키워주기 때문에 세로 크기는 브라우저와 캔버스가 맞고
        // 가로 크기는 캔버스가 더 길어진다
        // 그 이유는 canvasScaleRatio = widthRatio 값은 canvasScaleRatio = heightRatio; 보다 더 작기 때문이다
        // 예를들어 widthRatio = 0.5, heightRatio = 0.7 인 경우, 가로,세로 모두 0.7 만큼 커지기 때문에
        // 가로로는 캔버스가 더 커지는 것이다
        objs.context.fillStyle = 'white';
        objs.context.drawImage(objs.images[0], 0, 0);

        // 캔버스 사이즈에 맞춰 가정한 innerWidth와 innerHeight

        // 즉, 위에서 구한 canvasScaleRatio 만큼 곱해주어서 canvas 크기를 조정해 준 상태이다.
        // 따라서 canvasScaleRatio를 나누어서 양 옆의 흰색 영역을 그리기 위한 새로운 canvas를 구해주는 것이다

        /**
         * 현재 캔버스의 높이가 창 높이에 딱 맞도록 조정되어 있는데요,
         * 만약 세로로 홀쭉한 스마트폰에 저 캔버스를 채운다면 캔버스의 좌우는 잘리게 되겠지요?
         * 그런데 좌우에 그려질 하얀 박스는 캔버스의 양 끝이 아니라,
         * 우리 눈에 보이는 캔버스 영역의 좌우 끝에 배치되어야 하므로
         * 그 계산을 위해서 현재 창 사이즈와 같은 비율의 캔버스 크기를 설정한다고 생각하시면 됩니다.
         *
         * 즉, 흰색 너비 또한 캔버스에 포함되기 때문에 이를 위해서 새로운 캔버스를 구해주어야 하기 때문에
         * canvasScaleRatio를 나누어서 새로운 width, Height를 구해주는 것이다
         *
         * 따라서, 창 사이즈와 같은 비율의 캔버스 크기를 구하는 것이 바로 아래
         * recalculatedInnerWidth, recalculatedInnerHeight 이다.
         *
         */

        // https://www.inflearn.com/course/%EC%95%A0%ED%94%8C-%EC%9B%B9%EC%82%AC%EC%9D%B4%ED%8A%B8-%EC%9D%B8%ED%84%B0%EB%9E%99%EC%85%98-%ED%81%B4%EB%A1%A0/unit/42821?category=questionDetail&tab=community&q=54063

        // 캔버스를 위에서 줄이는데 canvasScaleRatio를 곱해서 사용했으므로
        // window.innerWidth, window.innerHeight에 canvasScaleRatio를 나누어주면,
        // window.innerWidth, window.innerHeight 비율에 맞는 새로운 캔버스를 만들 수 있다.

        // const recalculatedInnerWidth = window.innerWidth / canvasScaleRatio;
        // const recalculatedInnerHeight = window.innerHeight / canvasScaleRatio;

        // 브라우저에서 스크롤바를 뺀 값을 구한 값을 구하기 위해
        // 위의 window.innerWidth 값을 사용하면 화면에 캔버스가 꽉 차도 위에 빈 부분이 남아있게 된다.
        const recalculatedInnerWidth =
          document.body.offsetWidth / canvasScaleRatio;
        const recalculatedInnerHeight = window.innerHeight / canvasScaleRatio;

        // 값이 설정되어 있지 않을 때만 실행되서, 세팅이 한번만 되도록 한다
        if (!values.rectStartY) {
          // section 3가 등장할 때 Y 위치
          // 스크롤 이벤트가 발생할 때 위치를 잡아낸다
          // 따라서 스크롤 속도에 따라서 값이 변하게 된다.
          // 스크롤 속도에 상관없이 top이 인식되는 것을 같도록 해주어야 한다
          // values.rectStartY = objs.canvas.getBoundingClientRect().top;

          // offsetTop은 문서의 처음이 기준이다
          // 따라서 고정된 값을 가지므로 스크롤 속도에 상관없이 같은 값을 가진다
          // 이 때, 부모 요소의 position을 relative로 지정해주면,
          // 문서의 처음이 아닌 부모 요소를 기준으로 offsetTop 값을 가지게 된다
          // 하지만 transform으로 scale이 줄어들기전의 크기를 기준으로 할 때의 offsetTop 값
          // 따라서 캔버스가 줄어든 것 만큼의 높이를 더해주어야 한다

          values.rectStartY =
            objs.canvas.offsetTop +
            (objs.canvas.height - objs.canvas.height * canvasScaleRatio) / 2;
          values.rect1X[2].start = window.innerHeight / 2 / scrollHeight;
          values.rect2X[2].start = window.innerHeight / 2 / scrollHeight;
          values.rect1X[2].end = values.rectStartY / scrollHeight; // scrollHeight : 현재 씬에서 얼마나 스크롤했는지
          values.rect2X[2].end = values.rectStartY / scrollHeight;
        }

        const whiteRectWidth = recalculatedInnerWidth * 0.15; // 흰색 박스의 너비

        // index 0은 흰색 박스 이동하기전 초기값
        values.rect1X[0] = (objs.canvas.width - recalculatedInnerWidth) / 2;
        values.rect1X[1] = values.rect1X[0] - whiteRectWidth;
        values.rect2X[0] =
          values.rect1X[0] + recalculatedInnerWidth - whiteRectWidth;
        values.rect2X[1] = values.rect2X[0] + whiteRectWidth;

        // 좌우 흰색 박스 그리기

        objs.context.fillRect(
          parseInt(calcValues(values.rect1X, currentYOffset)),
          0,
          parseInt(whiteRectWidth), // width, parseInt 해준 것은, 캔버스에서 정수로 해주면 그릴 때 성능이 좀 더 좋아지기 때문
          objs.canvas.height
        );
        objs.context.fillRect(
          parseInt(calcValues(values.rect2X, currentYOffset)),
          0,
          parseInt(whiteRectWidth),
          objs.canvas.height
        );

        // 캔버스가 브라우저 상단에 닿지 않았다면
        if (scrollRatio < values.rect1X[2].end) {
          step = 1;
          objs.canvas.classList.remove('sticky');
        } else {
          // 캔버스가 브라우저 상단에 닿은 이후
          step = 2;
          // 이미지 블랜드

          values.blendHeight[0] = 0;
          values.blendHeight[1] = objs.canvas.height;
          values.blendHeight[2].start = values.rect1X[2].end;
          values.blendHeight[2].end = values.blendHeight[2].start + 0.2; // end 크게하면 스크롤 많이해야 하고, 작게하면 스크롤 조금만 하면 된다
          const blendHeight = calcValues(values.blendHeight, currentYOffset);

          objs.context.drawImage(
            objs.images[1],
            0,
            objs.canvas.height - blendHeight,
            objs.canvas.width,
            blendHeight,
            0,
            objs.canvas.height - blendHeight,
            objs.canvas.width,
            blendHeight
          );

          objs.canvas.classList.add('sticky');

          // css의 .image-blend-canvas.sticky 클래스에서 top을 0으로 지정했어도 위에 딱 붙지 않는데
          // 그 이유는 scale을 사용해서 캔버스 크기를 줄였는데, 원래 캔버스의 크기에 맞게 top이 적용되기 때문이다
          // 따라서 아래처럼 scale로 줄어든 캔버스에 맞게 top을 지정해준다
          objs.canvas.style.top = `${
            -(objs.canvas.height - objs.canvas.height * canvasScaleRatio) / 2
          }px`;

          // 축소 시작

          if (scrollRatio > values.blendHeight[2].end) {
            values.canvas_scale[0] = canvasScaleRatio;
            values.canvas_scale[1] =
              document.body.offsetWidth / (1.5 * objs.canvas.width);
            // 브라우저의 폭 보다 작게 만들어준다
            // 분수니까 분모의 값을 증가시켜서 결과값을 작게 만듬
            // 두번째 이미지가 보여지는 애니메이션의 최종 값

            values.canvas_scale[2].start = values.blendHeight[2].end;
            values.canvas_scale[2].end = values.canvas_scale[2].start + 0.2;

            objs.canvas.style.transform = `scale(${calcValues(
              values.canvas_scale,
              currentYOffset
            )})`;
            objs.canvas.style.marginTop = 0; // 스크롤했다가 다시 올릴 때 갑자기 사라지는 문제 해결하기 위해
          }

          // values.canvas_scale[2].end가 세팅이 되고 0이 아닌 순간에 실행된다
          if (
            scrollRatio > values.canvas_scale[2].end &&
            values.canvas_scale[2].end > 0
          ) {
            objs.canvas.classList.remove('sticky'); // fixed 된 것을 다시 되돌려준다.

            // 두번째 이미지 보이다가 다시 줄어들도록 하기 위해서 마진을 줘서 멈추도록 한다.
            // 위의 코드를 보면,
            // values.blendHeight[2].end = values.rect1X[2].start + 0.2; //  0.2 동안 이미지 블렌드 처리
            // values.canvas_scale[2].end = values.blendHeight[2].start + 0.2; // 0.2 동안 축소 처리
            // 따라서 0.4 동안 스크롤 된 것이므로 아래 0.4가 된다
            objs.canvas.style.marginTop = `${scrollHeight * 0.4}px`;

            values.canvasCaption_opacity[2].start = values.canvas_scale[2].end; // canvas scale 끝났을 때 시작
            values.canvasCaption_opacity[2].end =
              values.canvasCaption_opacity[2].start + 0.1;

            // canvas scale 끝났을 때 시작

            values.canvasCaption_translateY[2].start =
              values.canvasCaption_opacity[2].start;

            values.canvasCaption_translateY[2].end =
              values.canvasCaption_opacity[2].end;
            objs.canvasCaption.style.opacity = calcValues(
              values.canvasCaption_opacity,
              currentYOffset
            );
            objs.canvasCaption.style.transform = `translate3d(0, ${calcValues(
              values.canvasCaption_translateY,
              currentYOffset
            )}%, 0)`;
          } else {
            objs.canvasCaption.style.opacity = values.canvasCaption_opacity[0];
          }
        }

        break;
    }
  }

  function loop() {
    delayedYOffset = delayedYOffset + (yOffset - delayedYOffset) * acc;
    // 속도 감속할 때 사용하는 식
    // 빠르다가 서서히 속도 줄어들도록 처리한다
    // 즉 스크롤 할 수록 속도가 점점 더 감속된다.
    // pageYOffset 사용하면 터치패드 말고 마우스 스크롤, 방향키 누르면 끊기듯이 비디오가 재생되는데, 위 식 사용하면
    // 그냥 pageYOffset 사용할 때와 달리 끊기지 않는다
    // 애플은 이렇게 끊기지 않도록 처리해주었다
    // 가속도가 적용된 offset

    // 새로운 씬에 들어가는 순간이 아닐 때만 실행
    if (!enterNewScene) {
      if (currentScene === 0 || currentScene === 2) {
        const currentYOffset = delayedYOffset - prevScrollHeight;
        const objs = sceneInfo[currentScene].objs;
        const values = sceneInfo[currentScene].values;

        let sequence = Math.round(
          calcValues(values.imageSequence, currentYOffset)
        );
        if (objs.videoImages[sequence]) {
          objs.context.drawImage(objs.videoImages[sequence], 0, 0);
        }
      }
    }

    rafId = requestAnimationFrame(loop); // loop 함수 반복된다. 초당 60번을 목표로

    // 두 지점의 차이가 1px보다 작으면 멈춰주도록 한다
    if (Math.abs(yOffset - delayedYOffset) < 1) {
      cancelAnimationFrame(rafId);
      rafState = false;
    }
  }

  window.addEventListener('scroll', () => {
    yOffset = window.pageYOffset;

    scrollLoop();
    checkMenu();

    if (!rafState) {
      rafId = requestAnimationFrame(loop);
      rafState = true;
    }
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 600) {
      setLayoyt();
    }
  });

  // orientationChange은 모바일 기기를 가로, 세로 방향으로 돌릴 때 일어나는 이벤
  window.addEventListener('orientationchange', setLayoyt);

  window.addEventListener('load', () => {
    document.body.classList.remove('before-load');
    setLayoyt; // 새로고침 했을 때 처리해주기 위함
    sceneInfo[0].objs.context.drawImage(sceneInfo[0].objs.videoImages[0], 0, 0);
  });
  // DOMContentLoaded는 load가 이미지 파일들을 포함해서 모든 파일이 로드되면 실행되는 것고 ㅏ달리
  // html 객체들만 로드가 끝나면 바로 실행된다
  // 따라서 실행시점이 더 빠르다는 장점 있다

  document.querySelector('.loading').addEventListener('transitionend', (e) => {
    document.body.removeChild(e.currentTarget);
  });

  setCanvasImage();
})();
