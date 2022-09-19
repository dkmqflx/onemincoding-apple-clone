(() => {
  let yOffset = 0; // window.pageYOffset 대신 쓸 변수, 현재 스크롤한 위치, 몇 픽셀을 스크롤했는지
  let prevScrollHeight = 0; // 현재 스크롤 위치(yOffset)보다 이전에 위치한 스크롤 섹션들의 스크롤 높이값의 합
  let currentScene = 0; // 현재 활성화된(누 앞에 보고 있는) 씬(scroll-section)

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
    // console.log(window.pageYOffset); // 현재 스크롤한 위치, 몇 픽셀을 스크롤했는지
    // 2번섹션 또는 3번 섹션이 언제 시작되는지는, 얼마나 스크롤을 했는지, 이전 스크롤을 얼마나 했는지를 통해서 알 수 있다

    prevScrollHeight = 0;

    for (let i = 0; i < currentScene; i++) {
      prevScrollHeight += sceneInfo[i].scrollHeight;
    }

    // 스크롤이 내려갈 때
    // 현재 스클로한 위치가 이전 섹션까지 스크롤 높이 값의 합과 현재 섹션의 스크롤 값을 합한 것 보다 큰 경우, 씬이 바뀐다
    if (yOffset > prevScrollHeight + sceneInfo[currentScene].scrollHeight) {
      currentScene++;
      document.body.setAttribute('id', `show-scene-${currentScene}`);
    }

    if (yOffset < prevScrollHeight) {
      // safari의 경우, 첫번째 씬에서 위로 스크롤 할 때 - 가 될 수도 있기 때문
      // 즉, 브라우저 바운스 효과로 인해 마이너스가 되는 것을 방지 (모바일)
      if (currentScene === 0) return;
      currentScene--;
      document.body.setAttribute('id', `show-scene-${currentScene}`);
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
