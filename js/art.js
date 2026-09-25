const EMPTY_ART = {
  termine: `<svg class="art art-termine" viewBox="0 0 320 220" aria-hidden="true">
  <path d="M58 66C92 30 188 20 246 40C294 57 306 116 284 158C262 200 174 212 112 199C58 188 24 154 30 114C33 92 44 80 58 66Z" fill="#fff6cf"/>
  <path d="M90 50L118 20L146 50" fill="none" stroke="#3b2340" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="118" cy="20" r="5" fill="#3b2340"/>
  <circle cx="116.4" cy="18.4" r="1.6" fill="#fff" opacity=".6"/>
  <g transform="translate(192 92)">
    <g class="mascot">
      <path d="M-30 0L-58 -20L-52 -9L-60 -3L-52 3L-60 9L-52 15L-58 20Z" fill="#fae27c"/>
      <path d="M30 0L58 -20L52 -9L60 -3L52 3L60 9L52 15L58 20Z" fill="#fae27c"/>
      <ellipse cy="5" rx="36" ry="28" fill="#e0bd3f"/>
      <ellipse rx="36" ry="28" fill="#fae27c"/>
      <rect x="-24" y="-20" width="16" height="5" rx="2.5" fill="#fff" opacity=".7"/>
      <g class="eyes"><ellipse cx="-11" cy="-2" rx="3.4" ry="4.4" fill="#3b2340"/><ellipse cx="11" cy="-2" rx="3.4" ry="4.4" fill="#3b2340"/></g>
      <ellipse cx="-19" cy="8" rx="5" ry="3" fill="#e0bd3f" opacity=".7"/><ellipse cx="19" cy="8" rx="5" ry="3" fill="#e0bd3f" opacity=".7"/>
      <path d="M-6 8Q0 14 6 8" fill="none" stroke="#3b2340" stroke-width="2.6" stroke-linecap="round"/>
      <path class="wave" d="M16 25Q30 38 44 31" fill="none" stroke="#3b2340" stroke-width="3.5" stroke-linecap="round"/>
    </g>
  </g>
  <rect x="62" y="49" width="112" height="146" rx="16" fill="#9f86d9"/>
  <rect x="62" y="44" width="112" height="146" rx="16" fill="#c9b3f2"/>
  <rect x="74" y="60" width="88" height="120" rx="8" fill="#efe8fd"/>
  <g class="sheet">
    <rect x="74" y="60" width="88" height="116" rx="8" fill="#fff"/>
    <path d="M82 77H154" fill="none" stroke="#c9b3f2" stroke-width="3" stroke-linecap="round" stroke-dasharray="0 8"/>
    <rect x="98" y="85" width="40" height="8" rx="4" fill="#c9b3f2"/>
    <text x="118" y="145" text-anchor="middle" font-family="'Titan One', 'Arial Rounded MT Bold', sans-serif" font-size="58" fill="#3b2340">11</text>
    <rect x="104" y="156" width="28" height="8" rx="4" fill="#efe8fd"/>
  </g>
  <rect x="70" y="54" width="96" height="16" rx="8" fill="#8266c6"/>
  <rect x="70" y="50" width="96" height="16" rx="8" fill="#9f86d9"/>
  <rect x="78" y="53" width="14" height="4" rx="2" fill="#fff" opacity=".6"/>
  <g transform="translate(192 92)">
    <path class="grip" d="M-12 25Q-24 30 -28 12" fill="none" stroke="#3b2340" stroke-width="3.5" stroke-linecap="round"/>
  </g>
  <g class="cf cf1"><rect x="33.5" y="55.5" width="13" height="5" rx="2.5" fill="#f4a3c0" transform="rotate(35 40 58)"/></g>
  <circle class="cf cf2" cx="36" cy="134" r="3.5" fill="#69b0dc"/>
  <g class="cf cf3"><rect x="265.5" y="43.5" width="13" height="5" rx="2.5" fill="#a8e0b8" transform="rotate(-28 272 46)"/></g>
  <circle class="cf cf4" cx="224" cy="28" r="3.5" fill="#e0bd3f"/>
  <g class="cf cf5"><rect x="285.5" y="107.5" width="13" height="5" rx="2.5" fill="#9fd3f2" transform="rotate(62 292 110)"/></g>
  <g class="cf cf6"><rect x="231.5" y="165.5" width="13" height="5" rx="2.5" fill="#c9b3f2" transform="rotate(-40 238 168)"/></g>
</svg>`,
  kostuem: `<svg class="art art-kostuem" viewBox="0 0 320 220" aria-hidden="true" focusable="false">
  <path d="M58 50C96 20 178 18 240 28C290 36 314 74 308 120C302 166 266 198 200 202C140 206 64 204 36 168C12 136 22 80 58 50Z" fill="#efe8fd"/>
  <rect x="40" y="183" width="264" height="9" rx="4.5" fill="#c9b3f2" opacity=".45"/>
  <g class="ks-float-a" fill="none" stroke-width="5" stroke-linecap="round">
    <path d="M30 48L38 42" stroke="#f4a3c0"/>
    <path d="M150 30L157 35" stroke="#a8e0b8"/>
    <path d="M148 205L156 201" stroke="#c9b3f2"/>
    <circle cx="70" cy="28" r="3.5" fill="#9fd3f2" stroke="none"/>
    <circle cx="296" cy="26" r="3" fill="#fae27c" stroke="none"/>
  </g>
  <g class="ks-float-b" fill="none" stroke-width="5" stroke-linecap="round">
    <path d="M16 112L19 121" stroke="#fae27c"/>
    <path d="M311 122L313 131" stroke="#9fd3f2"/>
    <circle cx="226" cy="22" r="3" fill="#f4a3c0" stroke="none"/>
    <circle cx="22" cy="190" r="3.5" fill="#a8e0b8" stroke="none"/>
  </g>
  <g class="ks-stand">
    <rect x="172" y="180" width="24" height="7" rx="3.5" fill="#8266c6"/>
    <rect x="288" y="180" width="24" height="7" rx="3.5" fill="#8266c6"/>
    <path d="M184 60V178M300 60V178" stroke="#9f86d9" stroke-width="6" stroke-linecap="round"/>
    <rect x="172" y="176" width="24" height="7" rx="3.5" fill="#9f86d9"/>
    <rect x="288" y="176" width="24" height="7" rx="3.5" fill="#9f86d9"/>
    <rect x="178" y="55" width="128" height="7" rx="3.5" fill="#8266c6"/>
    <rect x="178" y="51" width="128" height="7" rx="3.5" fill="#9f86d9"/>
    <circle cx="176" cy="58" r="6" fill="#8266c6"/>
    <circle cx="176" cy="54.5" r="6" fill="#9f86d9"/>
    <circle cx="308" cy="58" r="6" fill="#8266c6"/>
    <circle cx="308" cy="54.5" r="6" fill="#9f86d9"/>
  </g>
  <g class="ks-hanger">
    <path d="M242 71V66C242 62 235.5 61 235.5 55A6.5 6.5 0 0 1 248.5 55C248.5 58.5 247 60.5 244.5 60.5" fill="none" stroke="#3b2340" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M242 71L212 86Q205 90 212 91H272Q279 90 272 86Z" fill="none" stroke="#3b2340" stroke-width="3.5" stroke-linejoin="round"/>
    <g class="ks-skirt">
      <path d="M210 124H274L284 141A8.4 6 0 0 1 267.2 141A8.4 6 0 0 1 250.4 141A8.4 6 0 0 1 233.6 141A8.4 6 0 0 1 216.8 141A8.4 6 0 0 1 200 141Z" fill="#fff"/>
      <g fill="#d97499">
        <circle cx="208.4" cy="143.6" r="1.5"/>
        <circle cx="225.2" cy="143.6" r="1.5"/>
        <circle cx="242" cy="143.6" r="1.5"/>
        <circle cx="258.8" cy="143.6" r="1.5"/>
        <circle cx="275.6" cy="143.6" r="1.5"/>
      </g>
      <path d="M223 106H261C266 118 272 129 281 135A9.75 7 0 0 1 261.5 135A9.75 7 0 0 1 242 135A9.75 7 0 0 1 222.5 135A9.75 7 0 0 1 203 135C212 129 218 118 223 106Z" fill="#d97499"/>
      <path d="M223 101H261C266 113 272 124 281 130A9.75 7 0 0 1 261.5 130A9.75 7 0 0 1 242 130A9.75 7 0 0 1 222.5 130A9.75 7 0 0 1 203 130C212 124 218 113 223 101Z" fill="#f4a3c0"/>
      <path d="M233 107Q231 116 228 125M251 107Q253 116 256 125" fill="none" stroke="#d97499" stroke-width="3" stroke-linecap="round"/>
      <path d="M224 110L219 119" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".7"/>
      <rect x="220" y="95" width="44" height="8" rx="4" fill="#d97499"/>
    </g>
    <rect x="221" y="88" width="6" height="10" rx="2.5" fill="#3b2340"/>
    <rect x="257" y="88" width="6" height="10" rx="2.5" fill="#3b2340"/>
  </g>
  <g transform="translate(144 80)"><path class="ks-spark ks-s1" d="M0 -8C.8 -2.4 2.4 -.8 8 0C2.4 .8 .8 2.4 0 8C-.8 2.4 -2.4 .8 -8 0C-2.4 -.8 -.8 -2.4 0 -8Z" fill="#e0bd3f" stroke="#e0bd3f" stroke-width="2" stroke-linejoin="round"/></g>
  <g transform="translate(206 75) scale(.8)"><path class="ks-spark ks-s2" d="M0 -8C.8 -2.4 2.4 -.8 8 0C2.4 .8 .8 2.4 0 8C-.8 2.4 -2.4 .8 -8 0C-2.4 -.8 -.8 -2.4 0 -8Z" fill="#e0bd3f" stroke="#e0bd3f" stroke-width="2" stroke-linejoin="round"/></g>
  <g transform="translate(262 166) scale(.75)"><path class="ks-spark ks-s3" d="M0 -8C.8 -2.4 2.4 -.8 8 0C2.4 .8 .8 2.4 0 8C-.8 2.4 -2.4 .8 -8 0C-2.4 -.8 -.8 -2.4 0 -8Z" fill="#e0bd3f" stroke="#e0bd3f" stroke-width="2" stroke-linejoin="round"/></g>
  <g transform="translate(92 134)">
    <path d="M-11 24L-13 45M11 24L13 45" stroke="#3b2340" stroke-width="3.5" stroke-linecap="round"/>
    <ellipse cx="-16" cy="48" rx="7.5" ry="4.5" fill="#3b2340"/>
    <ellipse cx="16" cy="48" rx="7.5" ry="4.5" fill="#3b2340"/>
    <g class="mascot ks-bob">
      <path d="M-26 19Q-40 24 -44 33" fill="none" stroke="#3b2340" stroke-width="3.5" stroke-linecap="round"/>
      <circle cx="-45" cy="35.5" r="6" fill="#fff" stroke="#3b2340" stroke-width="2.6"/>
      <g class="ks-arm">
        <path d="M26 19Q46 38 67 24" fill="none" stroke="#3b2340" stroke-width="3.5" stroke-linecap="round"/>
        <circle cx="69" cy="22" r="6" fill="#fff" stroke="#3b2340" stroke-width="2.6"/>
      </g>
      <path d="M-30 0L-58 -20L-52 -9L-60 -3L-52 3L-60 9L-52 15L-58 20Z" fill="#c9b3f2"/>
      <path d="M30 0L58 -20L52 -9L60 -3L52 3L60 9L52 15L58 20Z" fill="#c9b3f2"/>
      <ellipse cy="5" rx="36" ry="28" fill="#9f86d9"/>
      <ellipse rx="36" ry="28" fill="#c9b3f2"/>
      <rect x="-24" y="-20" width="16" height="5" rx="2.5" fill="#fff" opacity=".7"/>
      <g class="eyes"><ellipse cx="-11" cy="-2" rx="3.4" ry="4.4" fill="#3b2340"/><ellipse cx="11" cy="-2" rx="3.4" ry="4.4" fill="#3b2340"/></g>
      <ellipse cx="-19" cy="8" rx="5" ry="3" fill="#9f86d9" opacity=".7"/><ellipse cx="19" cy="8" rx="5" ry="3" fill="#9f86d9" opacity=".7"/>
      <path d="M-6 8Q0 14 6 8" fill="none" stroke="#3b2340" stroke-width="2.6" stroke-linecap="round"/>
      <g transform="translate(3 -25) rotate(-6)">
        <g class="ks-hat">
          <g class="ks-plume">
            <path d="M6 -5C2 -15 8 -27 19 -32C21 -22 17 -11 10 -5Z" fill="#d97499"/>
            <path d="M6 -8C2 -18 8 -30 19 -35C21 -25 17 -14 10 -8Z" fill="#f4a3c0"/>
          </g>
          <path d="M-14 -8C-14 -22 14 -22 14 -8Z" fill="#664a6a"/>
          <path d="M-27 -17Q-14 -7 0 -9Q14 -7 27 -17Q24 -3 12 1L3 4.5Q0 5.8 -3 4.5L-12 1Q-24 -3 -27 -17Z" fill="#3b2340" stroke="#3b2340" stroke-width="3" stroke-linejoin="round"/>
          <path d="M-24 -13.8Q-13.5 -5.6 0 -7.5Q13.5 -5.6 24 -13.8" fill="none" stroke="#f4a3c0" stroke-width="3" stroke-linecap="round"/>
          <circle cy="-1.5" r="4" fill="#f4a3c0"/>
          <circle cy="-1.5" r="1.6" fill="#fff"/>
        </g>
      </g>
    </g>
  </g>
</svg>`,
  packliste: `<svg class="art art-packliste" viewBox="0 0 320 220" aria-hidden="true">
  <defs>
    <clipPath id="art-packliste-clip"><path clip-rule="evenodd" d="M0 0H320V220H0Z M125 111L132 103L140 110L149 101L158 109L167 100L176 108L186 101L194 109L201 102L207 111L211 197H121Z"/></clipPath>
  </defs>
  <path fill="#e3f6e8" d="M58 38C108 14 200 16 252 32C300 46 312 100 312 150C312 196 288 208 220 208H110C34 208 8 200 8 160C8 110 14 60 58 38Z"/>
  <g class="pk-conf pk-conf-a">
    <rect x="25.5" y="40.25" width="13" height="5.5" rx="2.75" fill="#f4a3c0" transform="rotate(-28 32 43)"/>
    <rect x="153.5" y="23.25" width="13" height="5.5" rx="2.75" fill="#e0bd3f" transform="rotate(-14 160 26)"/>
    <circle cx="212" cy="34" r="3.2" fill="#e0bd3f"/>
    <rect x="293.5" y="77.25" width="13" height="5.5" rx="2.75" fill="#9fd3f2" transform="rotate(52 300 80)"/>
  </g>
  <g class="pk-conf pk-conf-b">
    <circle cx="82" cy="28" r="3.5" fill="#f4a3c0"/>
    <circle cx="16" cy="102" r="3" fill="#9fd3f2"/>
    <rect x="239.5" y="49.25" width="13" height="5.5" rx="2.75" fill="#c9b3f2" transform="rotate(24 246 52)"/>
    <rect x="207.5" y="73.25" width="13" height="5.5" rx="2.75" fill="#6fbf88" transform="rotate(-38 214 76)"/>
  </g>
  <g class="pk-bag">
    <path fill="#d97499" stroke="#d97499" stroke-width="3" stroke-linejoin="round" d="M129 118V100L137 94L146 99L155 93L164 98L173 92L182 98L191 93L199 99L203 97V118Z"/>
    <path fill="#d97499" stroke="#d97499" stroke-width="3" stroke-linejoin="round" transform="translate(0 5)" d="M125 112L132 104L140 111L149 102L158 110L167 101L176 109L186 102L194 110L201 103L207 112L210 183Q210 188 205 188H127Q122 188 122 183Z"/>
    <path fill="#f4a3c0" stroke="#f4a3c0" stroke-width="3" stroke-linejoin="round" d="M125 112L132 104L140 111L149 102L158 110L167 101L176 109L186 102L194 110L201 103L207 112L210 183Q210 188 205 188H127Q122 188 122 183Z"/>
    <path fill="#d97499" stroke="#d97499" stroke-width="3" stroke-linejoin="round" opacity=".45" d="M125 112L136 121L134 188H127Q122 188 122 183ZM207 112L196 121L198 188H205Q210 188 210 183Z"/>
    <path fill="none" stroke="#d97499" stroke-width="3" stroke-linecap="round" opacity=".8" d="M151 127L159 130M188 124L194 121.5M184 174L178 180"/>
    <rect x="139.5" y="118" width="5" height="12" rx="2.5" fill="#fff" opacity=".6"/>
    <g transform="rotate(-5 166 152)">
      <rect x="141" y="141" width="50" height="22" rx="11" fill="#fff"/>
      <path fill="#d97499" d="M159 152L152.5 147.5L154 152L152.5 156.5ZM173 152L179.5 147.5L178 152L179.5 156.5Z"/>
      <ellipse cx="166" cy="152" rx="8" ry="6" fill="#d97499"/>
      <rect x="161" y="148" width="5" height="2" rx="1" fill="#fff" opacity=".7"/>
    </g>
  </g>
  <g clip-path="url(#art-packliste-clip)">
    <g class="pk-item pk-phone">
      <g class="pk-hop">
        <g transform="rotate(-6 29 194)">
          <rect x="18" y="156" width="22" height="38" rx="7" fill="#9f86d9"/>
          <rect x="18" y="152" width="22" height="38" rx="7" fill="#c9b3f2"/>
          <rect x="21.5" y="157" width="15" height="23" rx="3.5" fill="#fff"/>
          <rect x="24" y="161" width="9" height="5" rx="2.5" fill="#c9b3f2"/>
          <rect x="26" y="169" width="8" height="5" rx="2.5" fill="#9f86d9"/>
          <path d="M26 185H32" fill="none" stroke="#3b2340" stroke-width="3" stroke-linecap="round"/>
        </g>
      </g>
    </g>
    <g class="pk-item pk-bottle">
      <g class="pk-hop">
        <rect x="48" y="164" width="20" height="30" rx="7" fill="#69b0dc"/>
        <rect x="52.5" y="152" width="11" height="12" rx="3" fill="#9fd3f2"/>
        <rect x="51.5" y="145" width="13" height="9" rx="3.5" fill="#69b0dc"/>
        <rect x="48" y="160" width="20" height="30" rx="7" fill="#9fd3f2"/>
        <rect x="48" y="169" width="20" height="12" fill="#fff"/>
        <path fill="#69b0dc" d="M58 170.8C59.9 173.2 61 174.6 61 176A3 3 0 0 1 55 176C55 174.6 56.1 173.2 58 170.8Z"/>
        <rect x="50.75" y="162.5" width="3.5" height="5" rx="1.75" fill="#fff" opacity=".7"/>
      </g>
    </g>
    <g class="pk-item pk-shoe">
      <g class="pk-hop">
        <path fill="#e0bd3f" transform="translate(0 4)" d="M79 158H93Q96 158 96 161V169Q96 173.5 101 174.5L104 175Q110 176 110 182V186Q110 190 106 190H80Q76 190 76 186V161Q76 158 79 158Z"/>
        <path fill="#fae27c" d="M79 158H93Q96 158 96 161V169Q96 173.5 101 174.5L104 175Q110 176 110 182V186Q110 190 106 190H80Q76 190 76 186V161Q76 158 79 158Z"/>
        <path fill="#e0bd3f" d="M79 158H93Q96 158 96 161V163H76V161Q76 158 79 158Z"/>
        <path fill="#fff" d="M76 185H110V186Q110 190 106 190H80Q76 190 76 186Z"/>
        <path d="M86 167L93 169M86 172.5L93 174.5" fill="none" stroke="#3b2340" stroke-width="3" stroke-linecap="round"/>
        <rect x="79" y="166" width="3.5" height="8" rx="1.75" fill="#fff" opacity=".7"/>
      </g>
    </g>
  </g>
  <g transform="translate(268 158) scale(.74)">
    <g class="pk-cheer">
      <g class="pk-arms" fill="none" stroke="#3b2340" stroke-linecap="round">
        <path d="M-16 -6Q-30 -22 -38 -46M16 -6Q30 -22 38 -46" stroke-width="5"/>
        <circle cx="-38" cy="-48" r="5.5" fill="#3b2340" stroke="none"/>
        <circle cx="38" cy="-48" r="5.5" fill="#3b2340" stroke="none"/>
        <path d="M-40 -59L-42 -66M-47 -55L-53 -59M40 -59L42 -66M47 -55L53 -59" stroke-width="4"/>
      </g>
      <path d="M-11 16L-14 46H-22M11 16L14 46H22" fill="none" stroke="#3b2340" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
      <g class="mascot">
        <path d="M-30 0L-58 -20L-52 -9L-60 -3L-52 3L-60 9L-52 15L-58 20Z" fill="#a8e0b8"/>
        <path d="M30 0L58 -20L52 -9L60 -3L52 3L60 9L52 15L58 20Z" fill="#a8e0b8"/>
        <ellipse cy="5" rx="36" ry="28" fill="#6fbf88"/>
        <ellipse rx="36" ry="28" fill="#a8e0b8"/>
        <rect x="-24" y="-20" width="16" height="5" rx="2.5" fill="#fff" opacity=".7"/>
        <g class="eyes"><ellipse cx="-11" cy="-2" rx="3.4" ry="4.4" fill="#3b2340"/><ellipse cx="11" cy="-2" rx="3.4" ry="4.4" fill="#3b2340"/></g>
        <ellipse cx="-19" cy="8" rx="5" ry="3" fill="#6fbf88" opacity=".7"/><ellipse cx="19" cy="8" rx="5" ry="3" fill="#6fbf88" opacity=".7"/>
        <path d="M-6 8Q0 14 6 8" fill="none" stroke="#3b2340" stroke-width="2.6" stroke-linecap="round"/>
      </g>
    </g>
  </g>
</svg>`,
  notizen: `<svg class="art art-notizen" viewBox="0 0 320 220" aria-hidden="true" focusable="false">
  <path d="M62 52C104 22 196 20 246 34C292 48 306 92 298 134C290 176 246 204 180 206C116 208 50 198 30 156C14 122 26 78 62 52Z" fill="#e2f2fc"/>
  <g transform="translate(52 72) rotate(-35)"><rect class="bit c1" x="-6.5" y="-2.5" width="13" height="5" rx="2.5" fill="#f4a3c0"/></g>
  <g transform="translate(270 42)"><circle class="bit c2" r="4" fill="#fae27c"/></g>
  <g transform="translate(274 156) rotate(28)"><rect class="bit c3" x="-6.5" y="-2.5" width="13" height="5" rx="2.5" fill="#a8e0b8"/></g>
  <circle cx="44" cy="150" r="3.5" fill="#c9b3f2"/>
  <rect x="-4.5" y="-2" width="9" height="4" rx="2" transform="translate(292 98) rotate(-25)" fill="#9fd3f2"/>
  <g class="lean" transform="translate(3.26 0)">
    <g class="mascot" transform="translate(168 71)">
      <path d="M-30 0L-58 -20L-52 -9L-60 -3L-52 3L-60 9L-52 15L-58 20Z" fill="#9fd3f2"/>
      <path d="M30 0L58 -20L52 -9L60 -3L52 3L60 9L52 15L58 20Z" fill="#9fd3f2"/>
      <ellipse cy="5" rx="36" ry="28" fill="#69b0dc"/>
      <ellipse rx="36" ry="28" fill="#9fd3f2"/>
      <rect x="-24" y="-20" width="16" height="5" rx="2.5" fill="#fff" opacity=".7"/>
      <g class="look" transform="translate(-0.31 1.6)"><g class="eyes"><ellipse cx="-11" cy="-2" rx="3.4" ry="4.4" fill="#3b2340"/><ellipse cx="11" cy="-2" rx="3.4" ry="4.4" fill="#3b2340"/></g></g>
      <ellipse cx="-19" cy="8" rx="5" ry="3" fill="#69b0dc" opacity=".7"/><ellipse cx="19" cy="8" rx="5" ry="3" fill="#69b0dc" opacity=".7"/>
      <path d="M-6 8Q0 14 6 8" fill="none" stroke="#3b2340" stroke-width="2.6" stroke-linecap="round"/>
    </g>
  </g>
  <path d="M88 98A10.89 10.89 0 0 1 104 98A10.89 10.89 0 0 1 120 98A10.89 10.89 0 0 1 136 98A10.89 10.89 0 0 1 152 98A10.89 10.89 0 0 1 168 98A10.89 10.89 0 0 1 184 98A10.89 10.89 0 0 1 200 98A10.89 10.89 0 0 1 216 98A10.89 10.89 0 0 1 232 98V190A10.89 10.89 0 0 1 216 190A10.89 10.89 0 0 1 200 190A10.89 10.89 0 0 1 184 190A10.89 10.89 0 0 1 168 190A10.89 10.89 0 0 1 152 190A10.89 10.89 0 0 1 136 190A10.89 10.89 0 0 1 120 190A10.89 10.89 0 0 1 104 190A10.89 10.89 0 0 1 88 190Z" fill="#69b0dc"/>
  <path d="M88 93A10.89 10.89 0 0 1 104 93A10.89 10.89 0 0 1 120 93A10.89 10.89 0 0 1 136 93A10.89 10.89 0 0 1 152 93A10.89 10.89 0 0 1 168 93A10.89 10.89 0 0 1 184 93A10.89 10.89 0 0 1 200 93A10.89 10.89 0 0 1 216 93A10.89 10.89 0 0 1 232 93V185A10.89 10.89 0 0 1 216 185A10.89 10.89 0 0 1 200 185A10.89 10.89 0 0 1 184 185A10.89 10.89 0 0 1 168 185A10.89 10.89 0 0 1 152 185A10.89 10.89 0 0 1 136 185A10.89 10.89 0 0 1 120 185A10.89 10.89 0 0 1 104 185A10.89 10.89 0 0 1 88 185Z" fill="#ffffff"/>
  <g fill="none" stroke="#e2f2fc" stroke-width="2" stroke-linecap="round"><path d="M100 125H220"/><path d="M100 145H220"/><path d="M100 163H220"/></g>
  <path class="ink l1" d="M106 119Q109.35 112.2 112.71 119Q115.58 125 118.46 119Q122.05 110.6 125.65 119Q128.52 123.8 131.4 119Q134.75 111.4 138.1 119Q141.46 124.6 144.81 119Q148.41 112.2 152 119" fill="none" stroke="#3b2340" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="69.13 108.13" stroke-dashoffset="0"/>
  <path class="ink l2" d="M106 139Q109.63 134.2 113.25 139Q116.88 145.4 120.51 139Q123.88 135 127.24 139Q131.13 146.6 135.02 139Q138.64 134.6 142.27 139Q145.38 140.2 148.49 139Q152.11 133.8 155.74 139Q159.63 145.8 163.51 139Q166.88 135.4 170.25 139Q173.88 144.6 177.5 139Q180.61 137.8 183.72 139Q187.35 143.4 190.97 139Q194.6 131.8 198.23 139Q202.11 143.8 206 139" fill="none" stroke="#3b2340" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="127.39 166.39" stroke-dashoffset="47.34"/>
  <path class="ink l3" d="M106 157Q109.56 151.8 113.11 157Q116.92 163.8 120.73 157Q124.03 153 127.33 157Q130.89 163 134.44 157Q137.49 155.8 140.54 157Q144.1 161.8 147.65 157Q151.46 149.8 155.27 157Q158.83 161.4 162.38 157Q166.19 151.4 170 157" fill="none" stroke="#3b2340" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="83.06 122.06" stroke-dashoffset="83.06" opacity="0"/>
  <g class="lean" transform="translate(3.26 0)">
    <path d="M197 86L206 96" stroke="#3b2340" stroke-width="3.5" stroke-linecap="round"/>
    <circle cx="206" cy="98" r="5.2" fill="#69b0dc"/>
    <circle cx="206" cy="96" r="5.2" fill="#9fd3f2"/>
    <circle cx="141" cy="88" r="1.9" fill="#3b2340"/>
  </g>
  <path class="arm" d="M0 -1.75Q.5 7.25 1 -1.75V1.75Q.5 10.75 0 1.75Z" transform="translate(144.26 88) rotate(68.75) scale(42.68 1)" fill="#3b2340"/>
  <g class="pen" transform="translate(168.8 138.46)">
    <g transform="rotate(50)">
      <rect x="-40" y="-5" width="8" height="10" rx="3.5" fill="#f4a3c0"/>
      <path d="M-32 1.5H-40A3.5 3.5 0 0 0 -36.5 5H-32Z" fill="#d97499"/>
      <rect x="-35" y="-5" width="4" height="10" fill="#c9b3f2"/>
      <rect x="-35" y="1.5" width="4" height="3.5" fill="#9f86d9"/>
      <rect x="-31" y="-5" width="20" height="10" fill="#fae27c"/>
      <rect x="-31" y="1.5" width="20" height="3.5" fill="#e0bd3f"/>
      <path d="M0 0L-11 -5L-11 5Z" fill="#fff6cf"/>
      <path d="M0 0L-4 -1.82L-4 1.82Z" fill="#3b2340" stroke="#3b2340" stroke-width="1.2" stroke-linejoin="round"/>
    </g>
    <circle cx="-9" cy="-8.72" r="5.2" fill="#69b0dc"/>
    <circle cx="-9" cy="-10.72" r="5.2" fill="#9fd3f2"/>
  </g>
</svg>`,
  suche: `<svg class="art art-suche" viewBox="0 0 320 220" aria-hidden="true" focusable="false">
  <path d="M42 130C40 76 90 36 150 34C214 32 286 48 286 100C286 158 240 200 172 200C104 200 44 184 42 130Z" fill="#e2f2fc"/>
  <circle cx="40" cy="164" r="3.5" fill="#f4a3c0"/>
  <circle cx="296" cy="64" r="3" fill="#c9b3f2"/>
  <g transform="translate(86 190) rotate(-20)"><rect x="-6" y="-2.5" width="12" height="5" rx="2.5" fill="#69b0dc"/></g>
  <g transform="translate(58 72) rotate(35)"><rect class="art-suche-bit art-suche-bit1" x="-7" y="-2.75" width="14" height="5.5" rx="2.75" fill="#f4a3c0"/></g>
  <g transform="translate(274 150) rotate(-28)"><rect class="art-suche-bit art-suche-bit2" x="-7" y="-2.75" width="14" height="5.5" rx="2.75" fill="#e0bd3f"/></g>
  <circle class="art-suche-bit art-suche-bit3" cx="236" cy="186" r="4" fill="#6fbf88"/>
  <g transform="translate(196 26) rotate(18)"><rect class="art-suche-bit art-suche-bit4" x="-6" y="-2.5" width="12" height="5" rx="2.5" fill="#c9b3f2"/></g>
  <g transform="translate(96 60)">
    <g class="art-suche-q art-suche-q1">
      <g transform="rotate(-14)">
        <path d="M-6.5 -7.5C-6.5 -14.5 6.5 -14.5 6.5 -7.5C6.5 -2.5 0 -2 0 3.5" fill="none" stroke="#3b2340" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cy="10.5" r="2.3" fill="#3b2340"/>
      </g>
    </g>
  </g>
  <g transform="translate(164 52)">
    <g class="art-suche-q art-suche-q2">
      <g transform="rotate(12)">
        <path d="M-6.5 -7.5C-6.5 -14.5 6.5 -14.5 6.5 -7.5C6.5 -2.5 0 -2 0 3.5" fill="none" stroke="#3b2340" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cy="10.5" r="2.3" fill="#3b2340"/>
      </g>
    </g>
  </g>
  <g transform="translate(128 112) scale(1.15)">
    <ellipse cy="47.5" rx="38" ry="5.5" fill="#9fd3f2" opacity=".55"/>
    <path d="M-11 24L-13 41M11 24L13 41" fill="none" stroke="#3b2340" stroke-width="3.2" stroke-linecap="round"/>
    <ellipse cx="-16" cy="43.5" rx="7.5" ry="4.2" fill="#3b2340"/>
    <ellipse cx="16" cy="43.5" rx="7.5" ry="4.2" fill="#3b2340"/>
    <g class="art-suche-lean">
      <rect x="-150" y="-82" width="300" height="220" fill="none"/>
      <path d="M-22 14Q-40 36 -54 34M22 14Q48 36 71 27" fill="none" stroke="#3b2340" stroke-width="3.2" stroke-linecap="round"/>
      <g class="mascot">
        <path d="M-30 0L-58 -20L-52 -9L-60 -3L-52 3L-60 9L-52 15L-58 20Z" fill="#9fd3f2"/>
        <path d="M30 0L58 -20L52 -9L60 -3L52 3L60 9L52 15L58 20Z" fill="#9fd3f2"/>
        <ellipse cy="5" rx="36" ry="28" fill="#69b0dc"/>
        <ellipse rx="36" ry="28" fill="#9fd3f2"/>
        <rect x="-24" y="-20" width="16" height="5" rx="2.5" fill="#fff" opacity=".7"/>
        <g class="art-suche-face">
          <g class="eyes"><ellipse cx="-11" cy="-2" rx="3.4" ry="4.4" fill="#3b2340"/><ellipse cx="11" cy="-2" rx="3.4" ry="4.4" fill="#3b2340"/></g>
          <ellipse cx="-19" cy="8" rx="5" ry="3" fill="#69b0dc" opacity=".7"/><ellipse cx="19" cy="8" rx="5" ry="3" fill="#69b0dc" opacity=".7"/>
          <path d="M-6 8Q0 14 6 8" fill="none" stroke="#3b2340" stroke-width="2.6" stroke-linecap="round"/>
        </g>
      </g>
      <circle cx="-57" cy="34" r="6.3" fill="#fff" stroke="#3b2340" stroke-width="3"/>
      <g transform="translate(74 26) rotate(18) scale(1.12)">
        <g class="art-suche-sweep">
          <rect x="-25" y="-85" width="50" height="170" fill="none"/>
          <rect x="-4" y="-34" width="8" height="43" rx="4" fill="#3b2340"/>
          <circle cx="1.24" cy="-56.2" r="19" fill="none" stroke="#e0bd3f" stroke-width="8"/>
          <rect x="-6.07" y="-37.15" width="14" height="10" rx="4" fill="#e0bd3f"/>
          <rect x="-7" y="-40" width="14" height="10" rx="4" fill="#fae27c"/>
          <circle cy="-60" r="15.5" fill="#fff" opacity=".7"/>
          <circle cy="-60" r="19" fill="none" stroke="#fae27c" stroke-width="8"/>
          <path d="M-9.4 -63.4A10 10 0 0 1 -3.4 -69.4" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
          <circle cx="-9.7" cy="-57.4" r="1.8" fill="#fff"/>
        </g>
      </g>
      <circle cx="74" cy="26" r="6.3" fill="#fff" stroke="#3b2340" stroke-width="3"/>
    </g>
  </g>
</svg>`,
  aufstellung: `<svg class="art art-aufstellung" viewBox="0 0 320 220" aria-hidden="true">
  <path d="M58 64C62 32 112 16 166 18C224 20 276 34 284 76C292 116 262 150 206 156C150 162 64 158 44 120C34 100 54 86 58 64Z" fill="#efe8fd"/>
  <g>
    <rect x="-6" y="-2.5" width="12" height="5" rx="2.5" fill="#9fd3f2" transform="translate(112 34) rotate(24)"/>
    <circle cx="206" cy="30" r="3.2" fill="#f4a3c0"/>
    <circle cx="34" cy="96" r="3" fill="#a8e0b8"/>
    <rect x="-6" y="-2.5" width="12" height="5" rx="2.5" fill="#f4a3c0" transform="translate(292 104) rotate(-30)"/>
  </g>
  <g class="aufst-bit aufst-bit-a"><rect x="42" y="47.5" width="13" height="5.5" rx="2.75" fill="#fae27c" transform="rotate(-28 48.5 50.25)"/></g>
  <g class="aufst-bit aufst-bit-b"><rect x="254" y="40" width="13" height="5.5" rx="2.75" fill="#a8e0b8" transform="rotate(32 260.5 42.75)"/></g>
  <g class="aufst-bit aufst-bit-c"><circle cx="248" cy="72" r="3.4" fill="#9f86d9"/></g>
  <ellipse cx="160" cy="156" rx="134" ry="54" fill="#9f86d9"/>
  <ellipse cx="160" cy="150" rx="134" ry="54" fill="#c9b3f2"/>
  <ellipse cx="160" cy="148" rx="124" ry="47" fill="#efe8fd"/>
  <path d="M160 107V189" fill="none" stroke="#9f86d9" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="0 9"/>
  <path d="M152.2 178.24L167.8 187.04M167.8 178.24L152.2 187.04M90.24 121.51L103.24 128.91M103.24 121.51L90.24 128.91M216.76 121.51L229.76 128.91M229.76 121.51L216.76 128.91" fill="none" stroke="#9f86d9" stroke-width="3" stroke-linecap="round"/>
  <g fill="none" stroke="#8266c6" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="4 7 7 7 11 7 14 227" stroke-dashoffset="-70.68">
    <path class="aufst-trail" d="M160 182.64A84 34.64 0 0 1 96.74 125.21"/>
    <path class="aufst-trail" d="M96.74 125.21A84 34.64 0 0 1 223.26 125.21"/>
    <path class="aufst-trail" d="M223.26 125.21A84 34.64 0 0 1 160 182.64"/>
  </g>
  <g class="aufst-dancer aufst-dancer-3" transform="translate(223.26 102.75) scale(0.511)">
    <path d="M-24 -10Q-36 -16 -40 -34M24 -10Q36 -16 40 -34M-10 18L-12 44L-19 44M10 18L12 44L19 44" fill="none" stroke="#3b2340" stroke-width="6.5" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="-40" cy="-36" r="5.5" fill="#fff" stroke="#3b2340" stroke-width="4"/><circle cx="40" cy="-36" r="5.5" fill="#fff" stroke="#3b2340" stroke-width="4"/>
    <g class="mascot">
      <path d="M-30 0L-58 -20L-52 -9L-60 -3L-52 3L-60 9L-52 15L-58 20Z" fill="#a8e0b8"/>
      <path d="M30 0L58 -20L52 -9L60 -3L52 3L60 9L52 15L58 20Z" fill="#a8e0b8"/>
      <ellipse cy="5" rx="36" ry="28" fill="#6fbf88"/>
      <ellipse rx="36" ry="28" fill="#a8e0b8"/>
      <rect x="-24" y="-20" width="16" height="5" rx="2.5" fill="#fff" opacity=".7"/>
      <g class="eyes"><ellipse cx="-11" cy="-2" rx="3.4" ry="4.4" fill="#3b2340"/><ellipse cx="11" cy="-2" rx="3.4" ry="4.4" fill="#3b2340"/></g>
      <ellipse cx="-19" cy="8" rx="5" ry="3" fill="#6fbf88" opacity=".7"/><ellipse cx="19" cy="8" rx="5" ry="3" fill="#6fbf88" opacity=".7"/>
      <path d="M-6 8Q0 14 6 8" fill="none" stroke="#3b2340" stroke-width="2.6" stroke-linecap="round"/>
    </g>
  </g>
  <g class="aufst-dancer aufst-dancer-2" transform="translate(96.74 102.75) scale(0.511)">
    <path d="M-24 -10Q-36 -16 -40 -34M24 -10Q36 -16 40 -34M-10 18L-12 44L-19 44M10 18L12 44L19 44" fill="none" stroke="#3b2340" stroke-width="6.5" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="-40" cy="-36" r="5.5" fill="#fff" stroke="#3b2340" stroke-width="4"/><circle cx="40" cy="-36" r="5.5" fill="#fff" stroke="#3b2340" stroke-width="4"/>
    <g class="mascot">
      <path d="M-30 0L-58 -20L-52 -9L-60 -3L-52 3L-60 9L-52 15L-58 20Z" fill="#fae27c"/>
      <path d="M30 0L58 -20L52 -9L60 -3L52 3L60 9L52 15L58 20Z" fill="#fae27c"/>
      <ellipse cy="5" rx="36" ry="28" fill="#e0bd3f"/>
      <ellipse rx="36" ry="28" fill="#fae27c"/>
      <rect x="-24" y="-20" width="16" height="5" rx="2.5" fill="#fff" opacity=".7"/>
      <g class="eyes"><ellipse cx="-11" cy="-2" rx="3.4" ry="4.4" fill="#3b2340"/><ellipse cx="11" cy="-2" rx="3.4" ry="4.4" fill="#3b2340"/></g>
      <ellipse cx="-19" cy="8" rx="5" ry="3" fill="#e0bd3f" opacity=".7"/><ellipse cx="19" cy="8" rx="5" ry="3" fill="#e0bd3f" opacity=".7"/>
      <path d="M-6 8Q0 14 6 8" fill="none" stroke="#3b2340" stroke-width="2.6" stroke-linecap="round"/>
    </g>
  </g>
  <g class="aufst-dancer aufst-dancer-1" transform="translate(160 155.8) scale(0.61)">
    <path d="M-24 -10Q-36 -16 -40 -34M24 -10Q36 -16 40 -34M-10 18L-12 44L-19 44M10 18L12 44L19 44" fill="none" stroke="#3b2340" stroke-width="6.5" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="-40" cy="-36" r="5.5" fill="#fff" stroke="#3b2340" stroke-width="4"/><circle cx="40" cy="-36" r="5.5" fill="#fff" stroke="#3b2340" stroke-width="4"/>
    <g class="mascot">
      <path d="M-30 0L-58 -20L-52 -9L-60 -3L-52 3L-60 9L-52 15L-58 20Z" fill="#f4a3c0"/>
      <path d="M30 0L58 -20L52 -9L60 -3L52 3L60 9L52 15L58 20Z" fill="#f4a3c0"/>
      <ellipse cy="5" rx="36" ry="28" fill="#d97499"/>
      <ellipse rx="36" ry="28" fill="#f4a3c0"/>
      <rect x="-24" y="-20" width="16" height="5" rx="2.5" fill="#fff" opacity=".7"/>
      <g class="eyes"><ellipse cx="-11" cy="-2" rx="3.4" ry="4.4" fill="#3b2340"/><ellipse cx="11" cy="-2" rx="3.4" ry="4.4" fill="#3b2340"/></g>
      <ellipse cx="-19" cy="8" rx="5" ry="3" fill="#d97499" opacity=".7"/><ellipse cx="19" cy="8" rx="5" ry="3" fill="#d97499" opacity=".7"/>
      <path d="M-6 8Q0 14 6 8" fill="none" stroke="#3b2340" stroke-width="2.6" stroke-linecap="round"/>
    </g>
  </g>
</svg>`,
};

const artObserver = 'IntersectionObserver' in window
  ? new IntersectionObserver(entries => {
    entries.forEach(entry => entry.target.classList.toggle('is-paused', !entry.isIntersecting));
  })
  : null;

function emptyArt(name) {
  return EMPTY_ART[name] ? `<div class="art-frame">${EMPTY_ART[name]}</div>` : '';
}

function watchArt() {
  if (!artObserver) return;
  artObserver.disconnect();
  document.querySelectorAll('.art').forEach(el => artObserver.observe(el));
}
