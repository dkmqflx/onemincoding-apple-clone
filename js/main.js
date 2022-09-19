(() => {
  let yOffset = 0; // window.pageYOffset 대신 쓸 변수

  // 각 scene에 대한 정보가 있는 객체
  const sceneInfo = [
    {
      // 0
      type: 'sticky',
      heightNum: 5, // 브라우저 높이의 5배로 scrollHeight를 세팅한다
      scrollHeight: 0,
      objs: {
        container: document.querySelector('#scroll-section-0'),
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
  }
  setLayoyt();

  function scrollLoop() {
    // console.log(window.pageYOffset); // 현재 스크롤한 위치, 몇 픽셀을 스크롤했는지
    // 2번섹션 또는 3번 섹션이 언제 시작되는지는, 얼마나 스크롤을 했는지, 이전 스크롤을 얼마나 했는지를 통해서 알 수 있다
  }

  window.addEventListener('resize', setLayoyt);
  window.addEventListener('scroll', () => {
    yOffset = window.pageYOffset;

    scrollLoop();
  });
})();
