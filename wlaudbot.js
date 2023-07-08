const jaqwiDB = JSON.parse(window.localStorage.getItem('jaqwiDB'));
const wL = JSON.parse(window.localStorage.getItem('wL'));
let userDB = JSON.parse(window.localStorage.getItem('userDB'));
let wlaudDB = JSON.parse(window.localStorage.getItem('wlaudDB'));

let userMsg;
let userName;
let isHuman = true;
let isWlaud = false;
let jaqwiing = false;
let jaqwiTheme;
let jaqwiWord;
let jaqwiFail;
let life = true;

// 메시지를 보내주는 함수
function talk(a) {
    $("#Talk").val(a);
    $("#ChatBtn").trigger('click');
}

// 일반 메시지의 앞 단어가 a와 일치하는 지를 뱉어주는 함수
function isFirstMsg(a) {
    return userMsg.substring(0, a.length) === a;
}

// 일반 메시지의 앞 단어를 뺀 것을 뱉어주는 함수
function noFirstMsg(a) {
    return userMsg.substring(a.length);
}

// userdb[userName].talkmode에 따라 모드에 맞는 말을 뱉어주는 함수
function tm(a) {
    return userDB[userName].talkmode == "banmo" ? a.banmo
    : userDB[userName].talkmode == "jonmo" ? a.jonmo
    : a.banmo;
}

// 1~a 사이의 랜덤한 수와 조사를 붙여서 뱉어주는 함수
function dice(a) {
    let dicenumber = Math.floor(a*Math.random()) + 1;
    return [1, 3, 6, 7, 8, 0].includes(dicenumber % 10)
    ? `${dicenumber}이`
    : `${dicenumber}가`
}

// 리스트 중 랜덤한 것을 뱉어주는 함수
function random(list) {
    return list[Math.floor(Math.random() * list.length)];
}

