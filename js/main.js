(() => {
  let yOffset = 0; // window.pageYOffset 대신 쓸 변수, 현재 스크롤한 위치, 몇 픽셀을 스크롤했는지
  let prevScrollHeight = 0; // 현재 스크롤 위치(yOffset)보다 이전에 위치한 스크롤 섹션들의 스크롤 높이값의 합
  let currentScene = 0; // 현재 활성화된(누 앞에 보고 있는) 씬(scroll-section)
  let enterNewScene = false; // 새로운 scene이 시작되는 순간 true가 된다

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
      }, // DOM 객체 요소
      values: {
        messageA_opacity_in: [0, 1, { start: 0.1, end: 0.2 }], // 전체 스크롤의 비율을 1로 봤을 때의 비율
        messageA_translateY_in: [20, 0, { start: 0.1, end: 0.2 }],

        // messageB_opacity_in: [0, 1, { start: 0.3, end: 0.4 }],
        messageA_opacity_out: [1, 0, { start: 0.25, end: 0.3 }],
        messageA_translateY_out: [0, -20, { start: 0.25, end: 0.3 }],
      },
    },

    {
      // 1
      type: 'normal',
      heightNum: 5,
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
      },
    },

    {
      // 3
      type: 'sticky',
      heightNum: 5,
      scrollHeight: 0,
      objs: {
        container: document.querySelector('#scroll-section-3'),
      },
    },
  ];

  function setLayoyt() {
    // 각 스크롤 섹션의 높이 세팅

    for (let i = 0; i < sceneInfo.length; i++) {
      sceneInfo[i].scrollHeight = sceneInfo[i].heightNum * window.innerHeight;
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
    if (yOffset > prevScrollHeight + sceneInfo[currentScene].scrollHeight) {
      enterNewScene = true;
      currentScene++;
      document.body.setAttribute('id', `show-scene-${currentScene}`);
    }

    if (yOffset < prevScrollHeight) {
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
        const messageA_opacity_in = calcValues(
          values.messageA_opacity_in,
          currentYOffset
        );

        const messageA_opacity_out = calcValues(
          values.messageA_opacity_out,
          currentYOffset
        );

        const messageA_translateY_in = calcValues(
          values.messageA_translateY_in,
          currentYOffset
        );

        const messageA_translateY_out = calcValues(
          values.messageA_translateY_out,
          currentYOffset
        );

        console.log(messageA_translateY_in);

        if (scrollRatio <= 0.22) {
          // in
          objs.messageA.style.opacity = messageA_opacity_in;
          objs.messageA.style.transform = `translateY(${messageA_translateY_in}%)`;
        } else {
          // out
          objs.messageA.style.opacity = messageA_opacity_out;
          objs.messageA.style.transform = `translateY(${messageA_translateY_out}%)`;
        }

        break;
      case 1:
        break;
      case 2:
        break;
      case 3:
        break;
    }
  }

  window.addEventListener('scroll', () => {
    yOffset = window.pageYOffset;

    scrollLoop();
  });
  window.addEventListener('resize', setLayoyt);
  window.addEventListener('load', setLayoyt); // 새로고침 했을 때 처리해주기 위함
  // DOMContentLoaded는 load가 이미지 파일들을 포함해서 모든 파일이 로드되면 실행되는 것고 ㅏ달리
  // html 객체들만 로드가 끝나면 바로 실행된다
  // 따라서 실행시점이 더 빠르다는 장점 있다
})();
