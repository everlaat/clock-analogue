class ClockAnalogue extends HTMLElement {
  shadow = null;
  elements = new Map();

  FPS = 60;

  HOUR_MARKER_TEMPLATES = {
    roman: 'I,II,III,IV,V,VI,VII,VIII,IX,X,XI,XII',
    romanMinimal: ',,III,,,VI,,,IX,,,XII',
    numeral: '1,2,3,4,5,6,7,8,9,10,11,12',
    numeralMinimal: ',,3,,,6,,,9,,,12',
  };

  static defaultOptions = {
    size: 100,
    background: '#9dadbd',
    showSeconds: true,
    snap: true,
    hourMarkers: 'none',
    fontFamily: '"Open Sans", Ubuntu, sans-serif',
  };

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
  }

  getAttr(name, def = null) {
    return this.getAttribute(name) ?? def;
  }

  get options() {
    const b = (a) => {
      if (typeof a === 'boolean') {
        return a;
      } else if (a === 'false' || a === '0' || a === 0) {
        return false;
      }
      return Boolean(a);
    };
    const getVal = (a) => {
        const def = ClockAnalogue.defaultOptions[a];
        const type = typeof def;
        const val = this.getAttr(a, def);
        if (type === 'boolean') {
          return b(val);
        }
        return val;
    }

    return Object.keys(ClockAnalogue.defaultOptions).reduce(
      (acc, a) => ({
        ...acc,
        [a]: getVal(a)
      }),
      {}
    );
  }

  get time() {
    const attrTime = this.getAttr('time', null);
    return attrTime
      ? new Date(`1999/1/1 ${attrTime.split(' ').pop()}`)
      : new Date();
  }

  get hours() {
    return this.time.getHours();
  }

  get minutes() {
    return this.time.getMinutes();
  }

  get seconds() {
    return this.time.getSeconds();
  }

  get milliseconds() {
    return this.time.getMilliseconds();
  }

  get hourMarkers() {
    if (this.HOUR_MARKER_TEMPLATES[this.options.hourMarkers]) {
      return this.HOUR_MARKER_TEMPLATES[this.options.hourMarkers].split(',');
    }
    const arr = this.options.hourMarkers.split(',');
    return arr.length === 12 ? arr : [];
  }

  static get observedAttributes() {
    return Object.keys(this.defaultOptions).map(a => a.toLowerCase());
  }

  connectedCallback() {
    this.render();
    this.tick();
  }

  attributeChangedCallback(name, a, b) {
    this.render();
  }

  tick() {
    const HANDLE_OFFSET = -90;

    const applyRotation = (className, degrees) => {
      const el = this.elements.get(className);
      if (!el) {
        return;
      }
      const makeRotate = (degrees) => {
        return `rotate(${degrees + HANDLE_OFFSET}deg)`;
      };

      el.style.transform = makeRotate(degrees);
    };

    const hoursDegrees = (360 / 12) * this.hours;
    const minutesDegrees = (360 / 60) * this.minutes;
    const secondsDegrees = (360 / 60) * this.seconds;

    applyRotation(
      'hand hours',
      this.options.snap ? hoursDegrees : hoursDegrees + minutesDegrees / 60
    );
    applyRotation(
      'hand minutes',
      this.options.snap ? minutesDegrees : minutesDegrees + secondsDegrees / 60
    );
    applyRotation(
      'hand seconds',
      this.options.snap
        ? secondsDegrees
        : (360 / 60) * (this.seconds + this.milliseconds / 1000)
    );

    if (!this.getAttr('time', null)) {
      setTimeout(() => {
        this.tick();
      }, 1000 / this.FPS);
    }
  }

  render() {
    const e = (
      className,
      children = [],
      nodeName = 'div',
      innerText = null
    ) => {
      const el = document.createElement(nodeName);
      el.className = className;

      if (innerText) {
        el.innerText = innerText;
      }

      this.elements.set(className, el);

      if (children.length > 0) {
        children.forEach((child) => {
          child && el.appendChild(child);
        });
      }

      return el;
    };

    this.elements = new Map();
    this.shadow.innerHTML = '';
    this.setAttribute('style', 'width:' + this.options.size + 'px');

    const hourMarkers =
      this.hourMarkers.length === 12
        ? (() => {
            return e(
              'hours',
              Array(12)
                .fill(null)
                .map((_, i) =>
                  e(
                    `hour hour-${i}`,
                    [],
                    'li',
                    i === 0 ? this.hourMarkers[11] : this.hourMarkers[i - 1]
                  )
                ),
              'ol'
            );
          })()
        : null;

    this.shadow.appendChild(
      e('clock', [
        e('clockface'),
        e(`clock-center ${this.options.showSeconds ? 'with-seconds' : ''}`),
        this.options.showSeconds ? e('hand seconds') : null,
        e('hand minutes'),
        e('hand hours'),
        hourMarkers,
      ])
    );

    const style = document.createElement('style');

    const rpx = (px, f = (a) => a) => {
      const val = (this.options.size / 100) * px;
      return `${f(val)}px`;
    };
    
    const hxy = (h) => {
      const offset = 50;
      const r = 43;
      const x = Math.round(
        offset + r * Math.cos((Math.PI * h) / 6 - Math.PI / 2)
      );
      const y = Math.round(
        offset + r * Math.sin((Math.PI * h) / 6 - Math.PI / 2)
      );
      return { x, y };
    };
    
    const contrastingColor = (hex) => {
      const r = parseInt(hex.substr(1, 2), 16);
      const g = parseInt(hex.substr(3, 2), 16);
      const b = parseInt(hex.substr(5, 2), 16);
      const yiq = (r * 299 + g * 587 + b * 114) / 1000;
      return yiq >= 128 ? '#333' : '#eee';
    }

    const hourMarkerColor = contrastingColor(this.options.background);

    style.textContent = `
    .clock, .clock * {
      box-sizing: border-box;
    }
    .clock {
      position: relative;
      width: ${rpx(100)};
      height: ${rpx(100)};
    }

    .clockface {
      position: absolute;
      background-color: ${this.options.background};
      border-radius: 50%;
      height: 100%;
      width: 100%;
      box-shadow: inset 0 0 10px 10px rgba(0,0,0,.1);
    }
    
    .clock-center,
    .clock-center.with-seconds:after {
      display: block;
      position: absolute;
      top: 50%;
      left: 50%;
      transform-origin: center center;
      transform: translate(-50%, -50%);
      border-radius: 50%;
    }
    .clock-center {
      z-index: 50;
      width: ${rpx(6)};
      height: ${rpx(6)};
      border: ${rpx(1, Math.floor)} solid #444;
      background-color: #444;
    }
    .clock-center.with-seconds {
      background-color: #F00;
    }
    .clock-center.with-seconds:after {
      content: " ";
      display: block;
      width: ${rpx(2.5)};
      height: ${rpx(2.5)};
      background-color: #444;
    }

    .hand {
      position: absolute;
      width: 50%;
      top: 50%;
      left: 50%;
      transform-origin: left;
    }

    .hand:before,
    .hand:after {
      position: absolute;
      content: " ";
      display: block;
    }
    
    .hand.seconds,
    .hand.hours,
    .hand.minutes {
      height: 0;
    }

    .hand.hours:before,
    .hand.minutes:before {
      left: 0;
      right: 0;
      top: -${rpx(1)};
      height: ${rpx(2)};
      background-color: #444;
    }

    .hand.hours:after,
    .hand.minutes:after {
      right: 0;
      top: -${rpx(2.25)};
      left: ${rpx(6)};
      height: ${rpx(2.5)};
      border: ${rpx(1, Math.floor)} solid #444;
      background-color: #FFF;
      border-radius: ${rpx(2)};
    }

    .hand.seconds:before {
      left: 0;
      right: 0;
      top: -${rpx(0.25)};
      height: ${rpx(0.5)};
      background-color: #F00;
    }
    .hand.seconds:after {
      left: -${rpx(10)};
      right: 0;
      height: ${rpx(0.5)};
      background-color: #F00;
    }
      
    .hand.hours    { width: 33%;   z-index: 15; }
    .hand.minutes  { width: 46%;   z-index: 10; }
    .hand.seconds  { width: 48%;   z-index: 20; }

    ol,li {
      display: block;
      list-style: none;
      position: absolute;
      margin: 0;
      padding: 0;
    }
    ol.hours {
      z-index: 5;
      width: 100%;
      height: 100%;
    }
    li.hour {
      text-align: center;
      font-family: ${this.options.fontFamily};
      font-size: ${rpx(7)};
      font-weight: bold;
      transform: translate(-50%, -50%);
      color: ${hourMarkerColor};
    }
    ${this.hourMarkers
      .map((_, i) => {
        return `li.hour.hour-${i} { top: ${hxy(i).y}%; left: ${hxy(i).x}%; }`;
      })
      .join('\n')}
    `;

    this.shadow.appendChild(style);
  }
}

customElements.define('clock-analogue', ClockAnalogue);