// 단어나 문장을 한글 글자를 그 자음으로 바꿔서 뱉어주는 함수
function jaum(str) {
    cho = ["ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ","ㅁ","ㅂ","ㅃ","ㅅ","ㅆ","ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];
    result = "";
    for(i = 0; i < str.length; i++) {
        code = str.charCodeAt(i)-44032;
        if (code>-1 && code<11172) result += cho[Math.floor(code/588)];
        else result += str.charAt(i);
    }
    return result;
}

// localStorage userDB 업데이트
function setUserDB() {
    window.localStorage.setItem('userDB', JSON.stringify(userDB));
}

// localStorage wlaudDB 업데이트
function setwlaudDB() {
    window.localStorage.setItem('wlaudDB', JSON.stringify(wlaudDB));
}

const targetNode = document.getElementById('Chat');
const config = { attributes: true, childList: true, subtree: true };
const observer = new MutationObserver(() => {

    userMsg =  $(".chat-body").last().text();
    userName = $(".chat-head").last().text();
    isHuman = !(userName === "wlaudbot");
    isWlaud = userName === "wlaud";
    date = new Date();

    if (!(userName in userDB)) {
        userDB[userName] = {
            name: userName,
            talkmode: "banmo",
            exp: 0,
            money: 0,
            havejonmo: false,
        };
        setUserDB();
    };

    if (isHuman) {
        if (life || isWlaud) {
            switch (userMsg) {
                case "지명봇": 
                    talk(tm(wL.wlaudbot));
                    break;
                case "명령어":
                    // talk(`주사위 (수): ${tm(wL.helpdice)}`);
                    talk(`정보 (id): ${tm(wL.helpinfo)}`);
                    talk(`모드: ${tm(wL.helptm)}`);
                    talk(`상점: ${tm(wL.helpshop)}`);
                    talk(`명령어 돈벌기, 명령어 지명봇${tm(wL.help)}`);
                    break;
                /** case "주사위":
                    talk(`${dice(6)}${tm(wL.dice)}`); */
                    break;
                case "자퀴":
                    if (!jaqwiing) {
                        jaqwiing = true;
        
                        jaqwiTheme = random(Object.keys(jaqwiDB));
                        jaqwiWord = random(jaqwiDB[jaqwiTheme].words);
        
                        jaqwiFail = setTimeout(function() {
                            jaqwiing = false;
                            talk(tm(wL.jaqwifail));
                            talk(`정답: ${jaqwiWord}`);
                        }, 10000);
        
                        talk(`<${jaqwiTheme}> ${jaum(jaqwiWord)} / 제한 시간 : 10초`)
                    } else {
                        talk(tm(wL.jaqwiwait));
                    }
                    break;
                case jaqwiWord:
                    if (jaqwiing) {
                        jaqwiing = false;
            
                        userDB[userName].money += 1000;
                        setUserDB();
            
                        clearTimeout(jaqwiFail);
            
                        talk(`${userName}${tm(wL.nim)} 정답! ${userName}${tm(wL.nim)}의 돈: ${userDB[userName].money}원 (+1000원)`);
                        talk(`정답: ${jaqwiWord}`);
                    };
                    break;
                case "도박":
                    talk(tm(wL.emptymoney));
                    break;
                case "정보":
                    talk(`${userName}님의 정보`);
                    talk(`돈: ${userDB[userName].money}원`);
                    break;
                case "모드":
                    talk(`[대화 모드] ㅣ 모드 (모드 이름)${tm(wL.tm)}`);
                    let isbanmo = userDB[userName].talkmode == "banmo" ? "[반모] (적용 중)" : "[반모]";
                    let isjonmo = userDB[userName].talkmode == "jonmo" ? "[존모] (적용 중)"
                    : userDB[userName].havejonmo ? "[존모]"
                    : "[존모] (미구입)";
                    talk(`${isbanmo} / ${isjonmo}`);
                    break;
                case "상점":
                    talk(`[상점] ㅣ 구입 (구입할 것)${tm(wL.shop)}`)
                    userDB[userName].havejonmo
                    ? talk(`[존모] (구입 됨): 존댓말 모드`)
                    : talk(`[존모]: 존댓말 모드${tm(wL.abletm)} / 5000원`);
                    break;
                case "구입":
                    talk(`구입 (구입할 것)${tm(wL.shop)}`);
                    break;
            }

            if (isFirstMsg("명령어 ")) {
                switch (noFirstMsg("명령어 ")) {
                    case "돈벌기":
                        talk(`자퀴: ${tm(wL.helpjaqwi)}`);
                        // talk(`도박 (돈): ${tm(wL.helpgambl)}`);
                        break;
                    case "지명봇":
                        talk(`지명봇 (단어): ${tm(wL.helpwlaudbot)}`);
                        talk(`지명봇 단어 (단어) (뜻): ${tm(wL.helpwlaudbotdaneo)}`);
                        talk(`지명봇 정보 (단어): ${tm(wL.helpwlaudbotinfo)}`);
                        break;
                    default:
                        talk(tm(wL.nohelp));
                };
            };
            /**
            if (isFirstMsg("주사위 ")) {
                let a = Number(noFirstMsg("주사위 "));
                a % 1 == 0 && a > 0 && a < 1000000000000
                ? talk(`${dice(noFirstMsg("주사위 "))}${tm(wL.dice)}`)
                : talk(tm(wL.dicesidesrange));
            }
            
            if (isFirstMsg("따라해 ")) {
                talk(noFirstMsg("따라해 "));
            }
            
            if (isFirstMsg("도박 ")) {
                let userMoney = userDB[userName].money;
                switch (noFirstMsg("도박 ")) {
                    case "올인":
                        if (userMoney < 1000) {
                            talk(tm(wL.mmoney));
                        } else if (Math.floor(2*Math.random()) == 0) {
                            talk(`${tm(wL.gamblwin)} ${userName}${tm(wL.nim)}의 돈: ${userMoney * 2}원 (+${userMoney}원)`);
                            userDB[userName].money *= 2;
                            setUserDB();
                        } else {
                            talk(`${tm(wL.gambllose)} ${userName}${tm(wL.nim)}의 돈: 0원 (-${userMoney}원)`);
                            userDB[userName].money = 0;
                            setUserDB();
                        };
                        break;
                    default:
                        let gamblmoney = Number(noFirstMsg("도박 "))
                        if (gamblmoney % 1 != 0) {
                            talk(tm(wL.notmoney));
                        } else if (gamblmoney < 1000) {
                            talk(tm(wL.mmoney));
                        } else if (gamblmoney > userDB[userName].money) {
                            talk(tm(wL.lessmoney));
                        } else if (Math.floor(2*Math.random()) == 0) {
                            talk(`${tm(wL.gamblwin)} ${userName}${tm(wL.nim)}의 돈: ${userMoney + gamblmoney}원 (+${gamblmoney}원)`);
                            userDB[userName].money += gamblmoney;
                            setUserDB();
                        } else {
                            talk(`${tm(wL.gambllose)} ${userName}${tm(wL.nim)}의 돈: ${userMoney - gamblmoney}원 (-${gamblmoney}원)`);
                            userDB[userName].money -= gamblmoney;
                            setUserDB();
                        }
                }
            };
            */
            
            if (isFirstMsg("정보 ")) {
                let infouser = userDB[noFirstMsg("정보 ")];
                if (typeof infouser !== undefined) {
                    talk(`${infouser.name}${tm(wL.nim)}의 정보`);
                    talk(`돈: ${infouser.money}원`);
                } else {
                    talk(tm(wL.infono));
                };
            };

            if (isFirstMsg("모드 ")) {
                switch (noFirstMsg("모드 ")) {
                    case "반모":
                        userDB[userName].talkmode = "banmo"
                        setUserDB();
                        talk(tm(wL.tmupdate));
                        break;
                    case "존모":
                        if (userDB[userName].havejonmo == true) {
                            userDB[userName].talkmode = "jonmo"
                            setUserDB();
                            talk(tm(wL.tmupdate));
                        } else {
                            talk(tm(wL.nohave));
                        };
                        break;
                    default:
                        talk(tm(wL.notm));
                };
            };
            
            if (isFirstMsg("구입 ")) {
                switch (noFirstMsg("구입 ")) {
                    case "존모":
                        if (userDB[userName].havejonmo == true) {
                            talk(tm(wL.alreadybuy));
                        } else {
                            if (userDB[userName].money < 5000) {
                                talk(tm(wL.nomoney));
                            } else {
                                userDB[userName].money -= 5000;
                                userDB[userName].havejonmo = true;
                                talk(tm(wL.buy));
                                setUserDB();
                            };
                        };
                        break;
                    default:
                        talk(tm(wL.noitem));
                };
            };

            if (isFirstMsg("지명봇 ")) {
                switch (noFirstMsg("지명봇 ").split(' ')[0]) {
                    case "단어":
                        let wlaudbotWord = noFirstMsg("지명봇 단어 ").split(' ')[0];
                        let wlaudbotWordMean = noFirstMsg("지명봇 단어 " + wlaudbotWord);
                        if(wlaudbotWordMean != '') {
                            if (!(wlaudbotWord in wlaudDB)) {
                                wlaudDB[wlaudbotWord] = {
                                title: wlaudbotWordMean,
                                teachername: userName,
                                time: `${date.getFullYear()}년 ${date.getMonth()+1}월 ${date.getDate()}일 ${date.getHours()}시 ${date.getMinutes()}분 ${date.getSeconds()}초`,
                                };
                                setwlaudDB();
                                talk(tm(wL.wlauddaneook));
                            } else {
                                talk(tm(wL.wlaudalready));
                            };
                        } else {
                            talk(tm(wL.wlaudempty));
                        };
                        break;
                    case "삭제":
                        let wlaudbotDeleteWord = noFirstMsg("지명봇 삭제 ");
                        if(wlaudbotDeleteWord in wlaudDB) {
                            if(wlaudDB[wlaudbotDeleteWord].teachername == userName || isWlaud) {
                                delete wlaudDB[wlaudbotDeleteWord];
                                setwlaudDB();
                                talk(tm(wL.wlauddeleteok));
                            } else {
                                talk(tm(wL.wlaudcantdelete));
                            };
                        } else {
                            talk(tm(wL.wlaudno));
                        };
                        break;
                    case "정보":
                        let wlaudbotInfoWord = noFirstMsg("지명봇 정보 ");
                        if (wlaudbotInfoWord in wlaudDB) {
                            switch (userDB[wlaudDB[wlaudbotInfoWord].teachername].talkmode) {
                                case "banmo":
                                    talk(`알려준 놈: ${wlaudDB[wlaudbotInfoWord].teachername}`);
                                    talk(`알려준 시간: ${wlaudDB[wlaudbotInfoWord].time}`);
                                    break;
                                case "jonmo":
                                    talk(`알려주신 분: ${wlaudDB[wlaudbotInfoWord].teachername}`);
                                    talk(`알려주신 시간: ${wlaudDB[wlaudbotInfoWord].time}`);
                                    break;
                                default:
                                    talk(`알려준 놈: ${wlaudDB[wlaudbotInfoWord].teachername}`);
                                    talk(`알려준 시간: ${wlaudDB[wlaudbotInfoWord].time}`);
                            };
                        } else {
                            talk(tm(wL.wlaudno));
                        };
                        break;
                    default:
                        noFirstMsg("지명봇 ") in wlaudDB
                        ? talk(wlaudDB[noFirstMsg("지명봇 ")].title.replace(/\[이름\]/g, userName))
                        : talk(tm(wL.wlaudno));
                }
            };
        };

        if (isWlaud) {
            /**if (isFirstMsg("드루와 ")) {
                if (!global.data.place) $(`#room-${noFirstMsg("드루와 ")}`).trigger('click');
            };
            
            if (isMsg("훠이")) {
                if (global.data.place) $("#ExitBtn").trigger('click');
            };
            
            if (isMsg("핫하 죽어라")) {
                talk("크아아아악");
                life = false;
            };
            
            if (isMsg("어이 살아라")) {
                talk("지옥에서 돌아왔다...");
                life = true;
            };*/
        };
    }
});

observer.observe(targetNode, config);