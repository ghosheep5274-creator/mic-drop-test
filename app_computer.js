// app.js - [區域 I] 特效引擎

function initButterMelt() {
    if (document.getElementById('butter-wrapper')) return;

    // 1. 注入全新「漫畫硬邊高光」濾鏡
    const svgFilter = `
    <svg xmlns="http://www.w3.org/2000/svg" version="1.1" class="svg-filter-container">
      <defs>
        <filter id="butter-cartoon-filter" color-interpolation-filters="sRGB">
          <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
          <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" result="gooey" />

          <feSpecularLighting in="gooey" surfaceScale="5" specularConstant="1" specularExponent="15" lighting-color="#ffffff" result="specular-soft">
            <feDistantLight azimuth="225" elevation="45" />
          </feSpecularLighting>

          <feColorMatrix in="specular-soft" mode="matrix" values="
            0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 18 -8" result="specular-hard" /> <feComposite in="specular-hard" in2="gooey" operator="in" result="final-highlight" />
          <feComposite in="final-highlight" in2="gooey" operator="over" />
        </filter>
      </defs>
    </svg>`;
    document.body.insertAdjacentHTML('beforeend', svgFilter);

    const wrapper = document.createElement('div');
    wrapper.id = 'butter-wrapper';

    // 2. 建立頂部波浪 (維持貝茲曲線)
    const topWave = document.createElement('div');
    topWave.innerHTML = `
        <svg class="butter-svg-wave" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path fill="#FFD700" d="M0,0 L1440,0 L1440,100 
            C1350,180 1250,80 1150,140 
            C1050,200 950,280 850,220 
            C750,160 650,220 550,260 
            C400,320 300,150 200,200 
            C100,250 50,150 0,120 Z"></path>
        </svg>
    `;
    wrapper.appendChild(topWave);

    // 3. 建立水滴 (🔴 減少數量)
    // 只保留 3 個主要位置
    const dropPositions = [20, 50, 85]; 
    
    dropPositions.forEach(pos => {
        createDrop(wrapper, pos);
    });
    
    // 只增加 2 個隨機小水滴
    for(let i=0; i<2; i++) {
        createDrop(wrapper, Math.random() * 90 + 5);
    }

    document.body.insertBefore(wrapper, document.body.firstChild);
}

function createDrop(wrapper, leftPos) {
    const drop = document.createElement('div');
    drop.classList.add('butter-drop');
    
    // 大小：35px ~ 55px
    const size = Math.random() * 20 + 35;
    drop.style.width = size + 'px';
    drop.style.height = (size * 1.3) + 'px';

    drop.style.left = leftPos + '%';
    
    const duration = Math.random() * 1.5 + 3; // 3s ~ 4.5s
    drop.style.animationDuration = duration + 's';
    drop.style.animationDelay = (Math.random() * -4) + 's';

    wrapper.appendChild(drop);
}
